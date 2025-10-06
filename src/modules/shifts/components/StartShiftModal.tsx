"use client";

import ResponsiveModal from "@/components/ResponsiveModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { PlusIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

function StartShiftModal() {
  const { data: currentShift } = api.shifts.getCurrent.useQuery();
  const { data: session, status } = useSession();

  const utils = api.useUtils();
  const [shiftStartModalOpen, setShiftStartModalOpen] = useState(false);
  const [cashFund, setCashFund] = useState("");

  const create = api.shifts.create.useMutation({
    onSuccess: async () => {
      toast.success("Shift créé !");
      await utils.entries.invalidate();
      setShiftStartModalOpen(false);
      setCashFund("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (status === "loading") return <Skeleton />;
  if (status === "unauthenticated") return null;

  if (currentShift?.userId === session?.user.id) return null;

  return (
    <>
      <ResponsiveModal
        title="Commencer un nouveau shift"
        open={shiftStartModalOpen}
        onOpenChange={(open) => {
          setShiftStartModalOpen(open);
          if (!open) create.reset();
        }}
      >
        <form
          className="flex flex-col gap-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate({ cashfund: Number(cashFund) });
          }}
        >
          <div>
            <Label htmlFor="cashfund">Montant caisse</Label>
            <Input
              id="cashfund"
              type="number"
              value={cashFund}
              onChange={(e) => setCashFund(e.target.value)}
              placeholder="Ex: 2000"
            />
          </div>

          <div className="flex justify-between">
            <Button
              variant="destructive"
              type="button"
              onClick={() => setShiftStartModalOpen(false)}
            >
              Non
            </Button>
            <Button
              variant="secondary"
              type="submit"
              disabled={create.isPending || !cashFund}
            >
              Oui
            </Button>
          </div>
        </form>
      </ResponsiveModal>

      <Button
        variant="default"
        onClick={() => setShiftStartModalOpen(true)}
        disabled={create.isPending}
      >
        <PlusIcon className="mr-2 h-4 w-4" />
        Commencer shift
      </Button>
    </>
  );
}

export default StartShiftModal;
