
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
  SidebarLogout
} from "@/components/ui/sidebar";
import Logo from "@/components/icons/logo";
import { LayoutDashboard, Users, ShoppingCart, Eye, EyeOff, ListChecks, Tags, KeyRound, BookOpen, MessageSquare } from "lucide-react";
import React, { useContext } from "react";
import { useAuth } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/firebase/auth/use-user";
import { PasswordContext } from "@/contexts/password-context";
import { PasswordDialog } from "./password-dialog";
import { Badge } from "./ui/badge";


function AppHeader() {
    const { isMobile } = useSidebar();
    const { user } = useUser();
    const { isPrivacyMode, togglePrivacyMode, isPasswordSet } = useContext(PasswordContext);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = React.useState(false);

    const handleToggleClick = () => {
        if (!isPasswordSet) {
            setIsPasswordDialogOpen(true);
        } else {
            togglePrivacyMode();
        }
    };

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <div className="w-full flex-1" />

            <Button variant="ghost" size="icon" onClick={handleToggleClick} aria-label="Toggle Privacy Mode">
                {isPrivacyMode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
            <PasswordDialog isOpen={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen} />

            {user && (
                <div className="flex items-center gap-4">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.photoURL ?? ''} alt="Avatar" />
                        <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col">
                        <span className="font-semibold text-sm">{user.displayName}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                </div>
            )}
            
        </header>
    );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { auth } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();

  const isAdmin = user?.uid === "3YuL6Ff7G9cHAV7xa81kyQF4bCw2";

  const menuItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/pedidos", label: "Pedidos", icon: ShoppingCart },
    { href: "/clientes", label: "Clientes", icon: Users },
    { href: "/tarefas", label: "Tarefas", icon: ListChecks },
    { href: "/tabela-precos", label: "Tabela de Preços", icon: Tags },
    { href: "/ajuda", label: "Central de Ajuda", icon: BookOpen },
  ];

  const adminMenuItems = [
    { href: "/admin/sugestoes", label: "Sugestões", icon: MessageSquare },
    { href: "/admin/ativacao", label: "Gerar Códigos", icon: KeyRound },
  ]

  return (
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <Sidebar>
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
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} passHref>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                        <span>
                            <item.icon />
                            {item.label}
                        </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
              {isAdmin && (
                <>
                <div className="px-3 py-2">
                  <span className="text-xs font-semibold text-muted-foreground">Admin</span>
                </div>
                {adminMenuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                    <Link href={item.href} passHref>
                        <SidebarMenuButton asChild isActive={pathname === item.href}>
                            <span className="flex items-center justify-between w-full">
                                <span className="flex items-center gap-2">
                                  <item.icon />
                                  {item.label}
                                </span>
                                <Badge variant="destructive" className="text-xs">Admin</Badge>
                            </span>
                        </SidebarMenuButton>
                    </Link>
                    </SidebarMenuItem>
                ))}
                </>
              )}
            </SidebarMenu>
          </SidebarContent>
          <SidebarLogout onClick={() => auth.signOut()} />
        </Sidebar>
        <div className="flex flex-col">
            <AppHeader />
            {children}
        </div>
      </div>
  );
}
