import { mockLeads, mockState } from "./data";
import {
  EVENT_NAME,
  TOTAL_TICKETS,
  type AdminUser,
  type CreateLeadResult,
  type DashboardMetrics,
  type Lead,
  type NewLeadInput,
} from "./types";

// Camada de "API" mocada. TODA a UI (painel e landing) consome apenas estas
// funções — nunca os arrays diretamente. Na Fase 3, troque o corpo destas
// funções por chamadas reais ao Supabase mantendo as mesmas assinaturas.

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockAdmin: AdminUser = {
  id: "admin-001",
  name: "Equipe Elevatto",
  email: "admin@elevatto.com",
  role: "admin",
};

function sumTickets(leads: Lead[]): number {
  return leads.reduce((acc, lead) => acc + lead.ticketQuantity, 0);
}

/** Retorna os leads em ordem cronológica decrescente (mais recentes primeiro). */
export async function getLeads(): Promise<Lead[]> {
  await delay();
  // TODO Fase 3: substituir por select em public.event_leads (RLS de admin).
  return [...mockLeads].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );
}

/** Métricas agregadas do dashboard. */
export async function getMetrics(): Promise<DashboardMetrics> {
  await delay();
  // TODO Fase 3: substituir por views/queries agregadas no Supabase.
  const totalTicketsReserved = sumTickets(mockLeads);
  const totalLeads = mockLeads.length;
  const totalPageViews = mockState.pageViews;

  const byDay = new Map<string, { leads: number; tickets: number }>();
  for (const lead of mockLeads) {
    const date = lead.createdAt.slice(0, 10); // YYYY-MM-DD
    const entry = byDay.get(date) ?? { leads: 0, tickets: 0 };
    entry.leads += 1;
    entry.tickets += lead.ticketQuantity;
    byDay.set(date, entry);
  }
  const leadsByDay = [...byDay.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, value]) => ({ date, ...value }));

  return {
    totalLeads,
    totalTicketsReserved,
    totalTickets: TOTAL_TICKETS,
    ticketsAvailable: Math.max(TOTAL_TICKETS - totalTicketsReserved, 0),
    totalPageViews,
    conversionRate: totalPageViews > 0 ? totalLeads / totalPageViews : 0,
    leadsByDay,
  };
}

/** Admin "logado" (mockado). */
export async function getCurrentUser(): Promise<AdminUser> {
  await delay(200);
  // TODO Fase 3: substituir por supabase.auth.getUser() no servidor.
  return mockAdmin;
}

/**
 * Cria uma inscrição (usado pela landing na Fase 2). Valida a disponibilidade
 * contra o total mockado e insere em memória.
 * TODO Fase 3: virar Server Action/insert no Supabase com checagem anti-corrida.
 */
export async function createLead(
  input: NewLeadInput
): Promise<CreateLeadResult> {
  await delay(600);
  const reserved = sumTickets(mockLeads);
  const available = Math.max(TOTAL_TICKETS - reserved, 0);

  if (available <= 0) {
    return { ok: false, reason: "sold_out", ticketsAvailable: 0 };
  }
  if (input.ticketQuantity > available) {
    return { ok: false, reason: "not_enough", ticketsAvailable: available };
  }

  const lead: Lead = {
    id: `lead-${Date.now()}`,
    name: input.name.trim(),
    whatsapp: input.whatsapp.trim(),
    ticketQuantity: input.ticketQuantity,
    eventName: EVENT_NAME,
    createdAt: new Date().toISOString(),
  };
  mockLeads.push(lead);

  return {
    ok: true,
    lead,
    ticketsAvailable: Math.max(available - input.ticketQuantity, 0),
  };
}

/** Soma de ingressos disponíveis (consumida pela landing na Fase 2). */
export async function getTicketsAvailable(): Promise<number> {
  await delay(200);
  return Math.max(TOTAL_TICKETS - sumTickets(mockLeads), 0);
}

/** Registro de acesso simulado (Fase 2). TODO Fase 3: insert em page_views. */
export async function trackPageView(_path: string): Promise<void> {
  mockState.pageViews += 1;
}
