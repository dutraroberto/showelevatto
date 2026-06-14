"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2Icon, UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { maskPhoneBR, phoneDigits } from "@/lib/format";
import { createLead } from "@/lib/api";
import type { Lead } from "@/lib/types";

const MAX_PER_LEAD = 4;

const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Informe seu nome completo."),
  whatsapp: z
    .string()
    .refine((v) => phoneDigits(v).length >= 10, "Informe um telefone válido."),
  ticketQuantity: z
    .number()
    .int()
    .min(1, "Selecione ao menos 1 ingresso.")
    .max(MAX_PER_LEAD, `Máximo de ${MAX_PER_LEAD} ingressos por inscrição.`),
});

type LeadValues = z.infer<typeof leadSchema>;

interface LeadFormProps {
  available: number | null;
  onRegistered: (lead: Lead) => void;
  onAvailabilityChange: (available: number) => void;
}

export function LeadForm({
  available,
  onRegistered,
  onAvailabilityChange,
}: LeadFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LeadValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: "", whatsapp: "", ticketQuantity: 1 },
  });

  const quantity = watch("ticketQuantity");
  const soldOut = available === 0;
  // Limita as opções ao que ainda há disponível (máx. 4 por inscrição).
  const maxSelectable = Math.min(
    MAX_PER_LEAD,
    available === null ? MAX_PER_LEAD : available
  );

  async function onSubmit(values: LeadValues) {
    setSubmitting(true);
    const result = await createLead(values);
    setSubmitting(false);

    if (!result.ok) {
      onAvailabilityChange(result.ticketsAvailable);
      toast.error(
        result.reason === "sold_out"
          ? "Ingressos esgotados"
          : "Ingressos insuficientes",
        {
          description:
            result.reason === "sold_out"
              ? "Todas as vagas já foram preenchidas."
              : `Restam apenas ${result.ticketsAvailable} ingresso(s) disponível(is).`,
        }
      );
      return;
    }

    onAvailabilityChange(result.ticketsAvailable);
    onRegistered(result.lead);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nome completo</Label>
        <div className="relative">
          <UserIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            id="name"
            placeholder="Seu nome"
            className="h-11 pl-8"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
        </div>
        {errors.name && (
          <p className="text-destructive text-xs">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="whatsapp">Telefone / WhatsApp</Label>
        <Input
          id="whatsapp"
          inputMode="tel"
          placeholder="(62) 99999-9999"
          className="h-11"
          autoComplete="tel"
          aria-invalid={!!errors.whatsapp}
          {...register("whatsapp", {
            onChange: (e) => {
              e.target.value = maskPhoneBR(e.target.value);
            },
          })}
        />
        {errors.whatsapp && (
          <p className="text-destructive text-xs">{errors.whatsapp.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Quantidade de ingressos</Label>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((n) => {
            const disabled = n > maxSelectable;
            const active = quantity === n;
            return (
              <button
                key={n}
                type="button"
                disabled={disabled}
                onClick={() =>
                  setValue("ticketQuantity", n, { shouldValidate: true })
                }
                className={cn(
                  "h-11 rounded-lg border text-sm font-semibold tabular-nums transition-all",
                  active
                    ? "border-primary bg-primary/15 text-primary glow-gold"
                    : "border-border bg-card/40 hover:border-primary/40",
                  disabled && "cursor-not-allowed opacity-40 hover:border-border"
                )}
              >
                {n}
              </button>
            );
          })}
        </div>
        <p className="text-muted-foreground text-xs">
          Máximo de {MAX_PER_LEAD} ingressos por inscrição.
        </p>
        {errors.ticketQuantity && (
          <p className="text-destructive text-xs">
            {errors.ticketQuantity.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={submitting || soldOut}
        className="glow-gold h-12 w-full text-base font-semibold transition-transform hover:scale-[1.01]"
      >
        {submitting && <Loader2Icon className="animate-spin" />}
        {soldOut
          ? "Ingressos esgotados"
          : submitting
            ? "Confirmando..."
            : "Confirmar inscrição gratuita"}
      </Button>
    </form>
  );
}
