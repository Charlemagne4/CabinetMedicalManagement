"use client";
import { DEFAULT_LIMIT } from "@/constants";
import { api } from "@/trpc/react";
import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";
import { logger } from "@/utils/pino";
import { toast } from "sonner";
import { DataTable } from "@/modules/main/components/ui/DataTable";
import { columns } from "@/modules/main/components/ui/Columns";

function CreditsSection() {
  return (
    <Suspense fallback={<p>Loading Credits...</p>}>
      <ErrorBoundary fallback={<p>Error in Credits</p>}>
        <CreditsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
}
export default CreditsSection;

function CreditsSectionSuspense() {
  const [entries, query] = api.entries.getCredits.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    { getNextPageParam: (page) => page.nextCursor },
  );

  if (query.isError) {
    toast.error("An unknown error occurred");
  }

  const items = entries.pages.flatMap((page) => page.items);
  logger.warn(items);
  return (
    <DataTable columns={columns} data={items} InfiniteScrollProps={query} />
  );
}
