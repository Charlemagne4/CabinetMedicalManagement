import SignUp from "@/modules/auth/ui/components/MyForm/SignUp";
import { Suspense } from "react";

function signup() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-80">
        <Suspense fallback={<p>Error signup...</p>}>
          <SignUp />
        </Suspense>
      </div>
    </div>
  );
}
export default signup;
