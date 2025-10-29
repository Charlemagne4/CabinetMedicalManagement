import ActivitySection from "../sections/ActivitySection";
import ChartSection from "../sections/ChartSection";
import SummarySection from "../sections/SummarySection";

function DashboardView() {
  return (
    <div>
      <h1 className="p-4 text-4xl md:p-16">Dashboard</h1>
      <div className="flex h-auto w-full flex-wrap gap-4 p-4">
        <SummarySection />
        <ChartSection />
        <ActivitySection />
      </div>
    </div>
  );
}
export default DashboardView;
