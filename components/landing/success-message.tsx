"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircle2Icon, TicketIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SuccessMessageProps {
  name: string;
  quantity: number;
}

export function SuccessMessage({ name, quantity }: SuccessMessageProps) {
  useEffect(() => {
    // Efeito discreto após inscrição confirmada.
    const colors = ["#f5c451", "#e8a13a", "#ffdf91"];
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.35 },
      colors,
      disableForReducedMotion: true,
    });
  }, []);

  const firstName = name.trim().split(" ")[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="glow-gold border-primary/30 bg-card/80 text-center backdrop-blur">
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
            className="bg-primary/15 text-primary ring-primary/25 flex size-14 items-center justify-center rounded-full ring-1"
          >
            <CheckCircle2Icon className="size-7" />
          </motion.span>

          <div>
            <h3 className="text-gold-gradient text-2xl font-bold">
              Inscrição realizada com sucesso!
            </h3>
            <p className="text-muted-foreground mt-1">
              Tudo certo, <span className="text-foreground font-medium">{firstName}</span>.
            </p>
          </div>

          <Badge
            variant="secondary"
            className="h-7 gap-1.5 px-3 text-sm"
          >
            <TicketIcon className="size-3.5" />
            {quantity} {quantity > 1 ? "ingressos reservados" : "ingresso reservado"}
          </Badge>

          <p className="border-primary/15 bg-primary/5 text-foreground/90 mt-2 rounded-lg border px-4 py-3 text-sm">
            Apresente seu nome na entrada do evento.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
