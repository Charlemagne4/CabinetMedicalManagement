"use client";
import { DEFAULT_LIMIT } from "@/constants";
import { DataTable } from "@/modules/main/components/ui/DataTable";
import { UsersColumn } from "@/modules/main/components/ui/UsersColumn";
import { api } from "@/trpc/react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

function UsersSection() {
  return (
    <Suspense fallback={<p>Loading operations...</p>}>
      <ErrorBoundary fallback={<p>Error in Operations</p>}>
        <UsersSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
}
export default UsersSection;

function UsersSectionSuspense() {
  const [users, query] = api.users.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    { getNextPageParam: (page) => page.nextCursor },
  );

  const items = users.pages.flatMap((page) => page.items);

  return (
    <div>
      <DataTable
        columns={UsersColumn}
        data={items}
        InfiniteScrollProps={query}
      />
    </div>
  );
}
