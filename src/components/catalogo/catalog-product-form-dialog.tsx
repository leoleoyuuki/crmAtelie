'use client';

import * as z from 'zod';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useUser } from '@/firebase/auth/use-user';
import { db } from '@/firebase/config';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(1, 'Obirgatório').max(100),
  description: z.string().optional(),
  totalCost: z.coerce.number().min(0, 'Custo não pode ser negativo'),
  finalPrice: z.coerce.number().min(0, 'Preço final não pode ser negativo'),
});

type FormValues = z.infer<typeof formSchema>;

export function CatalogProductFormDialog({
    isOpen,
    setIsOpen,
}: {
    isOpen: boolean;
    setIsOpen: (o: boolean) => void;
}) {
    const { user } = useUser();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            totalCost: 0,
            finalPrice: 0,
        },
    });

    const watchedTotalCost = useWatch({ control: form.control, name: 'totalCost' });
    const watchedFinalPrice = useWatch({ control: form.control, name: 'finalPrice' });
    
    // Auto calculate profit
    const profit = (watchedFinalPrice || 0) - (watchedTotalCost || 0);
    const marginPercent = watchedTotalCost > 0 ? (profit / watchedTotalCost) * 100 : 0;

    async function onSubmit(data: FormValues) {
        if (!user) return;
        setIsSaving(true);
        try {
            const calculatedProfit = data.finalPrice - data.totalCost;
            
            const payload = {
                userId: user.uid,
                name: data.name,
                description: data.description || '',
                professionalCostPerHour: 0,
                professionalHours: 0,
                realEstateCostPerHour: 0,
                realEstateHours: 0,
                materials: [],
                totalMaterialCost: 0,
                totalCost: data.totalCost,
                marginType: 'fixed',
                marginValue: calculatedProfit > 0 ? calculatedProfit : 0,
                profit: calculatedProfit,
                finalPrice: data.finalPrice,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            await addDoc(collection(db, 'catalogProducts'), payload);
            
            toast({ title: 'Produto criado!', description: 'O produto foi inserido em seu catálogo.' });
            form.reset();
            setIsOpen(false);
        } catch (err) {
            console.error(err);
            toast({ variant: 'destructive', title: 'Erro ao criar produto' });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent 
                className="flex flex-col h-[95dvh] sm:h-auto sm:max-h-[90vh] p-0 overflow-hidden sm:max-w-[450px] lg:max-w-[50%] lg:w-[50%] lg:h-full lg:max-h-none lg:right-0 lg:left-auto lg:top-0 lg:translate-x-0 lg:translate-y-0 lg:rounded-none lg:rounded-l-3xl lg:border-y-0 lg:border-r-0 shadow-2xl lg:duration-500 lg:data-[state=open]:animate-in lg:data-[state=closed]:animate-out lg:data-[state=closed]:slide-out-to-right lg:data-[state=open]:slide-in-from-right lg:data-[state=open]:zoom-in-100 lg:data-[state=closed]:zoom-out-100"
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="font-headline text-2xl">Novo Produto Manual</DialogTitle>
                    <DialogDescription>
                        Crie um produto rápido definindo apenas os custos totais e o preço de venda.
                    </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Produto</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Caderno Artesanal" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Detalhes ou especificações" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="totalCost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Custo Total (R$)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="finalPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Preço de Venda (R$)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {watchedTotalCost > 0 && watchedFinalPrice > 0 && (
                            <div className="bg-muted p-3 rounded-lg flex justify-between items-center text-sm border">
                                <span className="text-muted-foreground font-medium">Margem Calculada:</span>
                                <div className="text-right">
                                    <span className="block font-bold text-emerald-600">
                                        + {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(profit)}
                                    </span>
                                    <span className="block text-xs text-muted-foreground">
                                        {marginPercent.toFixed(1)}% sobre o custo
                                    </span>
                                </div>
                            </div>
                        )}

                        </div>
                        
                        <DialogFooter className="p-6 border-t bg-muted/20">
                            <Button variant="outline" type="button" onClick={() => setIsOpen(false)} className="h-12 px-6">
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSaving} className="h-12 px-8 font-bold shadow-md">
                                {isSaving ? "Salvando..." : "Criar Produto"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
