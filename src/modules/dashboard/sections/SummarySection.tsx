"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { DollarSign, FileText, TrendingUp, Users } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

function SummarySection() {
  return (
    <Suspense fallback={<p>Loading Summary</p>}>
      <ErrorBoundary fallback={<p>Error loading Summary</p>}>
        <SummarySectionSuspence />
      </ErrorBoundary>
    </Suspense>
  );
}
export default SummarySection;

function SummarySectionSuspence() {
  const [summaryData] = api.entries.getDashboardSummaryData.useSuspenseQuery();
  const formattedRevenuesTotal = `${summaryData.revenueTotal.toLocaleString(
    "fr-FR",
    {
      style: "currency",
      currency: "DZD",
    },
  )}`;
  const formattedCreditsPayee = `${summaryData.creditsPayes.toLocaleString(
    "fr-FR",
    {
      style: "currency",
      currency: "DZD",
    },
  )}`;
  const formattedCreditsNonPayé = `${summaryData.creditsNonPayes.toLocaleString(
    "fr-FR",
    {
      style: "currency",
      currency: "DZD",
    },
  )}`;
  const formattedDepenses = `${summaryData.depensesTotal.toLocaleString(
    "fr-FR",
    {
      style: "currency",
      currency: "DZD",
    },
  )}`;
  const formattedExpectedProfit = `${summaryData.expectedProfit.toLocaleString(
    "fr-FR",
    {
      style: "currency",
      currency: "DZD",
    },
  )}`;
  const formattedNetProfit = `${summaryData.netProfit.toLocaleString("fr-FR", {
    style: "currency",
    currency: "DZD",
  })}`;
  return (
    <Card className="flex-2 lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-gray-700">
          Company Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>Revenue Total</span>
          </div>
          <span className="font-medium">{formattedRevenuesTotal}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span>Depenses Total</span>
          </div>
          <span className="font-medium">{formattedDepenses}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span>Crédits non payés</span>
          </div>
          <span className="font-medium">{formattedCreditsNonPayé}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span>Crédits payés</span>
          </div>
          <span className="font-medium">{formattedCreditsPayee}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span>Revenues optimiste</span>
          </div>
          <span className="font-medium">{formattedExpectedProfit}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span>Profit net</span>
          </div>
          <span className="font-medium">{formattedNetProfit}</span>
        </div>
      </CardContent>
    </Card>
  );
}
