-- Lista de espera: capta interessados quando os ingressos esgotam.
-- Mesmo modelo de acesso das demais tabelas: anon só escreve via RPC
-- security definer; leitura é restrita a admins (RLS).

create table public.event_waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 3 and 120),
  whatsapp text not null check (char_length(whatsapp) between 10 and 30),
  event_name text not null,
  created_at timestamptz not null default now()
);

create index event_waitlist_created_at_idx
  on public.event_waitlist (created_at desc);

alter table public.event_waitlist enable row level security;

create policy "event_waitlist_select_admin"
  on public.event_waitlist for select
  to authenticated
  using ((select public.is_admin()));

revoke insert, update, delete on public.event_waitlist from anon, authenticated;

create or replace function public.join_waitlist(
  p_name text,
  p_whatsapp text
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

  -- Normaliza para E.164 (mesma regra do create_lead).
  if char_length(v_digits) in (10, 11) then
    v_whatsapp := '55' || v_digits;
  elsif char_length(v_digits) in (12, 13) and left(v_digits, 2) = '55' then
    v_whatsapp := v_digits;
  else
    v_whatsapp := v_digits;
  end if;

  -- Idempotente: se o número já está na lista, não duplica.
  if exists (
    select 1 from public.event_waitlist where whatsapp = v_whatsapp
  ) then
    return jsonb_build_object('ok', true, 'already', true);
  end if;

  insert into public.event_waitlist (name, whatsapp, event_name)
  values (trim(p_name), v_whatsapp, v_settings.event_name)
  returning * into v_row;

  return jsonb_build_object('ok', true, 'already', false, 'id', v_row.id);
end;
$$;

revoke all on function public.join_waitlist(text, text) from public, anon, authenticated;
grant execute on function public.join_waitlist(text, text) to anon, authenticated;
