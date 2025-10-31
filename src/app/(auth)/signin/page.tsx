import SignIn from "@/modules/auth/ui/components/MyForm/SignIn";

function page() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-80">
        <SignIn />
      </div>
    </div>
  );
}
export default page;
