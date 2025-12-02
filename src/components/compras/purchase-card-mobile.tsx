
'use client';

import { Purchase } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Row } from '@tanstack/react-table';
import { Separator } from '../ui/separator';
import { PurchaseTableRowActions } from './purchase-table-row-actions';

interface PurchaseCardMobileProps {
    row: Row<Purchase>;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

export function PurchaseCardMobile({ row }: PurchaseCardMobileProps) {
    const purchase = row.original;
    const createdAt = purchase.createdAt;

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline text-lg">{purchase.materialName}</CardTitle>
                        <CardDescription className="text-xs">
                             {isValid(createdAt)
                                ? format(createdAt, "dd/MM/yyyy", { locale: ptBR })
                                : "Calculando..."}
                        </CardDescription>
                    </div>
                    {purchase.category && <Badge variant="secondary">{purchase.category}</Badge>}
                </div>
            </CardHeader>
            <CardContent>
                 <div className="flex justify-between items-center text-sm">
                    <div className="flex flex-col">
                        <span className="text-muted-foreground">Quantidade</span>
                        <span className='font-semibold'>
                           {purchase.quantity} {purchase.unit}
                        </span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-muted-foreground">Custo Total</span>
                        <span className="font-bold text-lg">{formatCurrency(purchase.cost)}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/50 p-2 border-t flex justify-end">
                 <PurchaseTableRowActions purchase={purchase} />
            </CardFooter>
        </Card>
    )
}
