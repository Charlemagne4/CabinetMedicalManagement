"use client";

import { type z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DepenseCreateSchema as DepenseSchema } from "@/types/Entries";

type DepenseFormValues = z.infer<typeof DepenseSchema>;

function DepenseForm() {
  const utils = api.useUtils();
  const create = api.entries.create.useMutation({
    onSuccess: async () => {
      toast.success("Dépense ajoutée ✅");
      await utils.entries.invalidate();
      reset();
    },
    onError: () => toast.error("Erreur ❌"),
  });

  const {
    register,
    handleSubmit,
    reset,
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
      entry: { ...values, type: "DEPENSE" },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded border p-4"
    >
      <div>
        <label className="block text-sm font-medium">Libellé</label>
        <Input {...register("label")} placeholder="Ex: Fournitures" />
        {errors.label && (
          <p className="text-sm text-red-500">{errors.label.message}</p>
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

      {/* shiftId est caché car déjà fourni */}
      <input type="hidden" {...register("shiftId")} />

      <Button type="submit" disabled={isSubmitting || create.isPending}>
        {isSubmitting || create.isPending ? "Ajout..." : "Ajouter dépense"}
      </Button>
    </form>
  );
}

export default DepenseForm;
