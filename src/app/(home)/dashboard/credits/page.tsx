import { DEFAULT_LIMIT } from "@/constants";
import CreditsView from "@/modules/Entries/views/creditsView";
import { api, HydrateClient } from "@/trpc/server";

export const dynamic = "force-dynamic";

function page() {
  void api.entries.getCredits.prefetchInfinite({ limit: DEFAULT_LIMIT });

  return (
    <HydrateClient>
      <CreditsView />
    </HydrateClient>
  );
}
export default page;
