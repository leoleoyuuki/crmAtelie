
'use client';

import { Card } from "@/components/ui/card";
import { DollarSign, Package, ClipboardList, EyeOff, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsStackProps {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    isPrivacyMode?: boolean;
}

export function StatsStack({ totalRevenue, totalOrders, pendingOrders, isPrivacyMode }: StatsStackProps) {
    const formattedRevenue = isPrivacyMode
        ? 'R$ ●●●,●●'
        : new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(totalRevenue);

    return (
        <div className="flex flex-col gap-3">
            <Card className="p-4 flex items-center gap-4 hover:border-primary/50 transition-colors shadow-sm group">
                <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Receita Total</p>
                    <p className="text-lg font-black tracking-tight">{formattedRevenue}</p>
                </div>
                {isPrivacyMode && <EyeOff className="h-3 w-3 text-muted-foreground ml-auto opacity-50" />}
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
    );
}
