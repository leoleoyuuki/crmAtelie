
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
import { Textarea } from "../ui/textarea";

const priceFormSchema = z.object({
  serviceName: z.string().min(2, "O nome do serviço deve ter pelo menos 2 caracteres."),
  description: z.string().optional(),
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
    description: "",
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
                description: item.description || "",
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
          variant: "success",
          title: "Serviço Atualizado",
          description: `O serviço ${updatedItem.serviceName} foi atualizado.`,
        });
      } else {
        const newItem = await addPriceTableItem(data as Omit<PriceTableItem, 'id' | 'userId'>);
        onItemCreated(newItem);
        toast({
          variant: "success",
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
    <DialogContent 
        className="flex flex-col h-[95dvh] sm:h-auto sm:max-h-[90vh] p-0 overflow-hidden sm:max-w-[425px] lg:max-w-[50%] lg:w-[50%] lg:h-full lg:max-h-none lg:right-0 lg:left-auto lg:top-0 lg:translate-x-0 lg:translate-y-0 lg:rounded-none lg:rounded-l-3xl lg:border-y-0 lg:border-r-0 shadow-2xl lg:duration-500 lg:data-[state=open]:animate-in lg:data-[state=closed]:animate-out lg:data-[state=closed]:slide-out-to-right lg:data-[state=open]:slide-in-from-right lg:data-[state=open]:zoom-in-100 lg:data-[state=closed]:zoom-out-100"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
    >
      <DialogHeader className="p-6 pb-2">
        <DialogTitle className="font-headline text-2xl">{isEditing ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
        <DialogDescription>
          {isEditing ? 'Atualize os detalhes deste serviço.' : 'Preencha os detalhes para adicionar um novo serviço à tabela de preços.'}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição (Opcional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="ex: Bainha invisível feita à mão." {...field} />
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
                  <Input type="number" step="0.01" placeholder="25,00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
          
          <DialogFooter className="p-6 border-t bg-muted/20">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="h-12 px-6">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="h-12 px-8 font-bold shadow-md">{isEditing ? 'Salvar Alterações' : 'Salvar Serviço'}</Button>
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
