"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DownloadIcon,
  MessageCircleIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import {
  formatDateTime,
  formatPhoneDisplay,
  toWhatsappE164,
} from "@/lib/format";
import { DEFAULT_WHATSAPP_MESSAGE_TEMPLATE, type Lead } from "@/lib/types";

type SortKey = "createdAt" | "name" | "ticketQuantity";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 500;

/**
 * Monta o link wa.me com o número no formato internacional (prefixo 55 do
 * Brasil quando ausente) e uma mensagem inicial já preenchida pelo template.
 */
function buildWhatsappUrl(lead: Lead, template: string): string {
  const digits = toWhatsappE164(lead.whatsapp);

  const firstName = lead.name.trim().split(" ")[0] || lead.name;
  const message = (template.trim() || DEFAULT_WHATSAPP_MESSAGE_TEMPLATE)
    .replaceAll("{primeiro_nome}", firstName)
    .replaceAll("{nome}", lead.name)
    .replaceAll("{evento}", lead.eventName)
    .replaceAll("{ingressos}", String(lead.ticketQuantity));

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function toCsv(leads: Lead[]): string {
  const header = ["Nome", "WhatsApp", "WhatsApp (intl)", "Ingressos", "Data"];
  const rows = leads.map((l) => [
    l.name,
    formatPhoneDisplay(l.whatsapp),
    toWhatsappE164(l.whatsapp),
    String(l.ticketQuantity),
    formatDateTime(l.createdAt),
  ]);
  return [header, ...rows]
    .map((cols) =>
      cols.map((c) => `"${c.replace(/"/g, '""')}"`).join(";")
    )
    .join("\n");
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function LeadsTable({
  leads,
  whatsappMessageTemplate,
}: {
  leads: Lead[];
  whatsappMessageTemplate: string;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = normalizeSearchText(query.trim());
    const qDigits = q.replace(/\D/g, "");
    const base = q
      ? leads.filter(
          (l) =>
            normalizeSearchText(l.name).includes(q) ||
            normalizeSearchText(l.whatsapp).includes(q) ||
            (qDigits.length > 0 &&
              l.whatsapp.replace(/\D/g, "").includes(qDigits))
        )
      : leads;

    const sorted = [...base].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name, "pt-BR");
      else if (sortKey === "ticketQuantity")
        cmp = a.ticketQuantity - b.ticketQuantity;
      else cmp = +new Date(a.createdAt) - +new Date(b.createdAt);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [leads, query, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  );

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
    setPage(0);
  }

  function downloadCsv() {
    const blob = new Blob(["﻿" + toCsv(filtered)], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inscricoes-elevatto.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function renderSortIcon(key: SortKey) {
    if (sortKey !== key) return null;
    return sortDir === "asc" ? (
      <ArrowUpIcon className="size-3.5" />
    ) : (
      <ArrowDownIcon className="size-3.5" />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
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

      {/* Mobile: cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {pageRows.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center gap-2 rounded-xl border py-12">
            <UsersIcon className="size-6 opacity-50" />
            <span className="text-sm">Nenhuma inscrição encontrada.</span>
          </div>
        ) : (
          pageRows.map((lead) => (
            <div
              key={lead.id}
              className="bg-card flex flex-col gap-3 rounded-xl border p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{lead.name}</p>
                  <p className="text-muted-foreground tabular-nums text-sm">
                    {formatPhoneDisplay(lead.whatsapp)}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {lead.ticketQuantity}{" "}
                  {lead.ticketQuantity === 1 ? "ingresso" : "ingressos"}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground tabular-nums text-xs">
                  {formatDateTime(lead.createdAt)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  render={
                    <a
                      href={buildWhatsappUrl(lead, whatsappMessageTemplate)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Falar com ${lead.name} no WhatsApp`}
                    />
                  }
                >
                  <MessageCircleIcon />
                  WhatsApp
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden overflow-hidden rounded-xl border md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-card/50 hover:bg-card/50">
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("name")}
                  className="hover:text-foreground inline-flex items-center gap-1"
                >
                  Nome {renderSortIcon("name")}
                </button>
              </TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("ticketQuantity")}
                  className="hover:text-foreground inline-flex items-center gap-1"
                >
                  Ingressos {renderSortIcon("ticketQuantity")}
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  type="button"
                  onClick={() => toggleSort("createdAt")}
                  className="hover:text-foreground ml-auto inline-flex items-center gap-1"
                >
                  Data {renderSortIcon("createdAt")}
                </button>
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="text-muted-foreground flex flex-col items-center gap-2">
                    <UsersIcon className="size-6 opacity-50" />
                    <span className="text-sm">
                      Nenhuma inscrição encontrada.
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatPhoneDisplay(lead.whatsapp)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{lead.ticketQuantity}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right tabular-nums">
                    {formatDateTime(lead.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      render={
                        <a
                          href={buildWhatsappUrl(lead, whatsappMessageTemplate)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Falar com ${lead.name} no WhatsApp`}
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

      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">
          {filtered.length}{" "}
          {filtered.length === 1 ? "inscrição" : "inscrições"}
          {query && " (filtradas)"}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs tabular-nums">
            Página {currentPage + 1} de {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={currentPage >= pageCount - 1}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
