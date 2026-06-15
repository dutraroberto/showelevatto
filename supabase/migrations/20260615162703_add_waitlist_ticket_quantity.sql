alter table public.event_waitlist
add column ticket_quantity integer not null default 1 check (ticket_quantity >= 1);

drop function public.join_waitlist(text, text);

create or replace function public.join_waitlist(
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
  v_digits text;
  v_whatsapp text;
  v_row public.event_waitlist%rowtype;
  v_already boolean := false;
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

  if p_quantity is null or p_quantity < 1 or p_quantity > v_settings.max_per_lead then
    raise exception 'quantidade invalida';
  end if;

  -- Normaliza para E.164 (mesma regra do create_lead).
  if char_length(v_digits) in (10, 11) then
    v_whatsapp := '55' || v_digits;
  elsif char_length(v_digits) in (12, 13) and left(v_digits, 2) = '55' then
    v_whatsapp := v_digits;
  else
    v_whatsapp := v_digits;
  end if;

  update public.event_waitlist
  set
    name = trim(p_name),
    ticket_quantity = p_quantity
  where whatsapp = v_whatsapp
  returning * into v_row;

  if found then
    v_already := true;
  else
    insert into public.event_waitlist (
      name,
      whatsapp,
      ticket_quantity,
      event_name
    )
    values (trim(p_name), v_whatsapp, p_quantity, v_settings.event_name)
    returning * into v_row;
  end if;

  return jsonb_build_object(
    'ok', true,
    'already', v_already,
    'id', v_row.id
  );
end;
$$;

revoke all on function public.join_waitlist(text, text, integer) from public, anon, authenticated;
grant execute on function public.join_waitlist(text, text, integer) to anon, authenticated;
