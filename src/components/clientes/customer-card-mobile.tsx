
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
            <CardHeader>
                <CardTitle className="font-headline text-lg">{customer.name}</CardTitle>
                <CardDescription>
                    Cliente desde {format(customer.createdAt, 'dd/MM/yyyy')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                 <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                </div>
                 {customer.email && (
                    <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
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
