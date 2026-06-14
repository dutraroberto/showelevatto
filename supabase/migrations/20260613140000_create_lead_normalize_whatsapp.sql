-- Passa a gravar o WhatsApp em E.164 (dígitos com o código do país 55).
-- A normalização decide pelo tamanho, não pelo prefixo, para não confundir
-- números do DDD 55 com o código do país.

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
  v_digits text;
  v_whatsapp text;
begin
  select * into v_settings from public.event_settings limit 1;
  if not found then
    raise exception 'event_settings nao configurado';
  end if;

  if coalesce(char_length(trim(p_name)), 0) < 3 then
    raise exception 'nome invalido';
  end if;

  v_digits := regexp_replace(coalesce(p_whatsapp, ''), '\D', '', 'g');
  if char_length(v_digits) < 10 then
    raise exception 'whatsapp invalido';
  end if;

  -- Normaliza para E.164 com base no tamanho.
  if char_length(v_digits) in (10, 11) then
    v_whatsapp := '55' || v_digits;
  elsif char_length(v_digits) in (12, 13) and left(v_digits, 2) = '55' then
    v_whatsapp := v_digits;
  else
    v_whatsapp := v_digits;
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
  values (trim(p_name), v_whatsapp, p_quantity, v_settings.event_name)
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
