import ResponsiveModal from "@/components/ResponsiveModal";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCopyToClipboard } from "usehooks-ts";
import { Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { resetPasswordSchema as formSchema } from "@/modules/auth/ui/components/MyForm/Schema";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function ResetUserPasswordModal({ userId }: { userId: string }) {
  const [entryModalOpen, setEntryModalOpen] = useState(false);

  const [newPasswordTocopy, setNewPassword] = useState<string | null>(null);
  const [, copyToClipboard] = useCopyToClipboard(); // from shadcn hook copy API :contentReference[oaicite:2]{index=2}
  const [copied, setCopied] = useState(false);
  const create = api.users.resetPassword.useMutation({
    onSuccess: async ({ newPassword }) => {
      toast.success("Mot de passe Attribué");
      //   setEntryModalOpen(false);
      setNewPassword(newPassword);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    // call your mutation
    create.mutate({ userId, password: data.newPassword });
  };

  return (
    <>
      <ResponsiveModal
        title="Entrez une nouvelle opération"
        open={entryModalOpen}
        onOpenChange={(open) => {
          setEntryModalOpen(open);
          if (!open) {
            form.reset(); // reset the form when closing
          }
          create.reset(); // reset mutation state
          setNewPassword(null);
        }}
      >
        {newPasswordTocopy ? (
          <div className="flex flex-col items-center gap-2">
            <div className="p-2">
              <span className="text-foreground text-lg">
                {newPasswordTocopy}
              </span>
              <Button
                size="icon"
                variant="link"
                onClick={async () => {
                  await copyToClipboard(newPasswordTocopy);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000); // reset icon after 2s
                }}
                aria-label={copied ? "Copié" : "Copier le mot de passe"}
              >
                {copied ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} />
                )}
              </Button>
            </div>
            <Alert variant="default">
              <AlertTitle>
                Mot de passe affiché – à copier immédiatement
              </AlertTitle>
              <AlertDescription>
                Ce mot de passe ne sera plus visible après la fermeture de cette
                fenêtre. **Veuillez le copier dès maintenant** et le conserver
                en lieu sûr.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <Form {...form}>
            <form className="space-y-6">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouveau mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={create.isPending}
                onClick={form.handleSubmit(onSubmit)}
              >
                {create.isPending ? "En cours…" : "Attribuer le mot de passe"}
              </Button>
            </form>
          </Form>
        )}
      </ResponsiveModal>

      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        variant={"default"}
        onClick={() => setEntryModalOpen(true)}
        disabled={create.isPending}
      >
        Nouveau Mot de Passe
      </DropdownMenuItem>
    </>
  );
}

export default ResetUserPasswordModal;
