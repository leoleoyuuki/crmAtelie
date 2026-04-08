
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
import { updateMaterial } from "@/lib/data";
import { Material } from "@/lib/types";

const materialFormSchema = z.object({
  name: z.string().min(2, "O nome do material deve ter pelo menos 2 caracteres."),
  unit: z.string().min(1, "A unidade é obrigatória (ex: m, cm, un)."),
  stock: z.coerce.number().min(0, "O estoque deve ser positivo."),
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
        });
      } else {
        form.reset(defaultValues);
      }
    }
  }, [material, form, isEditing, isOpen]);

  const onSubmit = async (data: MaterialFormValues) => {
    if (!isEditing || !material) return;
    try {
      await updateMaterial(material.id, data);
      toast({
        variant: "success",
        title: "Material Atualizado",
        description: `O material ${data.name} foi atualizado.`,
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o material.",
      });
    }
  };

  const dialogContent = (
    <DialogContent 
        className="flex flex-col h-[95dvh] sm:h-auto sm:max-h-[90vh] p-0 overflow-hidden sm:max-w-[480px] lg:max-w-[50%] lg:w-[50%] lg:h-full lg:max-h-none lg:right-0 lg:left-auto lg:top-0 lg:translate-x-0 lg:translate-y-0 lg:rounded-none lg:rounded-l-3xl lg:border-y-0 lg:border-r-0 shadow-2xl lg:duration-500 lg:data-[state=open]:animate-in lg:data-[state=closed]:animate-out lg:data-[state=closed]:slide-out-to-right lg:data-[state=open]:slide-in-from-right lg:data-[state=open]:zoom-in-100 lg:data-[state=closed]:zoom-out-100"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
    >
      <DialogHeader className="p-6 pb-2">
        <DialogTitle className="font-headline text-2xl">Editar Material</DialogTitle>
        <DialogDescription>
          Atualize os detalhes deste item do seu estoque. A quantidade é alterada ao registrar compras ou concluir pedidos.
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
                <FormLabel>Nome do Material</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Cola branca ou Papelão" {...field} />
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
                  <FormLabel>Estoque Atual</FormLabel>
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


          </div>
          
          <DialogFooter className="p-6 border-t bg-muted/20">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="h-12 px-6">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="h-12 px-8 font-bold shadow-md">Salvar Alterações</Button>
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
