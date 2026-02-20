
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
import { LayoutDashboard, Users, ShoppingCart, Eye, EyeOff, ListChecks, Tags, KeyRound, BookOpen, ShieldCheck, ShieldAlert, Shield, Archive, DollarSign, LogOut, Sparkles } from "lucide-react";
import React, { useContext, useState } from "react";
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
import { differenceInDays } from 'date-fns';
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OnboardingModal } from "./dashboard/onboarding-modal";

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


function AppHeader({ profile, onOpenOnboarding }: { profile: UserProfile | null, onOpenOnboarding: () => void }) {
    const { user } = useUser();
    const { auth } = useAuth();
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={user.photoURL ?? ''} alt="Avatar" />
                                    <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onOpenOnboarding}>
                                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                                <span>Tour Inicial</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => auth.signOut()}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sair da conta</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </header>

    );
}

function BottomNavigation() {
    const pathname = usePathname();
    
    const navItems = [
        { href: "/", label: "Início", icon: LayoutDashboard },
        { href: "/pedidos", label: "Pedidos", icon: ShoppingCart },
        { href: "/tarefas", label: "Tarefas", icon: ListChecks },
        { href: "/ajuda", label: "Ajuda", icon: BookOpen },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-md md:hidden flex items-start justify-around px-2 pb-[env(safe-area-inset-bottom,16px)] h-[calc(64px+env(safe-area-inset-bottom,16px))]">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link 
                        key={item.href} 
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 w-full h-16 transition-colors",
                            isActive ? "text-primary font-bold" : "text-muted-foreground"
                        )}
                    >
                        <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                        <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}

export default function AppShell({ children, profile }: { children: React.ReactNode, profile: UserProfile | null }) {
  const { auth } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const isAdmin = user?.uid === "3YuL6Ff7G9cHAV7xa81kyQF4bCw2";

  const menuItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/pedidos", label: "Pedidos", icon: ShoppingCart },
    { href: "/clientes", label: "Clientes", icon: Users },
    { href: "/tarefas", label: "Tarefas", icon: ListChecks },
    { href: "/tabela-precos", label: "Tabela de Preços", icon: Tags },
    { href: "/ajuda", label: "Central de Ajuda", icon: BookOpen },
  ];
  
  const inventoryMenuItems = [
      { href: "/estoque", label: "Inventário", icon: Archive },
      { href: "/compras", label: "Registro de Compras", icon: DollarSign },
  ]

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

              <Separator className="my-2" />

               <div className="px-3 py-2">
                  <span className="text-xs font-semibold text-muted-foreground group-data-[collapsible=icon]:hidden">Estoque & Custos</span>
                </div>
               {inventoryMenuItems.map((item) => (
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
                <Separator className="my-2" />
                <div className="px-3 py-2">
                  <span className="text-xs font-semibold text-muted-foreground group-data-[collapsible=icon]:hidden">Admin</span>
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
        <div className="flex flex-col pb-[calc(64px+env(safe-area-inset-bottom,16px))] md:pb-0">
            <AppHeader profile={profile} onOpenOnboarding={() => setIsOnboardingOpen(true)} />
            {children}
            <BottomNavigation />
        </div>
        <OnboardingModal open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen} />
      </div>
  );
}
