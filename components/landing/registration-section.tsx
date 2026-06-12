"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { LeadForm } from "@/components/landing/lead-form";
import { TicketAvailability } from "@/components/landing/ticket-availability";
import { SuccessMessage } from "@/components/landing/success-message";
import { getTicketsAvailable, trackPageView } from "@/lib/mock/api";
import { TOTAL_TICKETS, type Lead } from "@/lib/mock/types";

export function RegistrationSection() {
  const [available, setAvailable] = useState<number | null>(null);
  const [registered, setRegistered] = useState<Lead | null>(null);

  useEffect(() => {
    // Registro de acesso simulado (Fase 2). TODO Fase 3: insert em page_views.
    trackPageView("/");
    getTicketsAvailable().then(setAvailable);
  }, []);

  return (
    <section
      id="inscricao"
      className="relative z-10 scroll-mt-20 px-4 pt-20 pb-0 -mb-42 sm:mb-0 sm:pb-20"
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
      <div className="relative mx-auto max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 text-center"
        >
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Garanta sua{" "}
            <span className="text-gold-gradient">inscrição gratuita</span>
          </h2>
          <p className="text-muted-foreground mt-3 text-balance">
            Preencha seus dados para reservar seu lugar. A entrada é franca e
            está sujeita à disponibilidade de ingressos.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="glow-gold border-primary/20 bg-card/80 backdrop-blur">
            <CardContent className="flex flex-col gap-6">
              <TicketAvailability available={available} total={TOTAL_TICKETS} />

              {registered ? (
                <SuccessMessage
                  name={registered.name}
                  quantity={registered.ticketQuantity}
                />
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
