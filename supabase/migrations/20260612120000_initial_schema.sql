-- Fase 3: schema do evento "Show de 10 anos da Elevatto".
--
-- Modelo de acesso:
--   - Landing (anon): NUNCA toca as tabelas diretamente; usa apenas as RPCs
--     create_lead / get_tickets_available / track_page_view (security definer).
--   - Painel (authenticated + admin_users): leitura das tabelas via RLS e
--     métricas agregadas via get_dashboard_metrics.

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

-- Configuração do evento (linha única: PK booleana sempre true).
create table public.event_settings (
  id boolean primary key default true check (id),
  event_name text not null,
  total_tickets integer not null check (total_tickets > 0),
  max_per_lead integer not null default 4 check (max_per_lead > 0),
  created_at timestamptz not null default now()
);

create table public.event_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 3 and 120),
  whatsapp text not null check (char_length(whatsapp) between 10 and 30),
  ticket_quantity integer not null check (ticket_quantity >= 1),
  event_name text not null,
  created_at timestamptz not null default now()
);

-- Listagem do painel ordena por data; métricas agrupam por dia.
create index event_leads_created_at_idx on public.event_leads (created_at desc);

create table public.page_views (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  path text not null,
  created_at timestamptz not null default now()
);

-- Perfis de administrador (espelha auth.users; quem está aqui é admin).
create table public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'admin' check (role = 'admin'),
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Configuração padrão do evento (dados de produção, não de seed).
insert into public.event_settings (event_name, total_tickets, max_per_lead)
values ('Show de 10 anos da Elevatto', 300, 4);

-- ---------------------------------------------------------------------------
-- Helper de autorização
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where id = (select auth.uid())
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.event_settings enable row level security;
alter table public.event_leads enable row level security;
alter table public.page_views enable row level security;
alter table public.admin_users enable row level security;

-- O total de ingressos aparece na landing: leitura pública.
create policy "event_settings_select_public"
  on public.event_settings for select
  to anon, authenticated
  using (true);

create policy "event_leads_select_admin"
  on public.event_leads for select
  to authenticated
  using ((select public.is_admin()));

create policy "page_views_select_admin"
  on public.page_views for select
  to authenticated
  using ((select public.is_admin()));

create policy "admin_users_select_self"
  on public.admin_users for select
  to authenticated
  using (id = (select auth.uid()));

-- Escrita acontece somente pelas RPCs (security definer): corta os grants
-- padrão de insert/update/delete dos roles de API.
revoke insert, update, delete on public.event_settings from anon, authenticated;
revoke insert, update, delete on public.event_leads from anon, authenticated;
revoke insert, update, delete on public.page_views from anon, authenticated;
revoke insert, update, delete on public.admin_users from anon, authenticated;

-- ---------------------------------------------------------------------------
-- RPCs públicas (landing)
-- ---------------------------------------------------------------------------

create or replace function public.get_tickets_available()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select greatest(
    (select total_tickets from public.event_settings limit 1)
      - coalesce((select sum(ticket_quantity) from public.event_leads), 0),
    0
  )::integer;
$$;

-- Inscrição com checagem anti-corrida: o advisory lock transacional serializa
-- a leitura da soma + insert, impedindo que duas inscrições simultâneas
-- ultrapassem o total de ingressos.
create or replace function public.create_lead(
  p_name text,
  p_whatsapp text,
  p_quantity integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_settings public.event_settings%rowtype;
  v_available integer;
  v_lead public.event_leads%rowtype;
begin
  select * into v_settings from public.event_settings limit 1;
  if not found then
    raise exception 'event_settings nao configurado';
  end if;

  if coalesce(char_length(trim(p_name)), 0) < 3 then
    raise exception 'nome invalido';
  end if;
  if coalesce(char_length(regexp_replace(p_whatsapp, '\D', '', 'g')), 0) < 10 then
    raise exception 'whatsapp invalido';
  end if;
  if p_quantity is null or p_quantity < 1 or p_quantity > v_settings.max_per_lead then
    raise exception 'quantidade invalida';
  end if;

  perform pg_advisory_xact_lock(hashtext('event_leads_reservation'));

  v_available := public.get_tickets_available();

  if v_available <= 0 then
    return jsonb_build_object(
      'ok', false, 'reason', 'sold_out', 'tickets_available', 0
    );
  end if;
  if p_quantity > v_available then
    return jsonb_build_object(
      'ok', false, 'reason', 'not_enough', 'tickets_available', v_available
    );
  end if;

  insert into public.event_leads (name, whatsapp, ticket_quantity, event_name)
  values (trim(p_name), trim(p_whatsapp), p_quantity, v_settings.event_name)
  returning * into v_lead;

  return jsonb_build_object(
    'ok', true,
    'lead', jsonb_build_object(
      'id', v_lead.id,
      'name', v_lead.name,
      'whatsapp', v_lead.whatsapp,
      'ticket_quantity', v_lead.ticket_quantity,
      'event_name', v_lead.event_name,
      'created_at', v_lead.created_at
    ),
    'tickets_available', v_available - p_quantity
  );
end;
$$;

create or replace function public.track_page_view(p_path text)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.page_views (event_name, path)
  values (
    (select event_name from public.event_settings limit 1),
    left(coalesce(p_path, '/'), 200)
  );
$$;

-- ---------------------------------------------------------------------------
-- RPC do painel (admin)
-- ---------------------------------------------------------------------------

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
  v_by_day jsonb;
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

  return jsonb_build_object(
    'total_leads', v_total_leads,
    'total_tickets_reserved', v_reserved,
    'total_tickets', v_total_tickets,
    'tickets_available', greatest(v_total_tickets - v_reserved, 0),
    'total_page_views', v_views,
    'conversion_rate',
      case when v_views > 0 then v_total_leads::numeric / v_views else 0 end,
    'leads_by_day', v_by_day
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Grants de execução (revoga o EXECUTE default de public antes de conceder)
-- ---------------------------------------------------------------------------

revoke all on function public.is_admin() from public;
revoke all on function public.get_tickets_available() from public;
revoke all on function public.create_lead(text, text, integer) from public;
revoke all on function public.track_page_view(text) from public;
revoke all on function public.get_dashboard_metrics() from public;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.get_tickets_available() to anon, authenticated;
grant execute on function public.create_lead(text, text, integer) to anon, authenticated;
grant execute on function public.track_page_view(text) to anon, authenticated;
grant execute on function public.get_dashboard_metrics() to authenticated;
