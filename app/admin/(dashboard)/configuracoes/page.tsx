"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Loader2Icon,
  SaveIcon,
  TicketCheckIcon,
  TicketIcon,
} from "lucide-react";

import { MetricCard } from "@/components/admin/metric-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getEventSettings, updateTotalTickets } from "@/lib/api";
import type { EventSettings } from "@/lib/types";
import { formatNumber } from "@/lib/format";

const settingsSchema = z.object({
  totalTickets: z
    .number({ message: "Informe um número válido." })
    .int("Use um número inteiro.")
    .min(1, "O total deve ser de pelo menos 1 ingresso."),
});

type SettingsValues = z.infer<typeof settingsSchema>;

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    getEventSettings()
      .then((data) => {
        setSettings(data);
        reset({ totalTickets: data.totalTickets });
      })
      .catch(() => {
        toast.error("Não foi possível carregar as configurações.");
      });
  }, [reset]);

  async function onSubmit(values: SettingsValues) {
    if (settings && values.totalTickets < settings.ticketsReserved) {
      toast.error("Total abaixo do reservado", {
        description: `Já existem ${formatNumber(
          settings.ticketsReserved
        )} ingressos reservados.`,
      });
      return;
    }

    setSubmitting(true);
    try {
      const updated = await updateTotalTickets(values.totalTickets);
      setSettings(updated);
      reset({ totalTickets: updated.totalTickets });
      toast.success("Configurações salvas", {
        description: `Total de ingressos atualizado para ${formatNumber(
          updated.totalTickets
        )}.`,
      });
    } catch (error) {
      toast.error("Não foi possível salvar", {
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente em instantes.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold">Configurações do evento</h2>
        <p className="text-muted-foreground text-sm">
          Ajuste a capacidade de ingressos do evento.
        </p>
      </div>

      {!settings ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MetricCard
              label="Ingressos reservados"
              value={formatNumber(settings.ticketsReserved)}
              hint="inscrições já confirmadas"
              icon={TicketCheckIcon}
            />
            <MetricCard
              label="Ingressos disponíveis"
              value={formatNumber(settings.ticketsAvailable)}
              hint={`de ${formatNumber(settings.totalTickets)} no total`}
              icon={TicketIcon}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Capacidade de ingressos</CardTitle>
              <CardDescription>
                Defina quantos ingressos estão disponíveis para o evento{" "}
                <span className="text-foreground font-medium">
                  {settings.eventName}
                </span>
                . O valor não pode ser menor que os ingressos já reservados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="totalTickets">Total de ingressos</Label>
                  <Input
                    id="totalTickets"
                    type="number"
                    inputMode="numeric"
                    min={settings.ticketsReserved || 1}
                    step={1}
                    className="h-10 max-w-48"
                    aria-invalid={!!errors.totalTickets}
                    {...register("totalTickets", { valueAsNumber: true })}
                  />
                  {errors.totalTickets ? (
                    <p className="text-destructive text-xs">
                      {errors.totalTickets.message}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-xs">
                      Mínimo: {formatNumber(settings.ticketsReserved || 1)}{" "}
                      (ingressos já reservados).
                    </p>
                  )}
                </div>

                <div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting}
                    className="h-10 font-semibold"
                  >
                    {submitting ? (
                      <Loader2Icon className="animate-spin" />
                    ) : (
                      <SaveIcon />
                    )}
                    {submitting ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
