
'use client';

import { Customer } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Row } from '@tanstack/react-table';
import { CustomerTableRowActions } from './customer-table-row-actions';
import { Phone, Mail } from 'lucide-react';
import { format } from "date-fns";

interface CustomerCardMobileProps {
    row: Row<Customer>;
    onUpdate: (customerId: string, updatedCustomer: Partial<Customer>) => void;
    onDelete: (customerId: string) => void;
}

export function CustomerCardMobile({ row, onUpdate, onDelete }: CustomerCardMobileProps) {
    const customer = row.original;

    return (
        <Card className="w-full">
            <CardHeader className="p-4">
                <CardTitle className="font-headline text-base">{customer.name}</CardTitle>
                <CardDescription className="text-xs">
                    Cliente desde {format(customer.createdAt, 'dd/MM/yyyy')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 p-4 pt-0">
                 <div className="flex items-center text-xs">
                    <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                    <span>{customer.phone}</span>
                </div>
                 {customer.email && (
                    <div className="flex items-center text-xs">
                        <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                        <span>{customer.email}</span>
                    </div>
                )}
            </CardContent>
            <CardFooter className="bg-muted/50 p-2 border-t flex justify-end">
                <CustomerTableRowActions 
                    customer={customer} 
                    onUpdate={onUpdate} 
                    onDelete={onDelete} 
                />
            </CardFooter>
        </Card>
    )
}
