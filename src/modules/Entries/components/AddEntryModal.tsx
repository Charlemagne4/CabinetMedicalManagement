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
      onSuccess: async () => {
        toast.success("Entrée Crée");
        await utils.entries.invalidate();
        await utils.shifts.getCurrent.invalidate();
        await utils.shifts.invalidate();
        setEntryModalOpen((prev) => !prev);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  return (
    <>
      <ResponsiveModal
        title="Upload a video"
        open={entryModalOpen}
        onOpenChange={(open) => {
          setEntryModalOpen(open); // keeps modal state in sync
          if (!open) {
            create.reset(); // reset mutation when closing
          }
        }}
      >
        <AddEntryForm />
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
