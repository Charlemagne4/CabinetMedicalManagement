import type { Prisma } from "@prisma/client";
import { columns } from "./ui/Columns";
import { DataTable } from "./ui/DataTable";
import type { InfiniteScrollProps } from "@/components/InfiniteScroll";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { api } from "@/trpc/react";
import { DEFAULT_LIMIT } from "@/constants";
import { logger } from "@/utils/pino";

interface AdminDataTableProps {
  query: InfiniteScrollProps;
  shift: Prisma.ShiftGetPayload<{
    include: {
      Operations: {
        include: {
          Shift: true;
          Consultation: { include: { credit: true } };
          user: {
            select: { name: true; role: true; email: true; id: true };
          };
        };
      };
      user: true;
    };
  }>;
}

function AdminDataTable({ shift, query }: AdminDataTableProps) {
  return (
    <Suspense fallback={<p>Loading Admin operations...</p>}>
      <ErrorBoundary fallback={<p>Error in Admin Operations</p>}>
        <AdminDataTableSuspence shift={shift} query={query} />
      </ErrorBoundary>
    </Suspense>
  );
}
export default AdminDataTable;

function AdminDataTableSuspence({ shift }: AdminDataTableProps) {
  const opQuery = api.shifts.getShiftOperations.useInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
      shiftId: shift.id,
    },
    { getNextPageParam: (page) => page.nextCursor },
  );

  // Flatten pages of results (if any)
  const paginatedOps = opQuery.data?.pages.flatMap((page) => page.items) ?? [];

  // Merge initial + new ones, removing duplicates
  const items = mergeUnique(shift.Operations, paginatedOps);
  logger.warn(items);
  return (
    <DataTable
      InfiniteScrollProps={{ ...opQuery, isManual: true }}
      columns={columns}
      data={items}
    />
  );
}
import { type entry } from "../components/ui/Columns";
function mergeUnique<T extends entry>(a: T[], b: T[]) {
  const map = new Map<string, T>();
  [...a, ...b].forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}
