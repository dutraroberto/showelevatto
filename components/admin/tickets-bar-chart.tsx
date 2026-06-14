"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDay } from "@/lib/format";
import type { DashboardMetrics } from "@/lib/types";

export function TicketsBarChart({
  data,
}: {
  data: DashboardMetrics["activityByDay"];
}) {
  const hasData = data.some((d) => d.tickets > 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Ingressos reservados por dia</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={data}
              margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillTickets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" />
                  <stop offset="100%" stopColor="var(--chart-4)" />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => formatDay(String(v))}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                minTickGap={16}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={36}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
                labelFormatter={(l) => formatDay(String(l))}
              />
              <Bar
                dataKey="tickets"
                name="Ingressos"
                fill="url(#fillTickets)"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-muted-foreground flex h-[260px] items-center justify-center text-sm">
            Sem ingressos reservados ainda.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
