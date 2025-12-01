
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
import { Textarea } from "../ui/textarea";

const materialFormSchema = z.object({
  name: z.string().min(2, "O nome do material deve ter pelo menos 2 caracteres."),
  unit: z.string().min(1, "A unidade é obrigatória (ex: m, cm, un)."),
  stock: z.coerce.number().min(0, "O estoque inicial deve ser positivo."),
  costPerUnit: z.coerce.number().min(0, "O custo deve ser um valor positivo."),
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

  const defaultValues: Partial<MaterialFormValues> = {
    name: "",
    unit: "",
    stock: 0,
    costPerUnit: 0,
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
        });
      } else {
        form.reset(defaultValues);
      }
    }
  }, [material, form, isEditing, isOpen]);

  const onSubmit = async (data: MaterialFormValues) => {
    try {
      if (isEditing && material) {
        await updateMaterial(material.id, data);
        toast({
          title: "Material Atualizado",
          description: `O material ${data.name} foi atualizado.`,
        });
      } else {
        await addMaterial(data);
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
        description: "Não foi possível salvar o material.",
      });
    }
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle className="font-headline">{isEditing ? "Editar Material" : "Novo Material no Estoque"}</DialogTitle>
        <DialogDescription>
          {isEditing ? "Atualize os detalhes deste item do seu estoque." : "Adicione um novo item ao seu inventário."}
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

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <FormField
            control={form.control}
            name="costPerUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custo por Unidade (R$)</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder="1.50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">{isEditing ? "Salvar Alterações" : "Adicionar ao Estoque"}</Button>
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
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {dialogContent}
    </Dialog>
  );
}
