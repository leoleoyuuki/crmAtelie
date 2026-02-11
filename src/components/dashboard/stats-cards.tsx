import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, DollarSign, Package, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type StatsCardsProps = {
    totalOrders: number;
    totalRevenue: number;
    pendingCount: number;
    isPrivacyMode?: boolean;
}

export function RevenueTotalCard({ totalRevenue, isPrivacyMode = false, className }: { totalRevenue: number; isPrivacyMode?: boolean; className?: string }) {
    const formattedRevenue = isPrivacyMode
        ? 'R$ ●●●,●●'
        : new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(totalRevenue);

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                {isPrivacyMode ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <DollarSign className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formattedRevenue}</div>
                <p className="text-xs text-muted-foreground">{isPrivacyMode ? "Modo de privacidade ativado" : "de todos os pedidos concluídos"}</p>
            </CardContent>
        </Card>
    );
}

export function TotalOrdersCard({ totalOrders, className }: { totalOrders: number; className?: string }) {
    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+{totalOrders}</div>
                <p className="text-xs text-muted-foreground">pedidos registrados no sistema</p>
            </CardContent>
        </Card>
    );
}

export function PendingOrdersCard({ pendingCount, className }: { pendingCount: number; className?: string }) {
    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendências</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{pendingCount}</div>
                <p className="text-xs text-muted-foreground">pedidos novos ou em processo</p>
            </CardContent>
        </Card>
    );
}

export function StatsCards({ totalOrders, totalRevenue, pendingCount, isPrivacyMode = false }: StatsCardsProps) {
    return (
        <>
            <RevenueTotalCard totalRevenue={totalRevenue} isPrivacyMode={isPrivacyMode} />
            <TotalOrdersCard totalOrders={totalOrders} />
            <PendingOrdersCard pendingCount={pendingCount} />
        </>
    );
}
