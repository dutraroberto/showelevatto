import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Cliente Supabase para Server Components, Server Actions e Route Handlers.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Chamado a partir de um Server Component: os cookies da sessão
            // são renovados pelo proxy.ts, então ignorar aqui é seguro.
          }
        },
      },
    }
  );
}
