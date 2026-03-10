'use client';

import { Card } from "@/components/ui/card";
import { DollarSign, Package, ClipboardList, EyeOff, TrendingUp, Eye } from "lucide-react";
import { useContext } from "react";
import { PasswordContext } from "@/contexts/password-context";
import { cn } from "@/lib/utils";

interface StatsStackProps {
    totalRevenue: number;
    totalProfit: number;
    totalOrders: number;
    pendingOrders: number;
    isPrivacyMode?: boolean;
    periodLabel?: string;
}

export function StatsStack({ 
    totalRevenue, 
    totalProfit, 
    totalOrders, 
    pendingOrders, 
    isPrivacyMode,
    periodLabel = "Máximo"
}: StatsStackProps) {
    const { togglePrivacyMode } = useContext(PasswordContext);

    const formatValue = (val: number) => {
        if (isPrivacyMode) return 'R$ ●●●,●●';
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(val);
    };

    // Verifica se o rótulo do período corresponde à visão vitalícia
    const isLifetime = periodLabel === "Total Acumulado" || periodLabel === "Máximo";

    return (
        <div className="flex flex-col gap-4">
            {/* Desktop View (Legacy) */}
            <div className="hidden lg:flex flex-col gap-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1">
                    Indicadores: <span className="text-primary">{periodLabel}</span>
                </p>
                
                <Card className="p-4 flex items-center gap-4 hover:border-primary/50 transition-colors shadow-sm group border-primary/20 bg-primary/5">
                    <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Lucro Real</p>
                        <p className="text-lg font-black tracking-tight text-primary">{formatValue(totalProfit)}</p>
                    </div>
                    {isPrivacyMode && <EyeOff className="h-3 w-3 text-muted-foreground ml-auto opacity-50" />}
                </Card>

                <Card className="p-4 flex items-center gap-4 hover:border-primary/50 transition-colors shadow-sm group">
                    <div className="bg-muted/50 p-3 rounded-xl group-hover:bg-muted transition-colors">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Faturamento</p>
                        <p className="text-lg font-black tracking-tight">{formatValue(totalRevenue)}</p>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-4 hover:border-primary/50 transition-colors shadow-sm group">
                    <div className="bg-blue-500/10 p-3 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                        <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pedidos</p>
                        <p className="text-lg font-black tracking-tight">{totalOrders}</p>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-4 hover:border-primary/50 transition-colors shadow-sm group">
                    <div className="bg-orange-500/10 p-3 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                        <ClipboardList className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Em Aberto</p>
                        <p className="text-lg font-black tracking-tight">{pendingOrders}</p>
                    </div>
                </Card>
            </div>

            {/* Mobile View (Inspired by the Image) */}
            <Card className="lg:hidden bg-card border-none shadow-2xl overflow-hidden rounded-[2rem]">
                {/* Header Card (Balanço do Mês ou Lucro desde o início) */}
                <div className="bg-primary p-6 text-primary-foreground relative">
                    {/* Grid Pattern Background with Edge Fade Mask */}
                    <div 
                        className="absolute inset-0 opacity-[0.15] pointer-events-none" 
                        style={{ 
                            backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
                            backgroundSize: '20px 20px',
                            maskImage: 'radial-gradient(circle at center, black, transparent 90%)',
                            WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 90%)'
                        }}
                    ></div>
                    
                    <div className="flex items-center justify-between mb-3 relative z-10">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">
                            {isLifetime ? "Lucro desde o início" : "Balanço do Mês"}
                        </p>
                        <button onClick={togglePrivacyMode} className="p-1.5 rounded-full bg-white/15 backdrop-blur-sm active:scale-90 transition-transform">
                            {isPrivacyMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                    </div>
                    
                    <h3 className="text-3xl font-black tracking-tighter relative z-10">
                        {formatValue(totalProfit)}
                    </h3>
                </div>

                {/* Sub Stats Row */}
                <div className="grid grid-cols-3 divide-x bg-card">
                    <div className="p-4 flex flex-col gap-0.5 items-center text-center">
                        <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">Faturamento</p>
                        <p className={cn("text-xs font-black", isPrivacyMode ? "text-muted-foreground/50" : "text-primary")}>
                            {isPrivacyMode ? "---" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact" }).format(totalRevenue)}
                        </p>
                    </div>
                    <div className="p-4 flex flex-col gap-0.5 items-center text-center">
                        <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">Pedidos</p>
                        <p className="text-xs font-black text-foreground">{totalOrders}</p>
                    </div>
                    <div className="p-4 flex flex-col gap-0.5 items-center text-center">
                        <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">Pendências</p>
                        <p className="text-xs font-black text-orange-600">{pendingOrders}</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
