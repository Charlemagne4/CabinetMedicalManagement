"use client";
import InfiniteScroll from "@/components/InfiniteScroll";
import { DEFAULT_LIMIT } from "@/constants";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";
import OperationRow from "../components/ui/OperationRow";

function OperationsSection() {
  return (
    <Suspense fallback={<p>Loading operations...</p>}>
      <ErrorBoundary fallback={<p>Error in Operations</p>}>
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
  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-4">
          <div>{"Entrée"}</div>

          <div>{"Montant"}</div>
          <div>{"date"}</div>
          <div>{"userId"}</div>
        </div>
        {entries.pages
          .flatMap((page) => page.items)
          .map((entry) => (
            <OperationRow key={entry.id} entry={entry} />
          ))}
      </div>
      <InfiniteScroll isManual={false} {...query} />
    </div>
  );
}
