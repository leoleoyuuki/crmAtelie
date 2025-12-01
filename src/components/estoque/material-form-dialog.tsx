
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
import { addMaterial, updateMaterial } from "@/lib/data";
import { Material } from "@/lib/types";
import { useCollection } from "@/firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "../ui/separator";

const materialFormSchema = z.object({
  name: z.string().min(2, "O nome do material deve ter pelo menos 2 caracteres."),
  unit: z.string().min(1, "A unidade é obrigatória (ex: m, cm, un)."),
  stock: z.coerce.number().min(0, "O estoque não pode ser negativo."),
  costPerUnit: z.coerce.number().min(0, "O custo deve ser um valor positivo."),
  category: z.string().optional(),
  newCategory: z.string().optional(),
}).refine(data => data.category || data.newCategory, {
    message: "Selecione uma categoria ou crie uma nova.",
    path: ["category"],
});

type MaterialFormValues = z.infer<typeof materialFormSchema>;

interface MaterialFormDialogProps {
  material?: Material;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function MaterialFormDialog({
  material,
  isOpen: controlledIsOpen,
  setIsOpen: setControlledIsOpen,
  trigger,
}: MaterialFormDialogProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = React.useState(false);
  const { toast } = useToast();
  const isEditing = !!material;

  const isOpen = controlledIsOpen ?? uncontrolledIsOpen;
  const setIsOpen = setControlledIsOpen ?? setUncontrolledIsOpen;

  const { data: allMaterials } = useCollection<Material>('materials');
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (allMaterials) {
        const uniqueCategories = [...new Set(allMaterials.map(m => m.category).filter(Boolean) as string[])].sort();
        const categoryOptions = uniqueCategories.map(c => ({ value: c, label: c }));
        setCategories(categoryOptions);
    }
  }, [allMaterials]);

  const defaultValues: Partial<MaterialFormValues> = {
    name: "",
    unit: "",
    stock: 0,
    costPerUnit: 0,
    category: "",
    newCategory: "",
  };

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) {
        if (isEditing && material) {
            form.reset({
                name: material.name,
                unit: material.unit,
                stock: material.stock,
                costPerUnit: material.costPerUnit,
                category: material.category || "",
                newCategory: "",
            });
        } else {
            form.reset(defaultValues);
        }
    }
  }, [material, form, isEditing, isOpen]);

  const onSubmit = async (data: MaterialFormValues) => {
    try {
      const finalCategory = data.newCategory?.trim() || data.category;
      if (!finalCategory) {
          form.setError("category", { message: "A categoria é obrigatória." });
          return;
      }

      const dataToSave: Partial<Material> = {
        name: data.name,
        unit: data.unit,
        stock: data.stock,
        costPerUnit: data.costPerUnit,
        category: finalCategory,
      };

      if (isEditing && material) {
        await updateMaterial(material.id, dataToSave);
        toast({
          title: "Material Atualizado",
          description: `O material ${data.name} foi atualizado.`,
        });
      } else {
        // When creating, we also set the initialStock
        const createData = {
          ...dataToSave,
          initialStock: data.stock, // Set initial stock on creation
        } as Omit<Material, 'id' | 'userId' | 'createdAt'>;
        await addMaterial(createData);
        toast({
          title: "Material Adicionado",
          description: `O material ${data.name} foi adicionado ao estoque.`,
        });
      }
      setIsOpen(false);
      form.reset(defaultValues);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: isEditing ? "Não foi possível atualizar o material." : "Não foi possível adicionar o material.",
      });
    }
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle className="font-headline">{isEditing ? 'Editar Material' : 'Novo Material'}</DialogTitle>
        <DialogDescription>
          {isEditing ? 'Atualize os detalhes deste material.' : 'Adicione um novo material ao seu inventário.'}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Material</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Linha de Costura Branca" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

           <div className="space-y-2">
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
                                <Input placeholder="ex: Tecidos Finos" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
           </div>


          <div className="grid grid-cols-3 gap-4">
            <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Estoque Inicial</FormLabel>
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
                name="costPerUnit"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Custo por Unidade</FormLabel>
                     <FormControl>
                        <Input type="number" step="0.01" placeholder="1.50" {...field} />
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
            <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Adicionar ao Estoque'}</Button>
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
