-- Seed APENAS para desenvolvimento local (supabase db reset).
-- Cria o admin de teste documentado: admin@elevatto.com / 123456.
-- Em produção, crie o usuário pelo dashboard do Supabase e insira a linha
-- correspondente em public.admin_users.

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'admin@elevatto.com',
  crypt('123456', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Equipe Elevatto"}',
  now(),
  now()
);

insert into auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values (
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  jsonb_build_object(
    'sub', '11111111-1111-1111-1111-111111111111',
    'email', 'admin@elevatto.com',
    'email_verified', true
  ),
  'email',
  now(),
  now(),
  now()
);

insert into public.admin_users (id, name, email)
values (
  '11111111-1111-1111-1111-111111111111',
  'Equipe Elevatto',
  'admin@elevatto.com'
);
