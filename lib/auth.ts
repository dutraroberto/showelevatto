// Autenticação FAKE da Fase 1 (sem backend). Apenas o suficiente para o fluxo
// de navegação funcionar. TODO Fase 3: trocar por Supabase Auth (@supabase/ssr).

const STORAGE_KEY = "elevatto_admin_auth";

// Credenciais de teste documentadas (Fase 1).
export const DEMO_CREDENTIALS = {
  email: "admin@elevatto.com",
  password: "123456",
};

export function fakeSignIn(email: string, password: string): boolean {
  // TODO Fase 3: trocar por supabase.auth.signInWithPassword.
  const ok =
    email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
    password === DEMO_CREDENTIALS.password;
  if (ok && typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, "1");
  }
  return ok;
}

export function fakeSignOut(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "1";
}
