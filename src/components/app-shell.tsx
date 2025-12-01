
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
import { LayoutDashboard, Users, ShoppingCart, Eye, EyeOff, ListChecks, Tags, KeyRound, BookOpen, MessageSquare, ShieldCheck, ShieldAlert, Shield, Archive } from "lucide-react";
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
import type { UserProfile } from "@/lib/types";
import { differenceInDays, formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";

function SubscriptionBadge({ expiresAt }: { expiresAt?: Date }) {
    if (!expiresAt) {
        return null;
    }
    const daysLeft = differenceInDays(expiresAt, new Date());

    const getBadgeContent = () => {
        if (daysLeft < 0) {
            return { text: "Expirada", icon: <ShieldAlert className="h-3 w-3" />, className: "bg-red-500/20 text-red-700 border-red-500/50" };
        }
        if (daysLeft <= 7) {
            return { text: `${daysLeft}d restantes`, icon: <ShieldAlert className="h-3 w-3" />, className: "bg-red-500/20 text-red-700 border-red-500/50" };
        }
        if (daysLeft <= 15) {
            return { text: `${daysLeft}d restantes`, icon: <Shield className="h-3 w-3" />, className: "bg-yellow-500/20 text-yellow-700 border-yellow-500/50" };
        }
        return { text: `${daysLeft}d restantes`, icon: <ShieldCheck className="h-3 w-3" />, className: "bg-green-500/20 text-green-700 border-green-500/50" };
    }

    const { text, icon, className } = getBadgeContent();

    return (
        <Badge variant="outline" className={cn("text-xs gap-1.5 pl-1.5 pr-2", className)}>
            {icon}
            {text}
        </Badge>
    );
}


function AppHeader({ profile }: { profile: UserProfile | null }) {
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
                     <div className="flex flex-col items-end">
                        <span className="font-semibold text-sm hidden md:block">{user.displayName}</span>
                        <SubscriptionBadge expiresAt={profile?.expiresAt} />
                    </div>
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.photoURL ?? ''} alt="Avatar" />
                        <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
            )}
        </header>

    );
}

export default function AppShell({ children, profile }: { children: React.ReactNode, profile: UserProfile | null }) {
  const { auth } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const isAdmin = user?.uid === "3YuL6Ff7G9cHAV7xa81kyQF4bCw2";

  const menuItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/pedidos", label: "Pedidos", icon: ShoppingCart },
    { href: "/clientes", label: "Clientes", icon: Users },
    { href: "/tarefas", label: "Tarefas", icon: ListChecks },
    { href: "/tabela-precos", label: "Tabela de Preços", icon: Tags },
    { href: "/estoque", label: "Estoque", icon: Archive },
    { href: "/compras", label: "Compras", icon: ShoppingCart },
    { href: "/ajuda", label: "Central de Ajuda", icon: BookOpen },
  ];

  const adminMenuItems = [
    { href: "/admin/sugestoes", label: "Sugestões", icon: MessageSquare },
    { href: "/admin/ativacao", label: "Gerar Códigos", icon: KeyRound },
  ]

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };


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
                  <Link href={item.href} passHref onClick={handleLinkClick}>
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
                    <Link href={item.href} passHref onClick={handleLinkClick}>
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
                 <SidebarLogout onClick={() => auth.signOut()} />
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-col">
            <AppHeader profile={profile} />
            {children}
        </div>
      </div>
  );
}
