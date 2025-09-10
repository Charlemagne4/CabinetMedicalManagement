"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import MyForm from "./MyForm";
import { signUpFormSchema as formSchema } from "./Schema";
import { redirect, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";

import { toast } from "sonner";
import { Suspense } from "react";
import { api } from "@/trpc/react";

export function SignUp() {
  const { data: session, status } = useSession();
  const register = api.users.register.useMutation();

  const searchParams = useSearchParams();
  const callbackUrl = decodeURIComponent(
    searchParams?.get("callbackUrl") ?? "/",
  );

  if (session) {
    redirect("/");
  }

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit({
    email,
    name,
    password,
  }: z.infer<typeof formSchema>) {
    register.mutate(
      { email, password, username: name },
      {
        onSuccess: async () => {
          const res = await signIn("credentials", {
            email,
            password,
            callbackUrl: callbackUrl,
          });

        },
        onError: (error) => {
          toast.error(`Register failed: ${error.message}`);
          form.setError("root", { message: error.message });
        },
      },
    );
  }
  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense>
      <div className="">
        <h1>Sign Up</h1>
        <div className="rounded">
          <Form {...form}>
            <div className="mb-4 flex gap-20">
              <Button
                onClick={() => signIn("github", { callbackUrl: callbackUrl })}
              >
                Sign in with GitHub
              </Button>
              <Button
                onClick={() => signIn("discord", { callbackUrl: callbackUrl })}
              >
                Sign in with Discord
              </Button>
            </div>

            <MyForm form={form} onSubmit={onSubmit} />
          </Form>
        </div>
      </div>
    </Suspense>
  );
}

export default SignUp;
