// Tipos compartilhados entre o mock (Fases 1 e 2) e o backend real (Fase 3).
// Mantenha estes contratos estáveis: na Fase 3 só trocamos a implementação
// em `lib/mock/api.ts` por chamadas reais ao Supabase, sem mexer na UI.

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
  conversionRate: number; // 0..1 (inscrições ÷ acessos)
  /** Inscrições agrupadas por dia, em ordem cronológica. */
  leadsByDay: { date: string; leads: number; tickets: number }[];
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
