import { DEFAULT_LIMIT } from "@/constants";
import MainView from "@/modules/main/Views/MainView";
import { getCurrentShift } from "@/modules/shifts/functions/StartShiftOnLogin";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";

export const dynamic = "force-dynamic";

async function main() {
  const session = await auth();
  const shift = await getCurrentShift();
  void api.entries.getMany.prefetchInfinite({
    userId: session?.user.id,
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <MainView shift={shift} />
    </HydrateClient>
  );
}
export default main;
