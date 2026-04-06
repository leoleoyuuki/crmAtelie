import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingDown, AreaChart, EyeOff } from "lucide-react";
import { useContext } from "react";
import { PasswordContext } from "@/contexts/password-context";
import { cn } from "@/lib/utils";

type ProfitStatsCardsProps = {
    totalProfit: number;
    totalRevenue: number;
    totalCosts: number;
    isPrivacyMode?: boolean;
}

export function ProfitTotalCard({ totalProfit, isPrivacyMode = false, className }: { totalProfit: number; isPrivacyMode?: boolean; className?: string }) {
    const { togglePrivacyMode } = useContext(PasswordContext);
    const formattedProfit = isPrivacyMode ? 'R$ ●●●,●●' : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalProfit);
    return (
        <Card 
            className={cn(className, isPrivacyMode && "cursor-pointer transition-all hover:border-primary/50 active:scale-[0.98]")}
            onClick={isPrivacyMode ? togglePrivacyMode : undefined}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro Líquido Total</CardTitle>
                {isPrivacyMode ? <EyeOff className="h-4 w-4 text-primary" /> : <AreaChart className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formattedProfit}</div>
                <p className="text-xs text-muted-foreground">{isPrivacyMode ? "Clique para visualizar" : "Receita total menos custos totais"}</p>
            </CardContent>
        </Card>
    );
}

export function GrossRevenueCard({ totalRevenue, isPrivacyMode = false, className }: { totalRevenue: number; isPrivacyMode?: boolean; className?: string }) {
    const { togglePrivacyMode } = useContext(PasswordContext);
    const formattedRevenue = isPrivacyMode ? 'R$ ●●●,●●' : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalRevenue);
    return (
        <Card 
            className={cn(className, isPrivacyMode && "cursor-pointer transition-all hover:border-primary/50 active:scale-[0.98]")}
            onClick={isPrivacyMode ? togglePrivacyMode : undefined}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Bruta Total</CardTitle>
                {isPrivacyMode ? <EyeOff className="h-4 w-4 text-primary" /> : <DollarSign className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formattedRevenue}</div>
                <p className="text-xs text-muted-foreground">{isPrivacyMode ? "Clique para visualizar" : "de todos os pedidos concluídos"}</p>
            </CardContent>
        </Card>
    );
}

export function CostsTotalCard({ totalCosts, isPrivacyMode = false, className }: { totalCosts: number; isPrivacyMode?: boolean; className?: string }) {
    const { togglePrivacyMode } = useContext(PasswordContext);
    const formattedCosts = isPrivacyMode ? 'R$ ●●●,●●' : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalCosts);
    return (
        <Card 
            className={cn(className, isPrivacyMode && "cursor-pointer transition-all hover:border-primary/50 active:scale-[0.98]")}
            onClick={isPrivacyMode ? togglePrivacyMode : undefined}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Custos Totais</CardTitle>
                {isPrivacyMode ? <EyeOff className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formattedCosts}</div>
                <p className="text-xs text-muted-foreground">{isPrivacyMode ? "Clique para visualizar" : "de materiais e custos fixos"}</p>
            </CardContent>
        </Card>
    );
}

export function ProfitStatsCards({ totalProfit, totalRevenue, totalCosts, isPrivacyMode = false }: ProfitStatsCardsProps) {
    return (
        <>
            <ProfitTotalCard totalProfit={totalProfit} isPrivacyMode={isPrivacyMode} />
            <GrossRevenueCard totalRevenue={totalRevenue} isPrivacyMode={isPrivacyMode} />
            <CostsTotalCard totalCosts={totalCosts} isPrivacyMode={isPrivacyMode} />
        </>
    );
}
