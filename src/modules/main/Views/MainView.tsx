import OperationsSection from "../sections/OperationsSection";
import { type Role } from "@prisma/client";
import AdminOperationsSection from "../sections/AdminOperationsSection";

interface MainViewProps {
  role: Role;
}

function MainView({ role }: MainViewProps) {
  if (role === "admin")
    return (
      <div className="mx-auto mb-10 flex max-w-[2400px] flex-col gap-y-6 px-4 pt-2.5">
        <div>session data: shift, recette actuelle, sort...</div>
        <AdminOperationsSection />
      </div>
    );

  return (
    <div className="mx-auto mb-10 flex max-w-[2400px] flex-col gap-y-6 px-4 pt-2.5">
      <div>session data: shift, recette actuelle, sort...</div>
      <OperationsSection />
    </div>
  );
}
export default MainView;
