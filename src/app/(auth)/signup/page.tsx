import SignUp from "@/modules/auth/ui/components/MyForm/SignUp";

function signup() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-80">
        <SignUp />
      </div>
    </div>
  );
}
export default signup;
