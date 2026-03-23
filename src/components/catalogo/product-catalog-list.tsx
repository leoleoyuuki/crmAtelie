'use client';

import { useCollection } from '@/firebase';
import type { CatalogProduct } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/firebase/config';
import { doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function ProductCatalogList({ onAddProduct }: { onAddProduct?: () => void }) {
    const { data: products, loading } = useCollection<CatalogProduct>('catalogProducts');
    const { toast } = useToast();

    const formatCurrency = (val: number) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'catalogProducts', id));
            toast({ title: 'Produto excluído com sucesso.' });
        } catch(e) {
            toast({ variant: 'destructive', title: 'Erro ao excluir o produto.' });
        }
    };

    if (loading) {
        return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
        </div>
    }

    if (!products || products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-3xl opacity-60">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-bold">Nenhum produto salvo</h3>
                <p className="text-muted-foreground text-sm max-w-sm mt-1 mb-6">
                    Você ainda não adicionou nenhum produto ao catálogo. 
                    Use a Calculadora de Orçamentos ou preencha um manualmente.
                </p>
                <Button onClick={onAddProduct} className="gap-2 font-bold shadow-md">
                    <Plus className="h-4 w-4" /> Cadastrar Produto
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => {
                const marginPercent = product.totalCost > 0 ? (product.profit / product.totalCost) * 100 : 0;
                
                return (
                    <Card key={product.id} className="border-border/50 shadow-sm flex flex-col hover:border-primary/30 transition-colors">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                                    {product.description && <CardDescription className="line-clamp-2 mt-1">{product.description}</CardDescription>}
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-muted-foreground whitespace-nowrap">Criado em</div>
                                    <div className="text-[10px] font-bold">
                                        {product.createdAt ? format(product.createdAt, "dd/MM/yyyy", { locale: ptBR }) : "N/A"}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <div className="grid grid-cols-2 gap-2 text-sm bg-muted/10 p-3 rounded-xl border">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Custo Total</p>
                                    <p className="font-semibold text-destructive">{formatCurrency(product.totalCost)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Preço Final</p>
                                    <p className="font-black text-emerald-600">{formatCurrency(product.finalPrice)}</p>
                                </div>
                                <div className="col-span-2 space-y-1 mt-1 border-t pt-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground">Lucro ({marginPercent.toFixed(1)}%)</span>
                                        <span className="font-bold">{formatCurrency(product.profit)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground">Mão de Obra</span>
                                        <span className="font-medium text-foreground">{formatCurrency((product.professionalCostPerHour*product.professionalHours) + (product.realEstateCostPerHour*product.realEstateHours))}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground">Materiais ({product.materials?.length || 0})</span>
                                        <span className="font-medium text-foreground">{formatCurrency(product.totalMaterialCost)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-0 flex gap-2 justify-end">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Excluir do Catálogo</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Tem certeza que deseja excluir "{product.name}"? Esta ação removerá o produto do seu catálogo permanentemente.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction 
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            onClick={() => handleDelete(product.id)}
                                        >
                                            Sim, excluir
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
}
