"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  type LucideIcon,
  SettingsIcon,
  TicketIcon,
  UsersIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import type { AdminUser } from "@/lib/mock/types";

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
};

const navItems: NavItem[] = [
  { title: "Visão geral", href: "/admin", icon: LayoutDashboardIcon },
  { title: "Inscrições", href: "/admin/inscricoes", icon: UsersIcon },
  {
    title: "Configurações",
    href: "/admin/configuracoes",
    icon: SettingsIcon,
    disabled: true,
  },
];

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AppSidebar({ user }: { user: AdminUser }) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2.5">
          <span className="bg-primary/15 text-primary ring-primary/20 flex size-9 items-center justify-center rounded-xl ring-1">
            <TicketIcon className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="text-gold-gradient text-sm font-bold">Elevatto</p>
            <p className="text-muted-foreground text-xs">Painel do evento</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      aria-disabled={item.disabled || undefined}
                      className={
                        item.disabled
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                      render={
                        item.disabled ? (
                          <span />
                        ) : (
                          <Link href={item.href} />
                        )
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div className="flex items-center gap-2.5 rounded-lg border border-primary/15 bg-card/60 p-2.5">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="text-muted-foreground truncate text-xs">
              {user.email}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
