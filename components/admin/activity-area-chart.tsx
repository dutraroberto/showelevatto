"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDay } from "@/lib/format";
import type { DashboardMetrics } from "@/lib/types";

export function ActivityAreaChart({
  data,
}: {
  data: DashboardMetrics["activityByDay"];
}) {
  const hasData = data.length > 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Acessos e inscrições por dia</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={data}
              margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-3)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-3)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="fillLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--primary)"
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary)"
                    stopOpacity={0}
                  />
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
                cursor={{ stroke: "var(--border)" }}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
                labelFormatter={(l) => formatDay(String(l))}
              />
              <Area
                type="monotone"
                dataKey="views"
                name="Acessos"
                stroke="var(--chart-3)"
                strokeWidth={2}
                fill="url(#fillViews)"
              />
              <Area
                type="monotone"
                dataKey="leads"
                name="Inscrições"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#fillLeads)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
      </CardContent>
    </Card>
  );
}

function EmptyChart() {
  return (
    <div className="text-muted-foreground flex h-[260px] items-center justify-center text-sm">
      Sem dados suficientes ainda.
    </div>
  );
}
