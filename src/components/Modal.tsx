"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "./ui/dialog";

type ModalProps = {
  children: React.ReactNode;
};

export default function Modal({ children }: ModalProps) {
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return (
    <Dialog defaultOpen open onOpenChange={() => router.back()}>
      <DialogOverlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/40" />
      <DialogContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] bg-background fixed top-[50%] left-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200">
        <DialogTitle className="text-lg font-semibold">SIGN IN</DialogTitle>
        <div className="max-h-[80vh] overflow-y-auto">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
