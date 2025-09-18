import { DEFAULT_LIMIT } from "@/constants";
import MainView from "@/modules/main/Views/MainView";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";

export const dynamic = "force-dynamic";

async function main() {
  const session = await auth();
  void api.entries.getMany.prefetchInfinite({
    userId: session?.user.id,
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <MainView />
    </HydrateClient>
  );
}
export default main;
