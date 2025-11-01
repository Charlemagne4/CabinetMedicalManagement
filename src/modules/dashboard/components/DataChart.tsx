"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { api } from "@/trpc/react";

export const description = "A donut chart";

const chartConfig = {
  credits: { label: "Crédits", color: "var(--chart-1)" },
  bilans: { label: "Bilans", color: "var(--chart-2)" },
  consultations: { label: "Consultations", color: "var(--chart-3)" },
  depenses: { label: "Dépenses", color: "var(--chart-4)" },
} satisfies ChartConfig;

function DataChartSuspense() {
  const [chartData2] = api.entries.getChartEntries.useSuspenseQuery();

  // ✅ The data keys must match `dataKey` and `nameKey` props in <Pie>
  const chartData = [
    {
      entry: "credits",
      value: chartData2.unpaidCredits,
      fill: "var(--chart-3)",
    },
    { entry: "bilans", value: chartData2.bilan, fill: "var(--chart-1)" },
    {
      entry: "consultations",
      value: chartData2.consultations,
      fill: "var(--chart-2)",
    },
    { entry: "depenses", value: chartData2.depenses, fill: "var(--chart-5)" },
  ];

  return (
    <Card className="flex h-auto flex-col max-sm:min-w-[80vw]">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart - Donut</CardTitle>
        <CardDescription>Entrées Totales</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square md:h-[400px] pb-0"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="value"
              label
              nameKey="entry"
              innerRadius={70}
              outerRadius={100}
              strokeWidth={2}
              blendStroke={false}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="entry" />}
              className="mt-2 translate-y-3 flex-wrap gap-2 *:basis-1/4 *:justify-center md:-translate-y-4"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        {/* <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div> */}
        <div className="text-muted-foreground leading-none">
          Toutes les entrées du cabinet
        </div>
      </CardFooter>
    </Card>
  );
}

export default function DataChart() {
  return (
    <Suspense fallback={<p>Loading DataChart…</p>}>
      <ErrorBoundary fallback={<p>Error loading DataChart</p>}>
        <DataChartSuspense />
      </ErrorBoundary>
    </Suspense>
  );
}
