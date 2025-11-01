import SignIn from "@/modules/auth/ui/components/MyForm/SignIn";
import { Suspense } from "react";

function page() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-80">
        <Suspense fallback={<p>Error signup...</p>}>
          <SignIn />
        </Suspense>
      </div>
    </div>
  );
}
export default page;
