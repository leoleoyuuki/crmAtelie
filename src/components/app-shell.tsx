"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import Logo from "@/components/icons/logo";
import { LayoutDashboard, Users, ShoppingCart } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

function AppHeader() {
    const { isMobile, open, setOpen } = useSidebar();

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            {isMobile && <SidebarTrigger />}
            <div className="w-full flex-1">
                <h1 className="font-semibold text-lg">AtelierFlow</h1>
            </div>
            {!isMobile && <SidebarTrigger />}
        </header>
    );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <Sidebar collapsible="icon" className="hidden md:block">
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Logo className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-headline font-bold tracking-tight text-primary group-data-[collapsible=icon]:hidden">
                AtelierFlow
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="/" isActive>
                  <LayoutDashboard />
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#">
                  <ShoppingCart />
                  Pedidos
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#">
                  <Users />
                  Clientes
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-col">
            <AppHeader />
            {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
