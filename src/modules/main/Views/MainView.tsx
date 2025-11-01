import OperationsSection from "../sections/OperationsSection";
import { type Role } from "@prisma/client";
import AdminOperationsSection from "../sections/AdminOperationsSection";
import { Clock, Workflow } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

interface MainViewProps {
  role: Role;
}

function MainView({ role }: MainViewProps) {
  if (role === "admin")
    return (
      <div className="mx-auto mb-10 flex max-w-[2400px] min-w-full flex-col gap-y-6 px-4 pt-2.5">
        <SectionHeader
          icon={Clock}
          title="Shifts"
          description="Consultez les horaires, les operations et les périodes d’activité du personnel."
        />
        <AdminOperationsSection />
      </div>
    );

  return (
    <div className="mx-auto mb-10 flex max-w-[2400px] min-w-full flex-col gap-y-6 px-4 pt-2.5">
      <SectionHeader
        icon={Workflow}
        title="Opérations"
        description="les transactions et les activités clés du système."
      />
      <OperationsSection />
    </div>
  );
}
export default MainView;
