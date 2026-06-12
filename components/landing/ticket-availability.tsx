"use client";

import { TicketIcon } from "lucide-react";

interface TicketAvailabilityProps {
  available: number | null;
  total: number;
}

export function TicketAvailability({ available }: TicketAvailabilityProps) {
  const soldOut = available === 0;

  return (
    <div className="border-primary/15 bg-card/40 rounded-xl border p-4">
      <span className="text-foreground/80 inline-flex items-center gap-1.5 text-sm font-medium">
        <TicketIcon className="text-primary size-4" />
        {available === null
          ? "Verificando disponibilidade..."
          : soldOut
            ? "Ingressos esgotados"
            : "🔥 Mais de 150 inscrições realizadas"}
      </span>
    </div>
  );
}
