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

/**
 * Normaliza um telefone BR para E.164 só com dígitos (ex.: 5562999999999),
 * pronto para exportar/importar em listas de WhatsApp.
 *
 * A decisão é por tamanho, não por prefixo: um celular nacional tem 10 (fixo)
 * ou 11 (com o 9) dígitos, então ganha o código do país 55. Já um número com
 * 12/13 dígitos iniciado em 55 já está em E.164. Isso evita confundir o DDD 55
 * (Santa Maria/RS) com o código do país.
 */
export function toWhatsappE164(value: string): string {
  const digits = phoneDigits(value);
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55"))
    return digits;
  return digits; // melhor esforço para entradas fora do padrão
}

/**
 * Formata um telefone para exibição BR — (99) 99999-9999 — a partir de
 * qualquer formato salvo (mascarado antigo ou E.164 normalizado).
 */
export function formatPhoneDisplay(value: string): string {
  let digits = phoneDigits(value);
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) {
    digits = digits.slice(2);
  }
  return maskPhoneBR(digits) || value;
}
