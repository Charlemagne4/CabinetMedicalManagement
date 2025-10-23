"use client";

import { type z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DepenseCreateSchema as DepenseSchema } from "@/types/Entries";
import type { EntryFormsProps } from "../AddEntryForm";

type DepenseFormValues = z.infer<typeof DepenseSchema>;

function DepenseForm({ create }: EntryFormsProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DepenseFormValues>({
    resolver: zodResolver(DepenseSchema),
    defaultValues: {
      label: "",
      amount: 0,
    },
  });

  const onSubmit = (values: DepenseFormValues) => {
    create.mutate({
      entry: { ...values, Entrytype: "DEPENSE" },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full min-w-80 flex-col space-y-6 rounded-md p-2"
    >
      {/* Label */}
      <div className="flex flex-col space-y-2">
        <Label htmlFor="label">Libellé</Label>
        <Input
          id="label"
          {...register("label")}
          placeholder="Ex : Fournitures"
        />
        {errors.label && (
          <p className="text-sm text-red-500">{errors.label.message}</p>
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

      {/* Hidden shiftId */}
      <input type="hidden" {...register("shiftId")} />

      {/* Submit */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || create.isPending}
      >
        {isSubmitting || create.isPending ? "Ajout..." : "Ajouter dépense"}
      </Button>
    </form>
  );
}

export default DepenseForm;
