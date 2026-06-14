import { createBrowserClient } from "@supabase/ssr";

// Cliente Supabase para Client Components (landing e painel).
// A sessão é compartilhada com o servidor via cookies (@supabase/ssr).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
