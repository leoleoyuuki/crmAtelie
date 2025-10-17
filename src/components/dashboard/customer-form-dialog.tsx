
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
import { addCustomer, updateCustomer } from "@/lib/data";
import { Customer } from "@/lib/types";

const customerFormSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  phone: z.string().min(10, "O número de telefone parece muito curto."),
  email: z.string().email("Formato de email inválido.").optional().or(z.literal('')),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CustomerFormDialogProps {
  customer?: Customer;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onCustomerCreated: (customer: Customer) => void;
  onCustomerUpdated: (customer: Customer) => void;
}

export function CustomerFormDialog({
  customer,
  isOpen: controlledIsOpen,
  setIsOpen: setControlledIsOpen,
  trigger,
  onCustomerCreated,
  onCustomerUpdated,
}: CustomerFormDialogProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = React.useState(false);
  const { toast } = useToast();
  const isEditing = !!customer;

  const isOpen = controlledIsOpen ?? uncontrolledIsOpen;
  const setIsOpen = setControlledIsOpen ?? setUncontrolledIsOpen;

  const defaultValues: Partial<CustomerFormValues> = {
    name: "",
    phone: "",
    email: "",
  };

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) {
        if (isEditing && customer) {
            form.reset({
                name: customer.name,
                phone: customer.phone,
                email: customer.email || "",
            });
        } else {
            form.reset(defaultValues);
        }
    }
  }, [customer, form, isEditing, isOpen]);

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      if (isEditing && customer) {
        const updatedCustomer = await updateCustomer(customer.id, data);
        onCustomerUpdated(updatedCustomer);
        toast({
          title: "Cliente Atualizado",
          description: `Os dados de ${updatedCustomer.name} foram atualizados.`,
        });
      } else {
        const newCustomer = await addCustomer(data);
        onCustomerCreated(newCustomer);
        toast({
          title: "Cliente Criado",
          description: `O cliente ${newCustomer.name} foi adicionado.`,
        });
      }
      setIsOpen(false);
      form.reset(defaultValues);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: isEditing ? "Não foi possível atualizar o cliente." : "Não foi possível criar o cliente.",
      });
    }
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="font-headline">{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        <DialogDescription>
          {isEditing ? 'Atualize os detalhes deste cliente.' : 'Preencha os detalhes para adicionar um novo cliente.'}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="ex: João da Silva" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="ex: (11) 99999-9999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="ex: joao@email.com" {...field} />
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
            <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Salvar Cliente'}</Button>
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
