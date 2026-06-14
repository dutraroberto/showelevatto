-- RPCs do painel para ler e alterar as configurações do evento (admin-only).
-- A escrita em event_settings continua revogada para anon/authenticated;
-- toda alteração passa por esta função security definer com checagem de admin.

create or replace function public.get_event_settings()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_settings public.event_settings%rowtype;
  v_reserved integer;
begin
  if not public.is_admin() then
    raise exception 'acesso negado' using errcode = '42501';
  end if;

  select * into v_settings from public.event_settings limit 1;
  select coalesce(sum(ticket_quantity), 0) into v_reserved
  from public.event_leads;

  return jsonb_build_object(
    'event_name', v_settings.event_name,
    'total_tickets', v_settings.total_tickets,
    'max_per_lead', v_settings.max_per_lead,
    'tickets_reserved', v_reserved,
    'tickets_available', greatest(v_settings.total_tickets - v_reserved, 0)
  );
end;
$$;

create or replace function public.update_event_settings(p_total_tickets integer)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_settings public.event_settings%rowtype;
  v_reserved integer;
begin
  if not public.is_admin() then
    raise exception 'acesso negado' using errcode = '42501';
  end if;

  if p_total_tickets is null or p_total_tickets < 1 then
    raise exception 'A quantidade total deve ser de pelo menos 1 ingresso.'
      using errcode = '22023';
  end if;

  -- Serializa contra inscrições concorrentes (mesmo lock do create_lead).
  perform pg_advisory_xact_lock(hashtext('event_leads_reservation'));

  select coalesce(sum(ticket_quantity), 0) into v_reserved
  from public.event_leads;

  if p_total_tickets < v_reserved then
    raise exception
      'O total nao pode ser menor que os % ingressos ja reservados.', v_reserved
      using errcode = '23514';
  end if;

  update public.event_settings
  set total_tickets = p_total_tickets
  where id = true
  returning * into v_settings;

  return jsonb_build_object(
    'event_name', v_settings.event_name,
    'total_tickets', v_settings.total_tickets,
    'max_per_lead', v_settings.max_per_lead,
    'tickets_reserved', v_reserved,
    'tickets_available', greatest(v_settings.total_tickets - v_reserved, 0)
  );
end;
$$;

-- O Supabase concede EXECUTE a anon/authenticated por default privileges, então
-- revogar de public não basta: revogamos explicitamente de anon também.
revoke all on function public.get_event_settings() from public, anon;
revoke all on function public.update_event_settings(integer) from public, anon;
grant execute on function public.get_event_settings() to authenticated;
grant execute on function public.update_event_settings(integer) to authenticated;
