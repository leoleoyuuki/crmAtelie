
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
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import Logo from "@/components/icons/logo";
import { 
    LayoutDashboard, 
    Users, 
    ShoppingCart, 
    Eye, 
    EyeOff, 
    ListChecks, 
    Tags, 
    KeyRound, 
    BookOpen, 
    ShieldCheck, 
    ShieldAlert, 
    Shield, 
    Archive, 
    DollarSign, 
    LogOut, 
    Sparkles, 
    MessageSquare,
    Share2,
    Bell,
    HelpCircle,
    ChevronDown,
    Zap
} from "lucide-react";
import React, { useContext, useState, useEffect, useMemo } from "react";
import { useAuth, useDocument } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/firebase/auth/use-user";
import { PasswordContext } from "@/contexts/password-context";
import { PasswordDialog } from "./password-dialog";
import { Badge } from "./ui/badge";
import type { UserProfile, UserSummary } from "@/lib/types";
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
import { useToast } from "@/hooks/use-toast";

function SubscriptionBadge({ expiresAt, isTrial }: { expiresAt?: Date, isTrial?: boolean }) {
    if (!expiresAt) return null;
    const daysLeft = differenceInDays(expiresAt, new Date());

    if (isTrial) {
        return <Badge variant="secondary" className="bg-orange-500/10 text-orange-700 border-orange-200 text-[9px] h-4 px-1.5 font-black uppercase tracking-tighter">Trial</Badge>;
    }

    return <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-200 text-[9px] h-4 px-1.5 font-black uppercase tracking-tighter">Ativo</Badge>;
}

function MonthProgress({ summary }: { summary: UserSummary | null }) {
    const progress = useMemo(() => {
        if (!summary || !summary.totalOrders) return 0;
        const completed = summary.totalOrders - (summary.pendingOrders || 0);
        return Math.min(Math.round((completed / summary.totalOrders) * 100), 100);
    }, [summary]);

    return (
        <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-full border bg-background/50">
            <div className="relative h-6 w-6">
                <svg className="h-full w-full" viewBox="0 0 36 36">
                    <circle className="stroke-muted fill-none" strokeWidth="3" cx="18" cy="18" r="16" />
                    <circle 
                        className="stroke-primary fill-none transition-all duration-1000" 
                        strokeWidth="3" 
                        strokeDasharray={`${progress}, 100`} 
                        strokeLinecap="round" 
                        cx="18" 
                        cy="18" 
                        r="16" 
                        transform="rotate(-90 18 18)"
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black">{progress}%</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground whitespace-nowrap">Meta do Mês 🚀</span>
        </div>
    );
}

function AppHeader({ profile, onOpenOnboarding }: { profile: UserProfile | null, onOpenOnboarding: () => void }) {
    const { user } = useUser();
    const { auth, db } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { isPrivacyMode, togglePrivacyMode, isPasswordSet } = useContext(PasswordContext);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = React.useState(false);
    const { data: summary } = useDocument<UserSummary>(user ? `summaries/${user.uid}` : null);

    const handleToggleClick = () => {
        if (!isPasswordSet) {
            setIsPasswordDialogOpen(true);
        } else {
            togglePrivacyMode();
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: 'AtelierFlow',
            text: 'Gerencie seu ateliê com o AtelierFlow - Menos papelada, mais arte.',
            url: window.location.origin,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                return; // Sucesso no compartilhamento nativo
            }
        } catch (err) {
            console.log("Compartilhamento nativo não disponível ou bloqueado, tentando copiar link.", err);
        }

        // Fallback: Copiar para área de transferência se o share falhar ou não existir
        try {
            await navigator.clipboard.writeText(window.location.origin);
            toast({ title: "Link Copiado!", description: "O link do AtelierFlow foi copiado para sua área de transferência." });
        } catch (err) {
            console.error("Falha ao copiar link:", err);
        }
    };

    return (
        <header className="flex h-16 items-center gap-4 border-b bg-card/50 backdrop-blur-md px-4 lg:px-8 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <div className="md:hidden">
                    <SidebarTrigger />
                </div>
                
                {/* User Workspace Selector Style Pill */}
                {user && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-background/50 hover:bg-muted/50 transition-colors cursor-pointer group">
                        <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Logo className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-xs font-bold truncate max-w-[120px]">{user.displayName?.split(' ')[0]}</span>
                        <SubscriptionBadge expiresAt={profile?.expiresAt} isTrial={profile?.trialStarted && !profile?.status?.includes('active_paid')} />
                        <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                )}
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-1.5 md:gap-3">
                <MonthProgress summary={summary} />

                <Separator orientation="vertical" className="h-6 hidden md:block" />

                <div className="flex items-center gap-1">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleToggleClick} 
                        className={cn("h-9 w-9 rounded-xl", isPrivacyMode ? "text-primary bg-primary/5" : "text-muted-foreground")}
                    >
                        {isPrivacyMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <PasswordDialog isOpen={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen} />

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleShare}
                        className="h-9 w-9 rounded-xl text-muted-foreground hidden sm:flex"
                    >
                        <Share2 className="h-4 w-4" />
                    </Button>

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        asChild
                        className="h-9 w-9 rounded-xl text-muted-foreground"
                    >
                        <Link href="/ajuda">
                            <HelpCircle className="h-4 w-4" />
                        </Link>
                    </Button>

                    <div className="relative">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-xl text-muted-foreground"
                        >
                            <Bell className="h-4 w-4" />
                        </Button>
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-card" />
                    </div>
                </div>

                {profile?.trialStarted && profile?.status === 'active' && (
                    <Button 
                        size="sm" 
                        className="hidden md:flex h-9 rounded-xl font-bold bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                        onClick={() => router.push('/ativacao')}
                    >
                        <Zap className="h-3.5 w-3.5 mr-1.5 fill-current" />
                        Upgrade
                    </Button>
                )}

                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full border-2 border-muted hover:border-primary/50 transition-all p-0">
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
                                onSelect={onOpenOnboarding} 
                                className="cursor-pointer py-3"
                            >
                                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                                <span className="font-medium">Tour Inicial</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => auth.signOut()} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer py-3">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span className="font-medium">Sair da conta</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
            style={{ 
                paddingBottom: 'calc(env(safe-area-inset-bottom, 12px) + 12px)',
                paddingTop: '12px'
            }}
        >
            <div className="flex items-center justify-around px-2">
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

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('atelierflow_onboarding_seen');
    if (!hasSeenOnboarding) {
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

  const handleWhatsAppClick = () => {
    const phoneNumber = "5511921494313";
    const message = "Olá! Gostaria de tirar uma dúvida sobre o AtelierFlow.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };


  return (
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-border/50 shadow-sm">
          <SidebarHeader className="h-14 flex flex-row items-center px-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1 rounded-lg">
                <Logo className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-lg font-headline font-bold tracking-tight text-primary group-data-[collapsible=icon]:hidden">
                AtelierFlow
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-2 pt-2 scrollbar-none">
            <SidebarGroup>
                <SidebarGroupContent>
                    <SidebarMenu className="gap-0.5">
                    {menuItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton 
                            asChild 
                            isActive={pathname === item.href}
                            className={cn(
                                "h-9 px-3 font-medium transition-all duration-200 rounded-lg",
                                pathname === item.href 
                                    ? "bg-primary/15 text-primary font-bold shadow-[inset_3px_0_0_0_hsl(var(--primary))] hover:bg-primary/20" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )}
                        >
                            <Link href={item.href} onClick={handleLinkClick}>
                                <item.icon className={cn("h-4 w-4 transition-transform", pathname === item.href && "stroke-[2.5px] scale-110")} />
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-2">
               <SidebarGroupLabel className="px-3 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 group-data-[collapsible=icon]:hidden">
                  Estoque & Custos
                </SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu className="gap-0.5">
                    {inventoryMenuItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton 
                            asChild 
                            isActive={pathname === item.href}
                            className={cn(
                                "h-9 px-3 font-medium transition-all duration-200 rounded-lg",
                                pathname === item.href 
                                    ? "bg-primary/15 text-primary font-bold shadow-[inset_3px_0_0_0_hsl(var(--primary))] hover:bg-primary/20" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )}
                        >
                            <Link href={item.href} onClick={handleLinkClick}>
                                <item.icon className={cn("h-4 w-4 transition-transform", pathname === item.href && "stroke-[2.5px] scale-110")} />
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>


              {isAdmin && (
                <SidebarGroup className="mt-2">
                    <SidebarGroupLabel className="px-3 text-[9px] font-bold uppercase tracking-widest text-destructive/70 group-data-[collapsible=icon]:hidden">
                        Administração
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-0.5">
                        {adminMenuItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton 
                                    asChild 
                                    isActive={pathname === item.href}
                                    className={cn(
                                        "h-9 px-3 font-medium transition-all duration-200 rounded-lg",
                                        pathname === item.href 
                                            ? "bg-destructive/15 text-destructive font-bold shadow-[inset_3px_0_0_0_hsl(var(--destructive))] hover:bg-destructive/20" 
                                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                    )}
                                >
                                    <Link href={item.href} onClick={handleLinkClick}>
                                        <item.icon className={cn("h-4 w-4 transition-transform", pathname === item.href && "stroke-[2.5px] scale-110")} />
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
          <SidebarFooter className="p-2 border-t border-border/50">
             {/* Support Card */}
             <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 mx-2 mb-4 group-data-[collapsible=icon]:hidden transition-all hover:bg-primary/10">
                <div className="bg-primary/10 w-8 h-8 rounded-lg flex items-center justify-center mb-3">
                    <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <h4 className="text-sm font-bold mb-1">Precisa de ajuda?</h4>
                <p className="text-[11px] text-muted-foreground leading-snug mb-3">
                    Dúvidas sobre o sistema? Fale com nosso suporte.
                </p>
                <Button 
                    variant="default"
                    size="sm" 
                    className="w-full h-8 text-[11px] font-bold rounded-xl shadow-md"
                    onClick={handleWhatsAppClick}
                >
                    Suporte WhatsApp
                </Button>
             </div>

             <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton 
                        onClick={() => auth.signOut()}
                        className="h-9 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-200 font-medium rounded-lg"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm group-data-[collapsible=icon]:hidden">Sair da Conta</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
             </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
            <AppHeader profile={profile} onOpenOnboarding={() => setIsOnboardingOpen(true)} />
            <div 
                className="flex-1 overflow-y-auto"
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 24px) + 80px)' }}
            >
                {children}
            </div>
            <BottomNavigation />
        </main>
        
        <OnboardingModal open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen} />
      </div>
  );
}
