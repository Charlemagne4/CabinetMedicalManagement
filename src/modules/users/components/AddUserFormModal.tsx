"use client";
import ResponsiveModal from "@/components/ResponsiveModal";
import { Button } from "@/components/ui/button";
import SignUp from "@/modules/auth/ui/components/MyForm/SignUp";
import { useState } from "react";

function AddUserFormModal() {
  const [entryModalOpen, setEntryModalOpen] = useState(false);

  return (
    <>
      <ResponsiveModal
        title="Ajouter Utilisateur"
        open={entryModalOpen}
        onOpenChange={(open) => {
          setEntryModalOpen(open); // keeps modal state in sync
          if (!open) {
            // create.reset(); // reset mutation when closing
          }
        }}
      >
        <SignUp
          setEntryModalOpen={setEntryModalOpen}
          // create={create}
        />
      </ResponsiveModal>
      <Button
        variant={"secondary"}
        onClick={() => setEntryModalOpen(true)}
        // disabled={create.isPending}
      >
        Ajouter Utilisateur
      </Button>
    </>
  );
}
export default AddUserFormModal;
