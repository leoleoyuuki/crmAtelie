
'use client';

import { Material } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Row } from '@tanstack/react-table';
import { MaterialTableRowActions } from './material-table-row-actions';
import { Package, TrendingUp } from 'lucide-react';

interface MaterialCardMobileProps {
    row: Row<Material>;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

export function MaterialCardMobile({ row }: MaterialCardMobileProps) {
    const material = row.original;
    const usedCount = material.usedInOrders || 0;
    const cost = material.costPerUnit || 0;

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="font-headline text-lg">{material.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>{usedCount}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 <div className="flex justify-between items-center text-sm">
                    <div className="flex flex-col">
                        <span className="text-muted-foreground">Em Estoque</span>
                        <div className="flex items-baseline gap-1">
                             <span className='text-xl font-bold'>{material.stock}</span>
                             <span className="text-xs">{material.unit}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-muted-foreground">Custo/Unidade</span>
                        <span className="font-semibold text-base">{formatCurrency(cost)}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/50 p-2 border-t flex justify-end">
                 <MaterialTableRowActions material={material} />
            </CardFooter>
        </Card>
    )
}
