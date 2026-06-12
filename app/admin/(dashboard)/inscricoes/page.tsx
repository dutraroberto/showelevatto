"use client";

import { useEffect, useState } from "react";

import { LeadsTable } from "@/components/admin/leads-table";
import { Skeleton } from "@/components/ui/skeleton";
import { getLeads } from "@/lib/mock/api";
import type { Lead } from "@/lib/mock/types";

export default function InscricoesPage() {
  const [leads, setLeads] = useState<Lead[] | null>(null);

  useEffect(() => {
    getLeads().then(setLeads);
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold">Usuários cadastrados</h2>
        <p className="text-muted-foreground text-sm">
          Todas as inscrições recebidas para o evento.
        </p>
      </div>

      {!leads ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-full max-w-xs" />
            <Skeleton className="h-9 w-32" />
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      ) : (
        <LeadsTable leads={leads} />
      )}
    </div>
  );
}
