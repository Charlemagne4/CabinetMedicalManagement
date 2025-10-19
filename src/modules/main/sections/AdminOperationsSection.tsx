"use client";
import InfiniteScroll from "@/components/InfiniteScroll";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DEFAULT_LIMIT } from "@/constants";
import { api } from "@/trpc/react";
import { logger } from "@/utils/pino";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import OperationRow from "../components/ui/OperationRow";

function AdminOperationsSection() {
  return (
    <Suspense fallback={<p>Loading operations...</p>}>
      <ErrorBoundary fallback={<p>Error in Operations</p>}>
        <AdminOperationsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
}
export default AdminOperationsSection;

function AdminOperationsSectionSuspense() {
  const [shifts, query] = api.shifts.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    { getNextPageParam: (page) => page.nextCursor },
  );

  const items = shifts.pages.flatMap((page) => page.items);

  return (
    <div>
      <Accordion type="multiple" className="w-[80vw]">
        {items.length === 0 ? (
          <div className="text-muted-foreground py-4 text-center">
            Aucun enregistrement pour ce shift
          </div>
        ) : (
          items.map((shift) => (
            <AccordionItem value={shift.id} key={shift.id}>
              <AccordionTrigger>
                {shift.startTime.toDateString()} -{shift.recettes?.totalAmount}
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                {shift.Operations.map((operation) => (
                  <OperationRow entry={operation} key={operation.id} />
                ))}
              </AccordionContent>
            </AccordionItem>
          ))
        )}
        <InfiniteScroll isManual={false} {...query} />
      </Accordion>
    </div>
  );
}
