
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
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os materiais." });
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchMaterials();
      form.reset({ usedMaterials: [] });
    }
  }, [isOpen, toast, form]);

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

      toast({
        title: "Pedido Concluído!",
        description: `O pedido de ${order.customerName} foi finalizado e o estoque atualizado.`,
      });
      setIsOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao Concluir Pedido",
        description: error.message || "Não foi possível atualizar o estoque ou o pedido.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl flex flex-col h-full sm:h-auto sm:max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-headline">Concluir Pedido e Dar Baixa no Estoque</DialogTitle>
          <DialogDescription>
            Selecione os materiais utilizados neste pedido para atualizar o estoque automaticamente. O status do pedido será alterado para "Concluído".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto pr-6 -mr-6 space-y-4">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-10 w-32" />
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {fields.map((field, index) => {
                      const selectedMaterialId = form.watch(`usedMaterials.${index}.materialId`);
                      const selectedMaterial = materials.find(m => m.id === selectedMaterialId);
                      
                      return (
                        <div key={field.id} className="p-4 border rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                          <FormField
                            control={form.control}
                            name={`usedMaterials.${index}.materialId`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Material</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione um material..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {materials.map(material => (
                                      <SelectItem key={material.id} value={material.id}>
                                        {material.name} (Estoque: {material.stock} {material.unit})
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
                                <FormLabel>Qtd. Usada ({selectedMaterial?.unit || 'un'})</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.1" placeholder="Ex: 1.5" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-1 right-1 h-7 w-7"
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
                    size="sm"
                    onClick={() => append({ materialId: "", quantityUsed: 0 })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Material
                  </Button>
                </>
              )}
            </div>

            <DialogFooter className="pt-4 mt-4 border-t">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={form.formState.isSubmitting}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading || form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Finalizando...' : 'Concluir Pedido'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
