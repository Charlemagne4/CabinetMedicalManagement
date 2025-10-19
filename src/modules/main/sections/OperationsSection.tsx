"use client";
import InfiniteScroll from "@/components/InfiniteScroll";
import { DEFAULT_LIMIT } from "@/constants";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";
import OperationRow from "../components/ui/OperationRow";
import { DataTable } from "../components/ui/DataTable";
import { columns } from "../components/ui/Columns";

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

  if (entries.pages[0]?.reason === "NO_ACTIVE_SHIFT") {
    return <div>No active shift yet.</div>;
  }

  const items = entries.pages.flatMap((page) => page.items);
  return (
    <div>
      <DataTable columns={columns} data={items} />
      {/* <div className="flex flex-col gap-2 md:w-[70vw]">
        <div className="grid grid-cols-4 gap-x-4 border-b py-2">
          <div>{"Entrée"}</div>
          <div>{"Montant"}</div>
          <div>{"date"}</div>
          <div>{"userId"}</div>
        </div>
        {items.length === 0 ? (
          <div className="text-muted-foreground py-4 text-center">
            Aucun enregistrement pour ce shift
          </div>
        ) : (
          items.map((entry) => <OperationRow key={entry.id} entry={entry} />)
        )}
      </div> */}
      <InfiniteScroll isManual={false} {...query} />
    </div>
  );
}
