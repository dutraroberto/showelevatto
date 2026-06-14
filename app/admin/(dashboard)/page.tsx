"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ActivityIcon,
  ArrowRightIcon,
  EyeIcon,
  TicketIcon,
  TicketCheckIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";

import {
  MetricCard,
  MetricCardSkeleton,
} from "@/components/admin/metric-card";
import { ActivityAreaChart } from "@/components/admin/activity-area-chart";
import { TicketsBarChart } from "@/components/admin/tickets-bar-chart";
import { TicketDistributionChart } from "@/components/admin/ticket-distribution-chart";
import { OccupancyRadialChart } from "@/components/admin/occupancy-radial-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getLeads, getMetrics } from "@/lib/api";
import type { DashboardMetrics, Lead } from "@/lib/types";
import { formatDateTime, formatNumber, formatPercent } from "@/lib/format";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recent, setRecent] = useState<Lead[] | null>(null);

  useEffect(() => {
    getMetrics().then(setMetrics);
    getLeads().then((leads) => setRecent(leads.slice(0, 6)));
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold">Resumo do evento</h2>
        <p className="text-muted-foreground text-sm">
          Acompanhe inscrições, ingressos e acessos da landing page.
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!metrics ? (
          Array.from({ length: 6 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))
        ) : (
          <>
            <MetricCard
              label="Cadastros individuais"
              value={formatNumber(metrics.totalLeads)}
              hint="inscrições recebidas"
              icon={UsersIcon}
              highlight
            />
            <MetricCard
              label="Ingressos reservados"
              value={formatNumber(metrics.totalTicketsReserved)}
              hint={`de ${formatNumber(metrics.totalTickets)} disponíveis`}
              icon={TicketCheckIcon}
            />
            <MetricCard
              label="Sessões únicas"
              value={formatNumber(metrics.uniqueSessions)}
              hint="visitantes distintos"
              icon={ActivityIcon}
            />
            <MetricCard
              label="Total de acessos"
              value={formatNumber(metrics.totalPageViews)}
              hint="visitas à landing page"
              icon={EyeIcon}
            />
            <MetricCard
              label="Ingressos disponíveis"
              value={formatNumber(metrics.ticketsAvailable)}
              hint={`${formatPercent(
                metrics.totalTickets > 0
                  ? metrics.totalTicketsReserved / metrics.totalTickets
                  : 0
              )} já reservados`}
              icon={TicketIcon}
            />
            <MetricCard
              label="Taxa de conversão"
              value={formatPercent(metrics.conversionRate)}
              hint="inscrições ÷ sessões"
              icon={TrendingUpIcon}
            />
          </>
        )}
      </div>

      {/* Acessos x inscrições + ocupação */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {metrics ? (
            <ActivityAreaChart data={metrics.activityByDay} />
          ) : (
            <ChartSkeleton title="Acessos e inscrições por dia" />
          )}
        </div>
        <div className="lg:col-span-2">
          {metrics ? (
            <OccupancyRadialChart
              reserved={metrics.totalTicketsReserved}
              total={metrics.totalTickets}
            />
          ) : (
            <ChartSkeleton title="Ocupação do evento" />
          )}
        </div>
      </div>

      {/* Ingressos por dia + distribuição */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {metrics ? (
            <TicketsBarChart data={metrics.activityByDay} />
          ) : (
            <ChartSkeleton title="Ingressos reservados por dia" />
          )}
        </div>
        <div className="lg:col-span-2">
          {metrics ? (
            <TicketDistributionChart data={metrics.ticketDistribution} />
          ) : (
            <ChartSkeleton title="Inscrições por nº de ingressos" />
          )}
        </div>
      </div>

      {/* Inscrições recentes */}
      <Card>
        <CardHeader className="!flex flex-row items-center justify-between">
          <CardTitle className="text-base">Inscrições recentes</CardTitle>
          <Button
            variant="ghost"
            size="xs"
            render={<Link href="/admin/inscricoes" />}
          >
            Ver todas
            <ArrowRightIcon />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {!recent
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-5 w-8 rounded-full" />
                </div>
              ))
            : recent.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between gap-3 border-b border-border/60 py-1.5 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{lead.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatDateTime(lead.createdAt)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {lead.ticketQuantity}{" "}
                    {lead.ticketQuantity > 1 ? "ingressos" : "ingresso"}
                  </Badge>
                </div>
              ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ChartSkeleton({ title }: { title: string }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[260px] w-full" />
      </CardContent>
    </Card>
  );
}
