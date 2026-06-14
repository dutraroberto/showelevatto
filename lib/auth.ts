import { createClient } from "@/lib/supabase/client";

// Autenticação real via Supabase Auth (e-mail/senha).
// A sessão fica em cookies (@supabase/ssr) e é validada pelo proxy.ts,
// que protege as rotas /admin.

export async function signIn(
  email: string,
  password: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}
