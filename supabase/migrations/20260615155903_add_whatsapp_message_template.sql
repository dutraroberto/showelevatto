alter table public.event_settings
add column whatsapp_message_template text not null default
  'Olá {primeiro_nome}! Tudo bem? Sou da organização do {evento} e estou entrando em contato sobre a sua inscrição.'
check (char_length(trim(whatsapp_message_template)) between 1 and 1000);

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
    'whatsapp_message_template', v_settings.whatsapp_message_template,
    'tickets_reserved', v_reserved,
    'tickets_available', greatest(v_settings.total_tickets - v_reserved, 0)
  );
end;
$$;

drop function public.update_event_settings(integer);

create or replace function public.update_event_settings(
  p_total_tickets integer,
  p_whatsapp_message_template text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_settings public.event_settings%rowtype;
  v_reserved integer;
  v_whatsapp_message_template text;
begin
  if not public.is_admin() then
    raise exception 'acesso negado' using errcode = '42501';
  end if;

  if p_total_tickets is null or p_total_tickets < 1 then
    raise exception 'A quantidade total deve ser de pelo menos 1 ingresso.'
      using errcode = '22023';
  end if;

  v_whatsapp_message_template := trim(coalesce(p_whatsapp_message_template, ''));
  if char_length(v_whatsapp_message_template) < 1 then
    raise exception 'A mensagem padrao do WhatsApp nao pode ficar vazia.'
      using errcode = '22023';
  end if;
  if char_length(v_whatsapp_message_template) > 1000 then
    raise exception 'A mensagem padrao do WhatsApp deve ter no maximo 1000 caracteres.'
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
  set
    total_tickets = p_total_tickets,
    whatsapp_message_template = v_whatsapp_message_template
  where id = true
  returning * into v_settings;

  return jsonb_build_object(
    'event_name', v_settings.event_name,
    'total_tickets', v_settings.total_tickets,
    'max_per_lead', v_settings.max_per_lead,
    'whatsapp_message_template', v_settings.whatsapp_message_template,
    'tickets_reserved', v_reserved,
    'tickets_available', greatest(v_settings.total_tickets - v_reserved, 0)
  );
end;
$$;

revoke all on function public.update_event_settings(integer, text) from public, anon;
grant execute on function public.update_event_settings(integer, text) to authenticated;
