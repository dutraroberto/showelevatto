"use client";

import { useMemo, useState } from "react";
import { DownloadIcon, MessageCircleIcon, SearchIcon, UsersIcon } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  formatDateTime,
  formatPhoneDisplay,
  toWhatsappE164,
} from "@/lib/format";
import type { WaitlistEntry } from "@/lib/types";

function buildWhatsappUrl(entry: WaitlistEntry): string {
  const digits = toWhatsappE164(entry.whatsapp);
  const firstName = entry.name.trim().split(" ")[0] || entry.name;
  const message = `Olá ${firstName}! Tudo bem? Sou da organização do ${entry.eventName} e tenho novidades sobre a sua vaga na lista de espera.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function toCsv(entries: WaitlistEntry[]): string {
  const header = ["Nome", "WhatsApp", "WhatsApp (intl)", "Data"];
  const rows = entries.map((e) => [
    e.name,
    formatPhoneDisplay(e.whatsapp),
    toWhatsappE164(e.whatsapp),
    formatDateTime(e.createdAt),
  ]);
  return [header, ...rows]
    .map((cols) => cols.map((c) => `"${c.replace(/"/g, '""')}"`).join(";"))
    .join("\n");
}

export function WaitlistTable({ entries }: { entries: WaitlistEntry[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.whatsapp.replace(/\D/g, "").includes(q.replace(/\D/g, ""))
    );
  }, [entries, query]);

  function downloadCsv() {
    const blob = new Blob(["﻿" + toCsv(filtered)], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lista-espera-elevatto.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="h-9 pl-8"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={downloadCsv}
          disabled={filtered.length === 0}
        >
          <DownloadIcon />
          Exportar CSV
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-card/50 hover:bg-card/50">
              <TableHead>Nome</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead className="text-right">Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <div className="text-muted-foreground flex flex-col items-center gap-2">
                    <UsersIcon className="size-6 opacity-50" />
                    <span className="text-sm">
                      Ninguém na lista de espera ainda.
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.name}</TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatPhoneDisplay(entry.whatsapp)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right tabular-nums">
                    {formatDateTime(entry.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      render={
                        <a
                          href={buildWhatsappUrl(entry)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Falar com ${entry.name} no WhatsApp`}
                        />
                      }
                    >
                      <MessageCircleIcon />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-muted-foreground text-xs">
        {filtered.length} {filtered.length === 1 ? "pessoa" : "pessoas"}
        {query && " (filtradas)"}
      </p>
    </div>
  );
}
