const dateTimeFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dayFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

const numberFmt = new Intl.NumberFormat("pt-BR");
const percentFmt = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 1,
});

export function formatDateTime(iso: string): string {
  return dateTimeFmt.format(new Date(iso));
}

/** Recebe "YYYY-MM-DD" ou ISO e devolve "10 de jun." (curto). */
export function formatDay(value: string): string {
  const iso = value.length === 10 ? `${value}T12:00:00` : value;
  return dayFmt.format(new Date(iso));
}

export function formatNumber(value: number): string {
  return numberFmt.format(value);
}

export function formatPercent(value: number): string {
  return percentFmt.format(value);
}

/**
 * Máscara de telefone/WhatsApp BR: (99) 99999-9999.
 * Implementada à mão porque `react-input-mask@2` depende de `findDOMNode`,
 * removido no React 19. TODO Fase 3: manter — independe do backend.
 */
export function maskPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const len = digits.length;
  if (len === 0) return "";
  if (len < 3) return `(${digits}`;
  if (len < 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (len < 11)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Conta os dígitos de um telefone (para validação). */
export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}
