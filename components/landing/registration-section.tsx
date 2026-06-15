"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { LeadForm } from "@/components/landing/lead-form";
import { WaitlistForm } from "@/components/landing/waitlist-form";
import { ParticlesBackground } from "@/components/landing/particles-background";
import { TicketAvailability } from "@/components/landing/ticket-availability";
import { SuccessMessage } from "@/components/landing/success-message";
import { getTicketsAvailable, trackPageView } from "@/lib/api";
import type { Lead } from "@/lib/types";

export function RegistrationSection({
  trackPath = "/",
}: {
  /** Caminho registrado em page_views (permite distinguir variações da landing). */
  trackPath?: string;
}) {
  const [available, setAvailable] = useState<number | null>(null);
  const [registered, setRegistered] = useState<Lead | null>(null);

  useEffect(() => {
    // Registra o acesso em page_views e busca a disponibilidade real.
    trackPageView(trackPath);
    getTicketsAvailable().then(setAvailable);
  }, [trackPath]);

  const soldOut = available === 0;
  const showWaitlist = soldOut && !registered;

  return (
    <section
      id="inscricao"
      className="relative z-10 -mb-42 scroll-mt-20 px-4 pt-12 pb-0 sm:mb-0 sm:pt-16 sm:pb-20"
    >
      {/* Halo dourado atrás do card de inscrição */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 45% 50% at 50% 55%, color-mix(in oklch, var(--primary) 8%, transparent), transparent 70%)",
        }}
      />
      {/* Partículas douradas flutuando atrás do formulário */}
      <ParticlesBackground />

      <div className="relative mx-auto max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 text-center"
        >
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            {showWaitlist ? (
              <>
                Ingressos <span className="text-gold-gradient">esgotados</span>
              </>
            ) : (
              <>
                Garanta sua{" "}
                <span className="text-gold-gradient">inscrição gratuita</span>
              </>
            )}
          </h2>
          <p className="text-muted-foreground mt-3 text-balance">
            {showWaitlist
              ? "Todas as vagas foram preenchidas. Entre na lista de espera e avisamos pelo WhatsApp se novas vagas forem liberadas."
              : "Preencha seus dados para reservar seu lugar. A entrada é franca e está sujeita à disponibilidade de ingressos."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="glow-gold-pulse border-primary/20 bg-card/80 backdrop-blur">
            <CardContent className="flex flex-col gap-6">
              <TicketAvailability available={available} />

              {registered ? (
                <SuccessMessage
                  name={registered.name}
                  quantity={registered.ticketQuantity}
                />
              ) : showWaitlist ? (
                <WaitlistForm />
              ) : (
                <LeadForm
                  available={available}
                  onRegistered={setRegistered}
                  onAvailabilityChange={setAvailable}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
