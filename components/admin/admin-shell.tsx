"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { toast } from "sonner";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { fakeSignOut, isAuthenticated } from "@/lib/auth";
import { getCurrentUser } from "@/lib/mock/api";
import type { AdminUser } from "@/lib/mock/types";

const titles: Record<string, string> = {
  "/admin": "Visão geral",
  "/admin/inscricoes": "Inscrições",
  "/admin/configuracoes": "Configurações",
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  // Guard leve da Fase 1 (checagem da flag no client).
  // TODO Fase 3: substituir por middleware + sessão real do Supabase.
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/admin/login");
      return;
    }
    setAuthorized(true);
    getCurrentUser().then(setUser);
  }, [router]);

  function handleLogout() {
    fakeSignOut();
    toast.success("Sessão encerrada");
    router.replace("/admin/login");
  }

  if (authorized === null) {
    return (
      <div className="bg-elevatto flex flex-1 items-center justify-center">
        <div className="border-primary/30 border-t-primary size-6 animate-spin rounded-full border-2" />
      </div>
    );
  }

  const title = titles[pathname] ?? "Painel";

  return (
    <SidebarProvider>
      {user && <AppSidebar user={user} />}
      <SidebarInset className="bg-elevatto">
        <header className="bg-card/70 sticky top-0 z-40 flex h-14 items-center gap-3 border-b px-4 backdrop-blur sm:px-6">
          <SidebarTrigger className="[&_svg]:size-5!" />
          <Separator orientation="vertical" className="!h-5" />
          <h1 className="text-sm font-semibold sm:text-base">{title}</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="ml-auto"
          >
            <LogOutIcon />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
