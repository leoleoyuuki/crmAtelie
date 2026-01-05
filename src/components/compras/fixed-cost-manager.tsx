
"use client";

import React from "react";
import { FixedCost } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { FixedCostFormDialog } from "./fixed-cost-form-dialog";
import { deleteFixedCost } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
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

interface FixedCostManagerProps {
  data: FixedCost[];
  loading: boolean;
  onDataMutated: () => void;
}

export function FixedCostManager({ data, loading, onDataMutated }: FixedCostManagerProps) {
    const { toast } = useToast();

    const handleDelete = async (cost: FixedCost) => {
        try {
            await deleteFixedCost(cost.id);
            toast({
                title: "Custo Excluído",
                description: `O custo "${cost.description}" foi removido.`,
            });
            onDataMutated();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Falha ao excluir o custo.",
            });
        }
    };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Custos Fixos do Mês</CardTitle>
                <CardDescription>Gerencie aluguel, contas, etc.</CardDescription>
            </div>
            <FixedCostFormDialog
                onCostCreated={onDataMutated}
                trigger={
                    <Button variant="ghost" size="icon">
                        <PlusCircle className="h-5 w-5" />
                    </Button>
                }
            />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1">
            <div className="px-6 space-y-4">
                {loading ? (
                    [...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                ) : data.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-10">
                        Nenhum custo fixo registrado para este mês.
                    </div>
                ) : (
                    data.map((cost) => (
                        <div key={cost.id} className="flex items-center justify-between text-sm">
                            <div className="flex flex-col">
                                <span className="font-medium">{cost.description}</span>
                                <span className="text-xs text-muted-foreground">
                                    {format(cost.date, "dd/MM/yy", { locale: ptBR })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                    {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    }).format(cost.cost)}
                                </span>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Confirmar Exclusão?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta ação removerá o custo "{cost.description}" e abaterá o valor do seu resumo de custos.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(cost)}>
                                                Excluir
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
