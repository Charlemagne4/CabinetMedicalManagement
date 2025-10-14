import { DEFAULT_LIMIT } from "@/constants";
import MainView from "@/modules/main/Views/MainView";
import { getCurrentShift } from "@/modules/shifts/functions/StartShiftOnLogin";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";

export const dynamic = "force-dynamic";

async function main() {
  void api.entries.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <MainView />
    </HydrateClient>
  );
}
export default main;
