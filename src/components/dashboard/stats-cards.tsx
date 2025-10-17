import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, DollarSign, Package } from "lucide-react";

type StatsCardsProps = {
    totalOrders: number;
    totalRevenue: number;
    pendingCount: number;
}

export function StatsCards({ totalOrders, totalRevenue, pendingCount }: StatsCardsProps) {
    const formattedRevenue = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(totalRevenue);

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formattedRevenue}</div>
                    <p className="text-xs text-muted-foreground">de todos os pedidos concluídos</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{totalOrders}</div>
                    <p className="text-xs text-muted-foreground">pedidos registrados no sistema</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pendências</CardTitle>
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{pendingCount}</div>
                    <p className="text-xs text-muted-foreground">pedidos novos ou em processo</p>
                </CardContent>
            </Card>
        </>
    )
}
