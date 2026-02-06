
"use client";

import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Order, Material } from "@/lib/types";
import { getMaterials, concludeOrderWithStockUpdate } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2 } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

const usedMaterialSchema = z.object({
  materialId: z.string().min(1, "Selecione um material."),
  quantityUsed: z.coerce.number().min(0.01, "A quantidade deve ser maior que zero."),
});

const concludeOrderSchema = z.object({
  usedMaterials: z.array(usedMaterialSchema),
});

type ConcludeOrderFormValues = z.infer<typeof concludeOrderSchema>;

interface ConcludeOrderDialogProps {
  order: Order;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onOrderConcluded: (updatedOrder: Partial<Order>) => void;
}

export function ConcludeOrderDialog({
  order,
  isOpen,
  setIsOpen,
  onOrderConcluded,
}: ConcludeOrderDialogProps) {
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<ConcludeOrderFormValues>({
    resolver: zodResolver(concludeOrderSchema),
    defaultValues: { usedMaterials: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "usedMaterials",
  });

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const fetchedMaterials = await getMaterials();
        setMaterials(fetchedMaterials);
      } catch (error) {
        toast({ variant: "destructive", title: "Erro ao carregar materiais" });
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchMaterials();
      form.reset({ usedMaterials: [] });
    }
  }, [isOpen]);

  const onSubmit = async (data: ConcludeOrderFormValues) => {
    try {
      const materialsWithNames = data.usedMaterials.map(used => {
          const material = materials.find(m => m.id === used.materialId);
          return {
              ...used,
              materialName: material?.name || 'Desconhecido'
          };
      });

      await concludeOrderWithStockUpdate(order.id, materialsWithNames);
      onOrderConcluded({ status: 'Concluído', materialsUsed: materialsWithNames });

      toast({ title: "Pedido Concluído!", description: "Estoque atualizado com sucesso." });
      setIsOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao Concluir",
        description: error.message || "Verifique o estoque dos materiais.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl flex flex-col h-[90dvh] sm:h-auto sm:max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="font-headline text-2xl text-primary">Concluir Pedido</DialogTitle>
          <DialogDescription>
            Dê baixa nos materiais utilizados para manter seu estoque atualizado.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {fields.map((field, index) => {
                      const selectedMaterialId = form.watch(`usedMaterials.${index}.materialId`);
                      const selectedMaterial = materials.find(m => m.id === selectedMaterialId);
                      
                      return (
                        <div key={field.id} className="p-4 border rounded-lg bg-card/50 grid grid-cols-1 gap-4 relative">
                          <FormField
                            control={form.control}
                            name={`usedMaterials.${index}.materialId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Material</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-12">
                                      <SelectValue placeholder="Selecione um material..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {materials.map(material => (
                                      <SelectItem key={material.id} value={material.id}>
                                        {material.name} (Saldo: {material.stock})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`usedMaterials.${index}.quantityUsed`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantidade Usada ({selectedMaterial?.unit || 'un'})</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.1" placeholder="Ex: 1.5" {...field} className="h-12" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8"
                                onClick={() => remove(index)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                      );
                    })}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-dashed"
                    onClick={() => append({ materialId: "", quantityUsed: 0 })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Material Usado
                  </Button>
                </>
              )}
            </div>

            <DialogFooter className="p-6 border-t bg-muted/20">
              <Button type="submit" disabled={loading || form.formState.isSubmitting} className="w-full h-12 text-base font-bold shadow-lg">
                {form.formState.isSubmitting ? 'Processando...' : 'Finalizar e Concluir'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
