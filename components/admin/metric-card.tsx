import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  /** Destaca o card (ex.: métrica principal). */
  highlight?: boolean;
}

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  highlight,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        highlight && "glow-gold border-primary/30"
      )}
    >
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {label}
          </p>
          <p
            className={cn(
              "mt-2 text-2xl font-bold tracking-tight tabular-nums",
              highlight && "text-gold-gradient"
            )}
          >
            {value}
          </p>
          {hint && (
            <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
          )}
        </div>
        <span className="bg-primary/10 text-primary ring-primary/15 flex size-9 shrink-0 items-center justify-center rounded-xl ring-1">
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}

export function MetricCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="w-full">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-7 w-20" />
          <Skeleton className="mt-2 h-3 w-28" />
        </div>
        <Skeleton className="size-9 rounded-xl" />
      </CardContent>
    </Card>
  );
}
