-- Rastreamento de sessões únicas + métricas extras do dashboard.

-- 1) Sessão do visitante na landing (id gerado no cliente, persistido em
--    localStorage). Permite contar "sessões únicas" além de page views totais.
alter table public.page_views
  add column if not exists session_id uuid;

create index if not exists page_views_session_id_idx
  on public.page_views (session_id);

-- 2) track_page_view passa a registrar a sessão. Substitui a versão de 1 arg.
drop function if exists public.track_page_view(text);

create or replace function public.track_page_view(
  p_path text,
  p_session_id uuid default null
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.page_views (event_name, path, session_id)
  values (
    (select event_name from public.event_settings limit 1),
    left(coalesce(p_path, '/'), 200),
    p_session_id
  );
$$;

revoke all on function public.track_page_view(text, uuid) from public, anon, authenticated;
grant execute on function public.track_page_view(text, uuid) to anon, authenticated;

-- 3) get_dashboard_metrics ganha sessões únicas, distribuição por quantidade
--    de ingressos e uma série diária combinando inscrições, ingressos e acessos.
create or replace function public.get_dashboard_metrics()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_total_tickets integer;
  v_total_leads integer;
  v_reserved integer;
  v_views integer;
  v_unique_sessions integer;
  v_by_day jsonb;
  v_activity jsonb;
  v_ticket_dist jsonb;
begin
  if not public.is_admin() then
    raise exception 'acesso negado' using errcode = '42501';
  end if;

  select total_tickets into v_total_tickets
  from public.event_settings limit 1;

  select count(*), coalesce(sum(ticket_quantity), 0)
  into v_total_leads, v_reserved
  from public.event_leads;

  select count(*) into v_views from public.page_views;

  select count(distinct session_id) into v_unique_sessions
  from public.page_views
  where session_id is not null;

  -- Série diária de inscrições/ingressos (mantida para compatibilidade).
  select coalesce(
    jsonb_agg(
      jsonb_build_object('date', d.date, 'leads', d.leads, 'tickets', d.tickets)
      order by d.date
    ),
    '[]'::jsonb
  )
  into v_by_day
  from (
    select
      (created_at at time zone 'America/Sao_Paulo')::date::text as date,
      count(*) as leads,
      sum(ticket_quantity) as tickets
    from public.event_leads
    group by 1
  ) d;

  -- Série diária combinada: inscrições, ingressos e acessos por dia.
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'date', a.date, 'leads', a.leads, 'tickets', a.tickets, 'views', a.views
      )
      order by a.date
    ),
    '[]'::jsonb
  )
  into v_activity
  from (
    select
      date,
      sum(leads)::int as leads,
      sum(tickets)::int as tickets,
      sum(views)::int as views
    from (
      select
        (created_at at time zone 'America/Sao_Paulo')::date::text as date,
        count(*) as leads,
        sum(ticket_quantity) as tickets,
        0 as views
      from public.event_leads
      group by 1
      union all
      select
        (created_at at time zone 'America/Sao_Paulo')::date::text as date,
        0 as leads,
        0 as tickets,
        count(*) as views
      from public.page_views
      group by 1
    ) u
    group by date
  ) a;

  -- Distribuição de inscrições por quantidade de ingressos (1, 2, 3, ...).
  select coalesce(
    jsonb_agg(
      jsonb_build_object('quantity', q.quantity, 'count', q.cnt)
      order by q.quantity
    ),
    '[]'::jsonb
  )
  into v_ticket_dist
  from (
    select ticket_quantity as quantity, count(*) as cnt
    from public.event_leads
    group by ticket_quantity
  ) q;

  return jsonb_build_object(
    'total_leads', v_total_leads,
    'total_tickets_reserved', v_reserved,
    'total_tickets', v_total_tickets,
    'tickets_available', greatest(v_total_tickets - v_reserved, 0),
    'total_page_views', v_views,
    'unique_sessions', v_unique_sessions,
    'conversion_rate',
      case when v_unique_sessions > 0
        then v_total_leads::numeric / v_unique_sessions
        when v_views > 0 then v_total_leads::numeric / v_views
        else 0 end,
    'leads_by_day', v_by_day,
    'activity_by_day', v_activity,
    'ticket_distribution', v_ticket_dist
  );
end;
$$;
