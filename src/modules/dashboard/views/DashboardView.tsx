import { LayoutDashboard } from "lucide-react";
import ActivitySection from "../sections/ActivitySection";
import ChartSection from "../sections/ChartSection";
import SummarySection from "../sections/SummarySection";
import SectionHeader from "@/components/SectionHeader";

function DashboardView() {
  return (
    <div className="mx-auto mb-10 flex max-w-[2400px] min-w-full flex-col gap-y-6 px-4 pt-2.5">
      <SectionHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description="Anaylisez les données de votre cabinet"
      />
      <div className="flex h-auto w-full flex-wrap gap-4">
        <SummarySection />
        <ChartSection />
        <ActivitySection />
      </div>
    </div>
  );
}
export default DashboardView;
