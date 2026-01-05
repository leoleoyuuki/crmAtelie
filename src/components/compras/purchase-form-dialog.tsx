
"use client";

import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  DialogTrigger,
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
import { useToast } from "@/hooks/use-toast";
import { addPurchase, getMaterials } from "@/lib/data";
import { Purchase, Material } from "@/lib/types";
import { useCollection } from "@/firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "../ui/separator";

const purchaseFormSchema = z.object({
  materialName: z.string().optional(),
  newMaterialName: z.string().optional(),
  unit: z.string().min(1, "A unidade é obrigatória (ex: m, cm, un)."),
  quantity: z.coerce.number().min(0.01, "A quantidade deve ser maior que zero."),
  cost: z.coerce.number().min(0, "O custo deve ser um valor positivo."),
  category: z.string().optional(),
  newCategory: z.string().optional(),
})
.refine(data => data.materialName || data.newMaterialName, {
    message: "Selecione um material ou crie um novo.",
    path: ["materialName"],
})
.refine(data => data.category || data.newCategory, {
    message: "Selecione uma categoria ou crie uma nova.",
    path: ["category"],
});

type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;

interface PurchaseFormDialogProps {
  purchase?: Purchase;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onPurchaseCreated: () => void;
}

export function PurchaseFormDialog({
  purchase,
  isOpen: controlledIsOpen,
  setIsOpen: setControlledIsOpen,
  trigger,
  onPurchaseCreated,
}: PurchaseFormDialogProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = React.useState(false);
  const { toast } = useToast();
  const isEditing = !!purchase;

  const isOpen = controlledIsOpen ?? uncontrolledIsOpen;
  const setIsOpen = setControlledIsOpen ?? setUncontrolledIsOpen;

  const { data: allPurchases } = useCollection<Purchase>('purchases');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    async function fetchData() {
        if (allPurchases) {
            const uniqueCategories = [...new Set(allPurchases.map(p => p.category).filter(Boolean) as string[])].sort();
            setCategories(uniqueCategories.map(c => ({ value: c, label: c })));
        }
        const fetchedMaterials = await getMaterials();
        setMaterials(fetchedMaterials);
    }
    if (isOpen) {
        fetchData();
    }
  }, [allPurchases, isOpen]);

  const defaultValues: Partial<PurchaseFormValues> = {
    materialName: "",
    newMaterialName: "",
    unit: "",
    quantity: 0,
    cost: 0,
    category: "",
    newCategory: "",
  };

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues);
    }
  }, [form, isOpen]);

  const onSubmit = async (data: PurchaseFormValues) => {
    try {
      const finalMaterialName = data.newMaterialName?.trim() || data.materialName;
      const finalCategory = data.newCategory?.trim() || data.category;
      
      if (!finalMaterialName) {
          form.setError("materialName", { message: "O nome do material é obrigatório." });
          return;
      }
      if (!finalCategory) {
          form.setError("category", { message: "A categoria é obrigatória." });
          return;
      }

      const dataToSave: Omit<Purchase, 'id' | 'userId' | 'createdAt'> = {
        materialName: finalMaterialName,
        unit: data.unit,
        quantity: data.quantity,
        cost: data.cost,
        category: finalCategory,
      };

      await addPurchase(dataToSave);
      toast({
        title: "Compra Registrada",
        description: `A compra de ${finalMaterialName} foi adicionada.`,
      });
      
      onPurchaseCreated();
      setIsOpen(false);
      form.reset(defaultValues);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível registrar a compra.",
      });
    }
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[520px]">
      <DialogHeader>
        <DialogTitle className="font-headline">Registrar Nova Compra</DialogTitle>
        <DialogDescription>
          Adicione uma nova compra de material para o seu controle de custos e estoque.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2 p-4 border rounded-md">
                <FormLabel className="font-semibold">Material</FormLabel>
                <FormField
                    control={form.control}
                    name="materialName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Material Existente</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um material do estoque..." />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {materials.map(mat => (
                                    <SelectItem key={mat.id} value={mat.name}>{mat.name} ({mat.unit})</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <div className="flex items-center gap-2">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">OU</span>
                    <Separator className="flex-1" />
                </div>
                <FormField
                    control={form.control}
                    name="newMaterialName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Criar Novo Material</FormLabel>
                            <FormControl>
                                <Input placeholder="ex: Zíper Invisível 20cm" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
           <div className="space-y-2 p-4 border rounded-md">
                 <FormLabel className="font-semibold">Categoria</FormLabel>
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Categoria Existente</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex items-center gap-2">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">OU</span>
                    <Separator className="flex-1" />
                </div>
                 <FormField
                    control={form.control}
                    name="newCategory"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Criar Nova Categoria</FormLabel>
                            <FormControl>
                                <Input placeholder="ex: Aviamentos" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
           </div>


          <div className="grid grid-cols-3 gap-4">
            <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                    <Input type="number" step="0.1" placeholder="10" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <FormControl>
                    <Input placeholder="m, un, cm" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Custo Total (R$)</FormLabel>
                     <FormControl>
                        <Input type="number" step="0.01" placeholder="15.50" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">Registrar Compra</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );

  if (trigger) {
      return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>{trigger}</DialogTrigger>
          {dialogContent}
        </Dialog>
      )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {dialogContent}
    </Dialog>
  );
}
