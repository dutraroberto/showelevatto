"use client";

import { useEffect, useState } from "react";

import { WaitlistTable } from "@/components/admin/waitlist-table";
import { Skeleton } from "@/components/ui/skeleton";
import { getWaitlist } from "@/lib/api";
import type { WaitlistEntry } from "@/lib/types";

export default function ListaEsperaPage() {
  const [entries, setEntries] = useState<WaitlistEntry[] | null>(null);

  useEffect(() => {
    getWaitlist().then(setEntries);
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold">Lista de espera</h2>
        <p className="text-muted-foreground text-sm">
          Interessados que se cadastraram após os ingressos esgotarem.
        </p>
      </div>

      {!entries ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-full max-w-xs" />
            <Skeleton className="h-9 w-32" />
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      ) : (
        <WaitlistTable entries={entries} />
      )}
    </div>
  );
}
