"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import type { DashboardMetrics } from "@/lib/types";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function label(quantity: number): string {
  return `${quantity} ${quantity > 1 ? "ingressos" : "ingresso"}`;
}

export function TicketDistributionChart({
  data,
}: {
  data: DashboardMetrics["ticketDistribution"];
}) {
  const chartData = data.map((d) => ({
    name: label(d.quantity),
    value: d.count,
  }));
  const total = chartData.reduce((sum, d) => sum + d.value, 0);
  const hasData = total > 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Inscrições por nº de ingressos</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    stroke="var(--card)"
                    strokeWidth={2}
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold tabular-nums">
                  {formatNumber(total)}
                </span>
                <span className="text-muted-foreground text-xs">inscrições</span>
              </div>
            </div>

            <ul className="flex w-full flex-col gap-1.5">
              {chartData.map((d, i) => (
                <li
                  key={d.name}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-muted-foreground">{d.name}</span>
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatNumber(d.value)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-muted-foreground flex h-[260px] items-center justify-center text-sm">
            Nenhuma inscrição ainda.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
