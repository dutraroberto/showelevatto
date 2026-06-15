"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { BellRingIcon, CheckCircle2Icon, Loader2Icon, UserIcon } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { maskPhoneBR, phoneDigits } from "@/lib/format";
import { joinWaitlist } from "@/lib/api";

const MAX_PER_WAITLIST_ENTRY = 4;

const waitlistSchema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo."),
  whatsapp: z
    .string()
    .refine((v) => phoneDigits(v).length >= 10, "Informe um telefone válido."),
  ticketQuantity: z
    .number()
    .int()
    .min(1, "Selecione ao menos 1 ingresso.")
    .max(
      MAX_PER_WAITLIST_ENTRY,
      `Máximo de ${MAX_PER_WAITLIST_ENTRY} ingressos por pessoa.`
    ),
});

type WaitlistValues = z.infer<typeof waitlistSchema>;

export function WaitlistForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<WaitlistValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { name: "", whatsapp: "", ticketQuantity: 1 },
  });

  const quantity = useWatch({ control, name: "ticketQuantity" });

  async function onSubmit(values: WaitlistValues) {
    setSubmitting(true);
    try {
      await joinWaitlist(values);
      setDone(values.name.trim().split(" ")[0]);
    } catch {
      toast.error("Não foi possível entrar na lista", {
        description: "Tente novamente em instantes.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-4 py-6 text-center"
      >
        <span className="bg-primary/15 text-primary ring-primary/25 flex size-14 items-center justify-center rounded-full ring-1">
          <CheckCircle2Icon className="size-7" />
        </span>
        <div>
          <h3 className="text-gold-gradient text-2xl font-bold">
            Você está na lista de espera!
          </h3>
          <p className="text-muted-foreground mt-1">
            Tudo certo,{" "}
            <span className="text-foreground font-medium">{done}</span>. Vamos te
            avisar pelo WhatsApp se novas vagas forem liberadas.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="border-primary/15 bg-primary/5 text-foreground/90 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm">
        <BellRingIcon className="text-primary mt-0.5 size-4 shrink-0" />
        <span>
          Os ingressos esgotaram. Entre na lista de espera e avisamos pelo
          WhatsApp caso novas vagas sejam liberadas.
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="wl-name">Nome completo</Label>
          <div className="relative">
            <UserIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              id="wl-name"
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
          <Label htmlFor="wl-whatsapp">Telefone / WhatsApp</Label>
          <Input
            id="wl-whatsapp"
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
          <Label>Quantidade de ingressos desejada</Label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((n) => {
              const active = quantity === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() =>
                    setValue("ticketQuantity", n, { shouldValidate: true })
                  }
                  className={cn(
                    "h-11 rounded-lg border text-sm font-semibold tabular-nums transition-all",
                    active
                      ? "border-primary bg-primary/15 text-primary glow-gold"
                      : "border-border bg-card/40 hover:border-primary/40"
                  )}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <p className="text-muted-foreground text-xs">
            Máximo de {MAX_PER_WAITLIST_ENTRY} ingressos por pessoa.
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
          disabled={submitting}
          className="h-12 w-full text-base font-semibold"
        >
          {submitting && <Loader2Icon className="animate-spin" />}
          {submitting ? "Enviando..." : "Entrar na lista de espera"}
        </Button>
      </form>
    </div>
  );
}
