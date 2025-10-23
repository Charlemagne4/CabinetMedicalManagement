"use client";

import { Button } from "@/components/ui/button";

import { toast } from "sonner";

import { api } from "@/trpc/react";
import ResponsiveModal from "@/components/ResponsiveModal";
import { useState } from "react";
import AddEntryForm from "./AddEntryForm";

function AddEntryModal() {
  const utils = api.useUtils();
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const create = api.entries.create.useMutation({
    onSuccess: async ({ shiftId }) => {
      toast.success("Entrée créée");
      await Promise.all([
        utils.entries.invalidate(),
        utils.entries.getMany.invalidate(),
        utils.shifts.getCurrent.invalidate(),
        utils.shifts.getMany.invalidate(),
        utils.shifts.getShiftOperations.invalidate({ shiftId }),
      ]);
      setEntryModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <>
      <ResponsiveModal
        title="Entrez une operation"
        open={entryModalOpen}
        onOpenChange={(open) => {
          setEntryModalOpen(open); // keeps modal state in sync
          if (!open) {
            create.reset(); // reset mutation when closing
          }
        }}
      >
        <AddEntryForm create={create} />
      </ResponsiveModal>
      <Button
        variant={"secondary"}
        onClick={() => setEntryModalOpen(true)}
        disabled={create.isPending}
      >
        Create
      </Button>
    </>
  );
}
export default AddEntryModal;
