
"use client";

import React, { useEffect } from "react";
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
import { addPriceTableItem, updatePriceTableItem } from "@/lib/data";
import { PriceTableItem } from "@/lib/types";

const priceFormSchema = z.object({
  serviceName: z.string().min(2, "O nome do serviço deve ter pelo menos 2 caracteres."),
  price: z.coerce.number().min(0, "O preço deve ser um valor positivo."),
});

type PriceFormValues = z.infer<typeof priceFormSchema>;

interface PriceFormDialogProps {
  item?: PriceTableItem;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onItemCreated: (item: PriceTableItem) => void;
  onItemUpdated: (item: PriceTableItem) => void;
}

export function PriceFormDialog({
  item,
  isOpen: controlledIsOpen,
  setIsOpen: setControlledIsOpen,
  trigger,
  onItemCreated,
  onItemUpdated,
}: PriceFormDialogProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = React.useState(false);
  const { toast } = useToast();
  const isEditing = !!item;

  const isOpen = controlledIsOpen ?? uncontrolledIsOpen;
  const setIsOpen = setControlledIsOpen ?? setUncontrolledIsOpen;

  const defaultValues: Partial<PriceFormValues> = {
    serviceName: "",
    price: 0,
  };

  const form = useForm<PriceFormValues>({
    resolver: zodResolver(priceFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) {
        if (isEditing && item) {
            form.reset({
                serviceName: item.serviceName,
                price: item.price,
            });
        } else {
            form.reset(defaultValues);
        }
    }
  }, [item, form, isEditing, isOpen]);

  const onSubmit = async (data: PriceFormValues) => {
    try {
      if (isEditing && item) {
        const updatedItem = await updatePriceTableItem(item.id, data);
        onItemUpdated(updatedItem);
        toast({
          title: "Serviço Atualizado",
          description: `O serviço ${updatedItem.serviceName} foi atualizado.`,
        });
      } else {
        const newItem = await addPriceTableItem(data);
        onItemCreated(newItem);
        toast({
          title: "Serviço Criado",
          description: `O serviço ${newItem.serviceName} foi adicionado à tabela.`,
        });
      }
      setIsOpen(false);
      form.reset(defaultValues);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: isEditing ? "Não foi possível atualizar o serviço." : "Não foi possível criar o serviço.",
      });
    }
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="font-headline">{isEditing ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
        <DialogDescription>
          {isEditing ? 'Atualize os detalhes deste serviço.' : 'Preencha os detalhes para adicionar um novo serviço à tabela de preços.'}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="serviceName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Serviço</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Bainha de Calça Social" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço (R$)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="25,00" {...field} />
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
            <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Salvar Serviço'}</Button>
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
