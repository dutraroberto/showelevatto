// Contratos compartilhados entre a UI e a camada de API (lib/api.ts).
// Os tipos espelham as tabelas/RPCs do Supabase em camelCase.

export const EVENT_NAME = "Show de 10 anos da Elevatto";
export const TOTAL_TICKETS = 300;

export interface Lead {
  id: string;
  name: string;
  whatsapp: string;
  ticketQuantity: number;
  eventName: string;
  createdAt: string; // ISO 8601
}

export interface PageView {
  id: string;
  eventName: string;
  path: string;
  createdAt: string; // ISO 8601
}

export interface DashboardMetrics {
  totalLeads: number;
  totalTicketsReserved: number;
  totalTickets: number;
  ticketsAvailable: number;
  totalPageViews: number;
  /** Sessões distintas (visitantes) que acessaram a landing. */
  uniqueSessions: number;
  conversionRate: number; // 0..1 (inscrições ÷ sessões únicas)
  /** Inscrições agrupadas por dia, em ordem cronológica. */
  leadsByDay: { date: string; leads: number; tickets: number }[];
  /** Série diária combinada: inscrições, ingressos e acessos. */
  activityByDay: {
    date: string;
    leads: number;
    tickets: number;
    views: number;
  }[];
  /** Quantas inscrições reservaram cada quantidade de ingressos. */
  ticketDistribution: { quantity: number; count: number }[];
}

/** Configuração do evento (tabela event_settings) com reservas agregadas. */
export interface EventSettings {
  eventName: string;
  totalTickets: number;
  maxPerLead: number;
  ticketsReserved: number;
  ticketsAvailable: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin";
  avatarUrl?: string;
}

/** Dados aceitos pelo formulário público de inscrição. */
export interface NewLeadInput {
  name: string;
  whatsapp: string;
  ticketQuantity: number;
}

/** Resultado de uma tentativa de inscrição. */
export type CreateLeadResult =
  | { ok: true; lead: Lead; ticketsAvailable: number }
  | { ok: false; reason: "sold_out" | "not_enough"; ticketsAvailable: number };
