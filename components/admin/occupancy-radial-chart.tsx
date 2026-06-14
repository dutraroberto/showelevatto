"use client";

import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatPercent } from "@/lib/format";

export function OccupancyRadialChart({
  reserved,
  total,
}: {
  reserved: number;
  total: number;
}) {
  const ratio = total > 0 ? Math.min(reserved / total, 1) : 0;
  const percent = Math.round(ratio * 100);
  const chartData = [{ name: "Ocupação", value: percent }];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Ocupação do evento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={chartData}
              startAngle={90}
              endAngle={-270}
              innerRadius="70%"
              outerRadius="100%"
            >
              <defs>
                <linearGradient id="fillOccupancy" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" />
                  <stop offset="100%" stopColor="var(--chart-4)" />
                </linearGradient>
              </defs>
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                dataKey="value"
                cornerRadius={12}
                background={{ fill: "var(--muted)" }}
                fill="url(#fillOccupancy)"
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-gold-gradient text-3xl font-bold tabular-nums">
              {formatPercent(ratio)}
            </span>
            <span className="text-muted-foreground text-xs">reservado</span>
          </div>
        </div>
        <p className="text-muted-foreground mt-2 text-center text-xs">
          {formatNumber(reserved)} de {formatNumber(total)} ingressos
        </p>
      </CardContent>
    </Card>
  );
}
