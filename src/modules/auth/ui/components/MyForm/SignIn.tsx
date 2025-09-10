"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import MyForm from "./MyForm";
import { signInFormSchema as formSchema } from "./Schema";
import { useEffect, useState } from "react";
import { redirect, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
// import { logger } from "@/utils/pino";

// interface Props {
//   searchParams: Record<string, string | string[] | undefined>;
// }

export function SignIn() {
  const searchParams = useSearchParams();

  // Safely get callbackUrl from the query parameters

  const { data: session, status } = useSession();
  if (session) {
    redirect("/");
  }
  const [error, setError] = useState<string>();
  const callbackUrl = decodeURIComponent(
    searchParams?.get("callbackUrl") ?? "/",
  );

  const searchParamsInstance = useSearchParams();
  const authError = searchParamsInstance.get("error");

  useEffect(() => {
    if (authError) {
      if (authError === "OAuthAccountNotLinked") {
        setError("That email is already linked to another provider.");
      } else {
        setError(`Sign in error: ${authError}`);
      }
      // logger.info(authError);
    }
  }, [authError]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirectTo: "http://localhost:3000/main",
      });
    } catch (err) {
      // logger.error(err);
      if (err instanceof Error) setError(err.message || "Login failed");
    }
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

  if (status === "unauthenticated") {
    return (
      <div className="">
        <div className="rounded">
          <h1>Sign In</h1>
          <Form {...form}>
            {/* <div className="mb-4 flex gap-20">
              <Button onClick={() => signIn('github', { callbackUrl: callbackUrl })}>
                Sign in with GitHub
              </Button>
              <Button onClick={() => signIn('discord', { callbackUrl: callbackUrl })}>
                Sign in with Discord
              </Button>
            </div> */}

            <MyForm form={form} onSubmit={onSubmit} />
          </Form>
          {error && <h6 className="bg-red-600 p-2 text-white">{error}</h6>}
        </div>
      </div>
    );
  }
  // logger.info(session?.user?.role);
}

export default SignIn;
