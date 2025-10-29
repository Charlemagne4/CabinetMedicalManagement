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
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import AdminDataTable from "../components/AdminDataTable";

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
    <Accordion type="single" className="w-full">
      {items.length === 0 ? (
        <div className="text-muted-foreground py-4 text-center">
          Aucun enregistrement pour ce shift
        </div>
      ) : (
        items.map((shift) => (
          <AccordionItem value={shift.id} key={shift.id} className="w-full">
            <AccordionTrigger>
              <div className="flex w-full justify-between text-sm">
                <span>
                  {shift.template.name} — {shift.user.name}
                </span>
                <span>
                  {shift.startTime.toLocaleDateString("fr-FR")} |{" "}
                  {shift.recettes?.totalAmount?.toLocaleString("fr-FR")} DA
                </span>
              </div>
            </AccordionTrigger>

            <AccordionContent className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p>
                  <strong>Début :</strong>{" "}
                  {shift.startTime.toLocaleString("fr-FR")}
                </p>
                <p>
                  <strong>Fin :</strong>{" "}
                  {shift.endTime
                    ? shift.endTime.toLocaleString("fr-FR")
                    : "En cours"}
                </p>
                <p>
                  <strong>Employé :</strong> {shift.user.name}
                </p>
                <p>
                  <strong>Fond de caisse :</strong>{" "}
                  {shift.cashFund?.amount ?? 0} DA
                </p>
                <p>
                  <strong>Recettes :</strong> {shift.recettes?.totalAmount ?? 0}{" "}
                  DA
                </p>
                <p>
                  <strong>Dépenses :</strong>{" "}
                  {shift.expenses?.reduce((a, e) => a + e.amount, 0) ?? 0} DA
                </p>
              </div>

              <AdminDataTable shift={shift} query={query} />
            </AccordionContent>
          </AccordionItem>
        ))
      )}
      <InfiniteScroll isManual={false} {...query} />
    </Accordion>
  );
}
