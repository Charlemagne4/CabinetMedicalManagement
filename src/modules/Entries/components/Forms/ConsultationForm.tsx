"use client";

import { type z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ConsultationCreateSchema as ConsultationSchema } from "@/types/Entries";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

type ConsultationFormValues = z.infer<typeof ConsultationSchema>;

function ConsultationForm() {
  const utils = api.useUtils();
  const create = api.entries.create.useMutation({
    onSuccess: async () => {
      toast.success("Consultation ajoutée ✅");
      await utils.entries.invalidate();
      reset();
    },
    onError: () => toast.error("Erreur lors de l'ajout ❌"),
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConsultationFormValues>({
    resolver: zodResolver(ConsultationSchema),
    defaultValues: {
      credit: false,
      patient: "",
      amount: 0,
      type: "CONSULTATION",
    },
  });

  const onSubmit = (values: ConsultationFormValues) => {
    create.mutate({
      entry: { ...values, Entrytype: "CONSULTATION" },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full min-w-80 flex-col space-y-6 rounded-md p-2"
    >
      {/* Patient */}
      <div className="flex flex-col space-y-2">
        <Label htmlFor="patient">Patient</Label>
        <Input
          id="patient"
          {...register("patient")}
          placeholder="Nom du patient"
        />
        {errors.patient && (
          <p className="text-sm text-red-500">{errors.patient.message}</p>
        )}
      </div>

      {/* Amount */}
      <div className="flex flex-col space-y-2">
        <Label htmlFor="amount">Montant</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          {...register("amount", { valueAsNumber: true })}
        />
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount.message}</p>
        )}
      </div>

      {/* Type */}
      <div className="flex flex-col space-y-2">
        <Label>Type</Label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CONSULTATION" id="r1" />
                <Label htmlFor="r1">Consultation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="BILAN" id="r2" />
                <Label htmlFor="r2">Bilan</Label>
              </div>
            </RadioGroup>
          )}
        />
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      {/* Credit */}
      <Controller
        name="credit"
        control={control}
        render={({ field }) => (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="credit"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            <Label htmlFor="credit">Crédit</Label>
          </div>
        )}
      />

      {/* Submit */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || create.isPending}
      >
        {isSubmitting || create.isPending ? "Ajout..." : "Ajouter"}
      </Button>
    </form>
  );
}

export default ConsultationForm;
