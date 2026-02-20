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
  SidebarLogout,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import Logo from "@/components/icons/logo";
import { LayoutDashboard, Users, ShoppingCart, Eye, EyeOff, ListChecks, Tags, KeyRound, BookOpen, ShieldCheck, ShieldAlert, Shield, Archive, DollarSign, LogOut, Sparkles, MessageSquare } from "lucide-react";
import React, { useContext, useState, useEffect } from "react";
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
            return { text: "Expirada", icon: <ShieldAlert className="h-3 w-3" />, className: "bg-red-500/10 text-red-700 border-red-500/20" };
        }
        if (daysLeft <= 7) {
            return { text: `${daysLeft}d restantes`, icon: <ShieldAlert className="h-3 w-3" />, className: "bg-red-500/10 text-red-700 border-red-500/20" };
        }
        if (daysLeft <= 15) {
            return { text: `${daysLeft}d restantes`, icon: <Shield className="h-3 w-3" />, className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" };
        }
        return { text: `${daysLeft}d restantes`, icon: <ShieldCheck className="h-3 w-3" />, className: "bg-green-500/10 text-green-700 border-green-500/20" };
    }

    const { text, icon, className } = getBadgeContent();

    return (
        <Badge variant="outline" className={cn("text-[10px] py-0 h-5 gap-1 pl-1 pr-2 font-bold uppercase tracking-tight", className)}>
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
        <header className="flex h-16 items-center gap-4 border-b bg-card/50 backdrop-blur-md px-4 lg:px-8 sticky top-0 z-30">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <div className="w-full flex-1" />

            <div className="flex items-center gap-2 md:gap-4">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleToggleClick} 
                    aria-label="Toggle Privacy Mode"
                    className={cn(isPrivacyMode ? "text-primary" : "text-muted-foreground")}
                >
                    {isPrivacyMode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
                <PasswordDialog isOpen={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen} />

                {user && (
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="font-bold text-xs text-foreground uppercase tracking-tight leading-none mb-1">{user.displayName}</span>
                            <SubscriptionBadge expiresAt={profile?.expiresAt} />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-muted hover:border-primary/50 transition-all p-0">
                                    <Avatar className="h-full w-full">
                                        <AvatarImage src={user.photoURL ?? ''} alt="Avatar" />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{user.displayName?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 mt-2" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-bold leading-none">{user.displayName}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        // Small delay to ensure menu closes before dialog opens to prevent focus conflicts
                                        setTimeout(() => {
                                            onOpenOnboarding();
                                        }, 100);
                                    }} 
                                    className="cursor-pointer py-3"
                                >
                                    <Sparkles className="mr-2 h-4 w-4 text-primary" />
                                    <span className="font-medium">Abrir Tour Inicial</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => auth.signOut()} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer py-3">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span className="font-medium">Sair da conta</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>
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
        <div 
            className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-md md:hidden flex flex-col shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
        >
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-200",
                                isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px] scale-110")} />
                            <span className="text-[10px] uppercase tracking-widest font-bold">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default function AppShell({ children, profile }: { children: React.ReactNode, profile: UserProfile | null }) {
  const { auth } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Handle automatic onboarding opening
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('atelierflow_onboarding_seen');
    if (!hasSeenOnboarding) {
      // Small delay to ensure initial load is smooth before showing modal
      const timer = setTimeout(() => {
        setIsOnboardingOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

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
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-border/50 shadow-sm">
          <SidebarHeader className="h-16 flex flex-row items-center px-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-1.5 rounded-xl">
                <Logo className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-xl font-headline font-bold tracking-tight text-primary group-data-[collapsible=icon]:hidden">
                AtelierFlow
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-3 pt-4">
            <SidebarGroup>
                <SidebarGroupContent>
                    <SidebarMenu className="gap-1">
                    {menuItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton 
                            asChild 
                            isActive={pathname === item.href}
                            className={cn(
                                "h-11 px-4 font-medium transition-all duration-200 rounded-lg",
                                pathname === item.href 
                                    ? "bg-primary/15 text-primary font-bold shadow-[inset_4px_0_0_0_hsl(var(--primary))] hover:bg-primary/20" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )}
                        >
                            <Link href={item.href} onClick={handleLinkClick}>
                                <item.icon className={cn("h-5 w-5 transition-transform", pathname === item.href && "stroke-[2.5px] scale-110")} />
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-4">
               <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 group-data-[collapsible=icon]:hidden">
                  Estoque & Custos
                </SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu className="gap-1">
                    {inventoryMenuItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton 
                            asChild 
                            isActive={pathname === item.href}
                            className={cn(
                                "h-11 px-4 font-medium transition-all duration-200 rounded-lg",
                                pathname === item.href 
                                    ? "bg-primary/15 text-primary font-bold shadow-[inset_4px_0_0_0_hsl(var(--primary))] hover:bg-primary/20" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )}
                        >
                            <Link href={item.href} onClick={handleLinkClick}>
                                <item.icon className={cn("h-5 w-5 transition-transform", pathname === item.href && "stroke-[2.5px] scale-110")} />
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>


              {isAdmin && (
                <SidebarGroup className="mt-4">
                    <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-destructive/70 group-data-[collapsible=icon]:hidden">
                        Administração
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                        {adminMenuItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton 
                                    asChild 
                                    isActive={pathname === item.href}
                                    className={cn(
                                        "h-11 px-4 font-medium transition-all duration-200 rounded-lg",
                                        pathname === item.href 
                                            ? "bg-destructive/15 text-destructive font-bold shadow-[inset_4px_0_0_0_hsl(var(--destructive))] hover:bg-destructive/20" 
                                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                    )}
                                >
                                    <Link href={item.href} onClick={handleLinkClick}>
                                        <item.icon className={cn("h-5 w-5 transition-transform", pathname === item.href && "stroke-[2.5px] scale-110")} />
                                        <span className="text-sm">{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
              )}
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border/50">
             <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton 
                        onClick={() => auth.signOut()}
                        className="h-11 px-4 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-200 font-medium rounded-lg"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="text-sm group-data-[collapsible=icon]:hidden">Sair da Conta</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
             </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
            <AppHeader profile={profile} onOpenOnboarding={() => setIsOnboardingOpen(true)} />
            <div className="flex-1 overflow-y-auto pb-32 md:pb-8">
                {children}
            </div>
            <BottomNavigation />
        </main>
        
        <OnboardingModal open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen} />
      </div>
  );
}
