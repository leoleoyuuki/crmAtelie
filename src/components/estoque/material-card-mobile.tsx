
'use client';

import { Material } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Row } from '@tanstack/react-table';
import { MaterialTableRowActions } from './material-table-row-actions';
import { Package } from 'lucide-react';

interface MaterialCardMobileProps {
    row: Row<Material>;
}


export function MaterialCardMobile({ row }: MaterialCardMobileProps) {
    const material = row.original;
    const usedCount = material.usedInOrders || 0;

    return (
        <Card className="w-full">
            <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                    <CardTitle className="font-headline text-base">{material.name}</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-0.5 rounded-full">
                        <span>{usedCount} {usedCount === 1 ? 'uso' : 'usos'}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="flex flex-col">
                    <span className="text-muted-foreground">Em Estoque</span>
                    <div className="flex items-baseline gap-1">
                         <span className='text-lg font-bold'>{material.stock}</span>
                         <span className="text-xs">{material.unit}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/50 p-2 border-t flex justify-end">
                 <MaterialTableRowActions material={material} />
            </CardFooter>
        </Card>
    )
}
