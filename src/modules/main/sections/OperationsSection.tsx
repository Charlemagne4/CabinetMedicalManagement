"use client";
import { DEFAULT_LIMIT } from "@/constants";
import { api } from "@/trpc/react";
import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";
import { DataTable } from "../components/ui/DataTable";
import { columns } from "../components/ui/Columns";
import { logger } from "@/utils/pino";
import { toast } from "sonner";
import { TrpcErrorFallback } from "@/components/TrpcErrorFallback";

function OperationsSection() {
  return (
    <Suspense fallback={<p>Loading operations...</p>}>
      <ErrorBoundary FallbackComponent={TrpcErrorFallback}>
        <OperationsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
}
export default OperationsSection;

function OperationsSectionSuspense() {
  const [entries, query] = api.entries.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    { getNextPageParam: (page) => page.nextCursor },
  );

  if (query.isError) {
    toast.error("An unknown error occurred");
  }

  if (entries.pages[0]?.reason === "NO_ACTIVE_SHIFT") {
    return <div>No active shift yet.</div>;
  }

  const items = entries.pages.flatMap((page) => page.items);
  logger.warn(items);
  return (
    <DataTable columns={columns} data={items} InfiniteScrollProps={query} />
  );
}
