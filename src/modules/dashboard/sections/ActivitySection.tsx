"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

function ActivitySection() {
  return (
    <Suspense fallback={<p>Loading ActivitySection</p>}>
      <ErrorBoundary fallback={<p>Error loading ActivitySection</p>}>
        <ActivitySectionSuspence />
      </ErrorBoundary>
    </Suspense>
  );
}
export default ActivitySection;

function ActivitySectionSuspence() {
  const [summaryData] = api.entries.getActivitySummary.useSuspenseQuery();

  if (!summaryData) return <p>Aucune donnée disponible</p>;

  const {
    shiftName,
    startTime,
    totalRecettes,
    consultationsCount,
    balance,
    totalDepenses,
    creditsPaid,
    creditsAdded,
    netProfit,
    expectedProfit,
  } = summaryData;

  // Format date and time separately
  const date = new Date(startTime).toLocaleDateString("fr-DZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const time = new Date(startTime).toLocaleTimeString("fr-DZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Format currency to DZD
  const formatDZD = (value: number | null | undefined) =>
    value != null
      ? new Intl.NumberFormat("fr-DZ", {
          style: "currency",
          currency: "DZD",
          minimumFractionDigits: 0,
        }).format(value)
      : "–";

  return (
    <Card className="flex-1 lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-gray-700">
          Activité
        </CardTitle>
        <p className="text-xs text-gray-500">Shift en cours</p>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Nom du shift</span>
            <span>{shiftName || "–"}</span>
          </div>

          <div className="flex justify-between">
            <span>Date</span>
            <span>{date}</span>
          </div>

          <div className="flex justify-between">
            <span>Heure de début</span>
            <span>{time}</span>
          </div>

          <div className="flex justify-between">
            <span>Total des recettes</span>
            <span>{formatDZD(totalRecettes)}</span>
          </div>

          <div className="flex justify-between">
            <span>Total des dépenses</span>
            <span>{formatDZD(totalDepenses)}</span>
          </div>

          <div className="flex justify-between">
            <span>Consultations totales</span>
            <span>{consultationsCount ?? "–"}</span>
          </div>
          <div className="flex justify-between">
            <span>Bilan totales</span>
            <span>{"WIP"}</span>
          </div>

          <div className="flex justify-between">
            <span>Crédits ajoutés</span>
            <span>{formatDZD(creditsAdded)}</span>
          </div>

          <div className="flex justify-between">
            <span>Crédits payés</span>
            <span>{formatDZD(creditsPaid)}</span>
          </div>

          <div className="flex justify-between">
            <span>Recettes shift</span>
            <span>{formatDZD(balance)}</span>
          </div>

          <div className="flex justify-between">
            <span>Bénéfice net</span>
            <span>{formatDZD(netProfit)}</span>
          </div>

          <div className="flex justify-between">
            <span>Bénéfice attendu</span>
            <span>{formatDZD(expectedProfit)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
