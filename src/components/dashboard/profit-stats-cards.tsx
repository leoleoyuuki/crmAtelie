import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingDown, AreaChart, EyeOff } from "lucide-react";

type ProfitStatsCardsProps = {
    totalProfit: number;
    totalRevenue: number;
    totalCosts: number;
    isPrivacyMode?: boolean;
}

export function ProfitStatsCards({ totalProfit, totalRevenue, totalCosts, isPrivacyMode = false }: ProfitStatsCardsProps) {
    const formattedProfit = isPrivacyMode ? 'R$ ●●●,●●' : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalProfit);
    const formattedRevenue = isPrivacyMode ? 'R$ ●●●,●●' : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalRevenue);
    const formattedCosts = isPrivacyMode ? 'R$ ●●●,●●' : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalCosts);

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lucro Líquido Total</CardTitle>
                    {isPrivacyMode ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <AreaChart className="h-4 w-4 text-muted-foreground" />}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formattedProfit}</div>
                    <p className="text-xs text-muted-foreground">{isPrivacyMode ? "Modo de privacidade ativado" : "Receita total menos custos totais"}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Receita Bruta Total</CardTitle>
                    {isPrivacyMode ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <DollarSign className="h-4 w-4 text-muted-foreground" />}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formattedRevenue}</div>
                    <p className="text-xs text-muted-foreground">{isPrivacyMode ? "Modo de privacidade ativado" : "de todos os pedidos concluídos"}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Custos Totais</CardTitle>
                    {isPrivacyMode ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <TrendingDown className="h-4 w-4 text-muted-foreground" />}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formattedCosts}</div>
                    <p className="text-xs text-muted-foreground">{isPrivacyMode ? "Modo de privacidade ativado" : "de materiais e custos fixos"}</p>
                </CardContent>
            </Card>
        </>
    )
}
