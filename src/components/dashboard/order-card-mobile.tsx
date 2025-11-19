
'use client';

import { Order, OrderStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { format, isBefore, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { OrderTableRowActions } from './order-table-row-actions';
import { Row } from '@tanstack/react-table';
import { Separator } from '../ui/separator';

interface OrderCardMobileProps {
    row: Row<Order>;
    onUpdate: (orderId: string, updatedOrder: Partial<Order>) => void;
    onDelete: (orderId: string) => void;
}

const getStatusBadge = (status: OrderStatus) => {
    const colorClass = {
        "Novo": "bg-blue-500/20 text-blue-700 border-blue-500/50",
        "Em Processo": "bg-yellow-500/20 text-yellow-700 border-yellow-500/50",
        "Aguardando Retirada": "bg-purple-500/20 text-purple-700 border-purple-500/50",
        "Concluído": "bg-green-500/20 text-green-700 border-green-500/50",
    }[status];
    return <Badge className={cn("text-xs", colorClass)} variant="outline">{status}</Badge>;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

export function OrderCardMobile({ row, onUpdate, onDelete }: OrderCardMobileProps) {
    const order = row.original;
    const dueDate = order.dueDate;
    const isDueSoon = dueDate && isBefore(dueDate, addDays(new Date(), 3)) && !isBefore(dueDate, new Date());

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline text-lg">{order.customerName}</CardTitle>
                        <CardDescription className="font-mono text-xs">#{order.id.substring(0, 7)}</CardDescription>
                    </div>
                    {getStatusBadge(order.status)}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                     <p className="text-sm font-medium mb-1">Serviços</p>
                     <div className="flex flex-wrap gap-1">
                        {order.items?.map((item, index) => (
                            <Badge key={index} variant="secondary">{item.serviceType}</Badge>
                        ))}
                    </div>
                </div>

                <Separator />
                
                <div className="flex justify-between items-center text-sm">
                    <div className="flex flex-col">
                        <span className="text-muted-foreground">Entrega</span>
                        <span className={cn('font-semibold', isDueSoon ? 'text-destructive' : '')}>
                            {dueDate ? format(dueDate, "PPP", { locale: ptBR }) : 'N/A'}
                        </span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-bold text-lg">{formatCurrency(order.totalValue)}</span>
                    </div>
                </div>

            </CardContent>
            <CardFooter className="bg-muted/50 p-2 border-t">
                 <OrderTableRowActions 
                    order={order} 
                    onUpdate={onUpdate} 
                    onDelete={onDelete} 
                />
            </CardFooter>
        </Card>
    )
}
