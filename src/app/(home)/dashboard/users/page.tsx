import { DEFAULT_LIMIT } from "@/constants";
import UsersView from "@/modules/users/Views/UsersView";
import { api, HydrateClient } from "@/trpc/server";

export const dynamic = "force-dynamic";

function page() {
  void api.users.getMany.prefetchInfinite({ limit: DEFAULT_LIMIT });
  return (
    <div>
      <HydrateClient>
        <UsersView />
      </HydrateClient>
    </div>
  );
}
export default page;
