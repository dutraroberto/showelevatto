import { createClient } from "@/lib/supabase/client";
import type {
  AdminUser,
  CreateLeadResult,
  DashboardMetrics,
  EventSettings,
  Lead,
  NewLeadInput,
  NewWaitlistInput,
  WaitlistEntry,
} from "@/lib/types";

// Camada de API real (Supabase). Mantém as mesmas assinaturas da camada
// mocada das Fases 1 e 2 — a UI não conhece o Supabase diretamente.
//
// Segurança: anon não tem acesso de escrita às tabelas; inscrições e page
// views passam pelas RPCs security definer (create_lead, track_page_view).
// As leituras do painel dependem de sessão + linha em admin_users (RLS).

interface LeadRow {
  id: string;
  name: string;
  whatsapp: string;
  ticket_quantity: number;
  event_name: string;
  created_at: string;
}

function rowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    name: row.name,
    whatsapp: row.whatsapp,
    ticketQuantity: row.ticket_quantity,
    eventName: row.event_name,
    createdAt: row.created_at,
  };
}

/** Retorna os leads em ordem cronológica decrescente (mais recentes primeiro). */
export async function getLeads(): Promise<Lead[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("event_leads")
    .select("id, name, whatsapp, ticket_quantity, event_name, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as LeadRow[]).map(rowToLead);
}

/** Métricas agregadas do dashboard (RPC restrita a admins). */
export async function getMetrics(): Promise<DashboardMetrics> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_dashboard_metrics");

  if (error) throw error;
  const m = data as {
    total_leads: number;
    total_tickets_reserved: number;
    total_tickets: number;
    tickets_available: number;
    total_page_views: number;
    unique_sessions: number;
    conversion_rate: number;
    leads_by_day: { date: string; leads: number; tickets: number }[];
    activity_by_day: {
      date: string;
      leads: number;
      tickets: number;
      views: number;
    }[];
    ticket_distribution: { quantity: number; count: number }[];
  };

  return {
    totalLeads: m.total_leads,
    totalTicketsReserved: m.total_tickets_reserved,
    totalTickets: m.total_tickets,
    ticketsAvailable: m.tickets_available,
    totalPageViews: m.total_page_views,
    uniqueSessions: m.unique_sessions,
    conversionRate: Number(m.conversion_rate),
    leadsByDay: m.leads_by_day,
    activityByDay: m.activity_by_day ?? [],
    ticketDistribution: m.ticket_distribution ?? [],
  };
}

/** Admin autenticado (sessão Supabase + perfil em admin_users). */
export async function getCurrentUser(): Promise<AdminUser> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Não autenticado.");
  }

  const { data: profile } = await supabase
    .from("admin_users")
    .select("name, email, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    name:
      profile?.name ??
      (user.user_metadata?.name as string | undefined) ??
      user.email ??
      "Admin",
    email: profile?.email ?? user.email ?? "",
    role: "admin",
    avatarUrl: profile?.avatar_url ?? undefined,
  };
}

interface EventSettingsRow {
  event_name: string;
  total_tickets: number;
  max_per_lead: number;
  tickets_reserved: number;
  tickets_available: number;
}

function rowToEventSettings(row: EventSettingsRow): EventSettings {
  return {
    eventName: row.event_name,
    totalTickets: row.total_tickets,
    maxPerLead: row.max_per_lead,
    ticketsReserved: row.tickets_reserved,
    ticketsAvailable: row.tickets_available,
  };
}

/** Configurações do evento + reservas (RPC restrita a admins). */
export async function getEventSettings(): Promise<EventSettings> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_event_settings");

  if (error) throw error;
  return rowToEventSettings(data as EventSettingsRow);
}

/**
 * Altera a quantidade total de ingressos do evento (RPC admin-only). O banco
 * recusa um total menor que os ingressos já reservados.
 */
export async function updateTotalTickets(
  totalTickets: number
): Promise<EventSettings> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("update_event_settings", {
    p_total_tickets: totalTickets,
  });

  if (error) throw error;
  return rowToEventSettings(data as EventSettingsRow);
}

/**
 * Cria uma inscrição via RPC create_lead, que valida a disponibilidade com
 * lock anti-corrida no banco.
 */
export async function createLead(
  input: NewLeadInput
): Promise<CreateLeadResult> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("create_lead", {
    p_name: input.name,
    p_whatsapp: input.whatsapp,
    p_quantity: input.ticketQuantity,
  });

  if (error) throw error;

  const result = data as
    | {
        ok: true;
        lead: LeadRow;
        tickets_available: number;
      }
    | {
        ok: false;
        reason: "sold_out" | "not_enough";
        tickets_available: number;
      };

  if (!result.ok) {
    return {
      ok: false,
      reason: result.reason,
      ticketsAvailable: result.tickets_available,
    };
  }

  return {
    ok: true,
    lead: rowToLead(result.lead),
    ticketsAvailable: result.tickets_available,
  };
}

interface WaitlistRow {
  id: string;
  name: string;
  whatsapp: string;
  event_name: string;
  created_at: string;
}

/** Entra na lista de espera (RPC pública; idempotente por número). */
export async function joinWaitlist(input: NewWaitlistInput): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("join_waitlist", {
    p_name: input.name,
    p_whatsapp: input.whatsapp,
  });

  if (error) throw error;
}

/** Lista de espera, mais recentes primeiro (somente admins, via RLS). */
export async function getWaitlist(): Promise<WaitlistEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("event_waitlist")
    .select("id, name, whatsapp, event_name, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as WaitlistRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    whatsapp: row.whatsapp,
    eventName: row.event_name,
    createdAt: row.created_at,
  }));
}

/** Soma de ingressos disponíveis (consumida pela landing). */
export async function getTicketsAvailable(): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_tickets_available");

  if (error) throw error;
  return data as number;
}

/**
 * Id de sessão do visitante, persistido no navegador (localStorage). Permite
 * contar sessões únicas no dashboard sem cookies de rastreamento.
 */
function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  const key = "elevatto_session_id";
  try {
    let id = window.localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return null;
  }
}

/** Registra um acesso à landing (fire-and-forget; falhas são ignoradas). */
export async function trackPageView(path: string): Promise<void> {
  const supabase = createClient();
  await supabase.rpc("track_page_view", {
    p_path: path,
    p_session_id: getSessionId(),
  });
}
