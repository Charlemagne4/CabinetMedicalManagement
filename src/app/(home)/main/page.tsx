import { DEFAULT_LIMIT } from "@/constants";
import MainView from "@/modules/main/Views/MainView";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { logger } from "@/utils/pino";

export const dynamic = "force-dynamic";

async function main() {
  const session = await auth();
  logger.debug(session?.user.role);
  if (session?.user.role === "admin") {
    void api.shifts.getMany.prefetchInfinite({
      limit: DEFAULT_LIMIT,
    });
  } else {
    void api.entries.getMany.prefetchInfinite({
      limit: DEFAULT_LIMIT,
    });
  }

  return (
    <HydrateClient>
      <MainView role={session?.user.role ?? "user"} />
    </HydrateClient>
  );
}
export default main;
