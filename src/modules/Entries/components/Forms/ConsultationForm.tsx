"use client";

import { type z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ConsultationCreateSchema as ConsultationSchema } from "@/types/Entries";

type ConsultationFormValues = z.infer<typeof ConsultationSchema>;

function ConsultationForm() {
  // 2️⃣ Mutation TRPC
  const utils = api.useUtils();
  const create = api.entries.create.useMutation({
    onSuccess: async () => {
      toast.success("Consultation ajoutée ✅");
      await utils.entries.invalidate(); // recharger la liste
      reset();
    },
    onError: () => toast.error("Erreur lors de l'ajout ❌"),
  });

  // 3️⃣ Hook form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConsultationFormValues>({
    resolver: zodResolver(ConsultationSchema),
    defaultValues: {
      patient: "",
      amount: 0,
    },
  });

  // 4️⃣ Soumission
  const onSubmit = (values: ConsultationFormValues) => {
    create.mutate({
      entry: { ...values, type: "CONSULTATION" },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="min-w-80 space-y-4 rounded border p-4"
    >
      <div>
        <label className="block text-sm font-medium">Patient</label>
        <Input {...register("patient")} placeholder="Nom du patient" />
        {errors.patient && (
          <p className="text-sm text-red-500">{errors.patient.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Montant</label>
        <Input
          type="number"
          step="0.01"
          {...register("amount", { valueAsNumber: true })}
        />
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting || create.isPending}>
        {isSubmitting || create.isPending ? "Ajout..." : "Ajouter"}
      </Button>
    </form>
  );
}

export default ConsultationForm;
