
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
  phone: z.string().min(10, "Informe o DDD e o número completo."),
  email: z.string().email("E-mail inválido.").optional().or(z.literal('')),
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
        toast({ title: "Cadastro Atualizado" });
      } else {
        const newCustomer = await addCustomer(data);
        onCustomerCreated(newCustomer);
        toast({ title: "Cliente Cadastrado!" });
      }
      setIsOpen(false);
      form.reset(defaultValues);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar os dados.",
      });
    }
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[425px] h-auto max-h-[90dvh] flex flex-col p-0 overflow-hidden">
      <DialogHeader className="p-6 pb-2">
        <DialogTitle className="font-headline text-2xl">{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        <DialogDescription>
          {isEditing ? 'Atualize as informações de contato.' : 'Cadastre um novo cliente para seu ateliê.'}
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Maria Souza" {...field} className="h-12 text-base" />
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
                  <FormLabel>WhatsApp / Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: (11) 99999-9999" {...field} className="h-12 text-base" />
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
                  <FormLabel>E-mail (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: maria@email.com" {...field} className="h-12 text-base" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <DialogFooter className="p-6 border-t bg-muted/20">
            <Button type="submit" className="w-full h-12 text-base font-bold shadow-md">
                {isEditing ? 'Salvar Alterações' : 'Salvar Cliente'}
            </Button>
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
