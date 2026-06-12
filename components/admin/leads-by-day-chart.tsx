import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDay } from "@/lib/format";
import type { DashboardMetrics } from "@/lib/mock/types";

export function LeadsByDayChart({
  data,
}: {
  data: DashboardMetrics["leadsByDay"];
}) {
  const max = Math.max(...data.map((d) => d.tickets), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Inscrições por dia</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-44 items-end gap-1.5">
          {data.map((d) => (
            <div
              key={d.date}
              className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            >
              <span className="text-muted-foreground text-[10px] tabular-nums opacity-0 transition-opacity group-hover:opacity-100">
                {d.tickets}
              </span>
              <div
                className="from-primary/40 to-primary w-full rounded-t-sm bg-gradient-to-t transition-all group-hover:opacity-80"
                style={{ height: `${(d.tickets / max) * 100}%` }}
                title={`${d.leads} inscrições · ${d.tickets} ingressos`}
              />
              <span className="text-muted-foreground text-[10px] whitespace-nowrap">
                {formatDay(d.date)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
