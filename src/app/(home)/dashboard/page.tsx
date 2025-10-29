import DashboardView from "@/modules/dashboard/views/DashboardView";
import { api, HydrateClient } from "@/trpc/server";
export const dynamic = "force-dynamic";

function Dashboard() {
  void api.entries.getChartEntries.prefetch();
  void api.entries.getDashboardSummaryData.prefetch();
  void api.entries.getActivitySummary.prefetch();
  return (
    <div className="w-full overflow-auto">
      <HydrateClient>
        <DashboardView />
      </HydrateClient>
    </div>
  );
}
export default Dashboard;
