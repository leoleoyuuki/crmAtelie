
"use client";

import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Check, PhoneOff } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { TrialLimitScreen } from "./trial-limit-screen";

const customerFormSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  phone: z.string().refine(val => !val || val.length >= 10, {
    message: "Informe o DDD e o número completo.",
  }),
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
  const [noPhone, setNoPhone] = React.useState(false);
  const [limitHit, setLimitHit] = React.useState(false);
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
            setNoPhone(!customer.phone || customer.phone === "");
        } else {
            form.reset(defaultValues);
            setNoPhone(false);
        }
        setLimitHit(false);
    }
  }, [customer, form, isEditing, isOpen]);

  useEffect(() => {
    if (noPhone) {
      form.setValue("phone", "");
      form.clearErrors("phone");
    }
  }, [noPhone, form]);

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      if (isEditing && customer) {
        const updatedCustomer = await updateCustomer(customer.id, data);
        onCustomerUpdated(updatedCustomer);
        toast({ variant: "success", title: "Cadastro Atualizado" });
      } else {
        const newCustomer = await addCustomer(data);
        onCustomerCreated(newCustomer);
        toast({ variant: "success", title: "Cliente Cadastrado!" });
      }
      setIsOpen(false);
      form.reset(defaultValues);
    } catch (error: any) {
      if (error?.message === "TRIAL_LIMIT_CUSTOMERS") {
          setLimitHit(true);
      } else {
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível salvar os dados.",
          });
      }
    }
  };

  const dialogContent = (
    <DialogContent 
        className="flex flex-col h-[95dvh] sm:h-auto sm:max-h-[90vh] p-0 overflow-hidden sm:max-w-[425px] lg:max-w-[50%] lg:w-[50%] lg:h-full lg:max-h-none lg:right-0 lg:left-auto lg:top-0 lg:translate-x-0 lg:translate-y-0 lg:rounded-none lg:rounded-l-3xl lg:border-y-0 lg:border-r-0 shadow-2xl lg:duration-500 lg:data-[state=open]:animate-in lg:data-[state=closed]:animate-out lg:data-[state=closed]:slide-out-to-right lg:data-[state=open]:slide-in-from-right lg:data-[state=open]:zoom-in-100 lg:data-[state=closed]:zoom-out-100"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
    >
      {limitHit ? (
          <TrialLimitScreen type="customers" onClose={() => setIsOpen(false)} />
      ) : (
        <>
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
                  <div className="flex items-center justify-between">
                    <FormLabel>WhatsApp / Telefone</FormLabel>
                    <Button
                      type="button"
                      variant={noPhone ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setNoPhone(!noPhone)}
                      className={cn(
                        "h-7 px-2 text-[10px] uppercase font-bold transition-all gap-1.5",
                        noPhone ? "bg-muted text-muted-foreground" : "text-primary border-primary/20 hover:bg-primary/5"
                      )}
                    >
                      {noPhone ? <Check className="h-3 w-3" /> : <PhoneOff className="h-3 w-3" />}
                      Sem WhatsApp
                    </Button>
                  </div>
                  <FormControl>
                    <Input 
                        placeholder={noPhone ? "Cliente não possui telefone" : "ex: (11) 99999-9999"} 
                        {...field} 
                        className="h-12 text-base" 
                        disabled={noPhone}
                    />
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
        </>
      )}
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
