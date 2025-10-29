import { LayoutDashboard } from "lucide-react";
import ActivitySection from "../sections/ActivitySection";
import ChartSection from "../sections/ChartSection";
import SummarySection from "../sections/SummarySection";
import SectionHeader from "@/components/SectionHeader";

function DashboardView() {
  return (
    <div>
      <div className="p-4">
        <SectionHeader
          icon={LayoutDashboard}
          title="Dashboard"
          description="Gérez les comptes et statuts des utilisateurs."
        />
      </div>
      <div className="flex h-auto w-full flex-wrap gap-4 p-4">
        <SummarySection />
        <ChartSection />
        <ActivitySection />
      </div>
    </div>
  );
}
export default DashboardView;
