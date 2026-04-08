
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
import { addFixedCost } from "@/lib/data";
import { DatePickerWithDialog } from "../ui/date-picker";

const fixedCostFormSchema = z.object({
  description: z.string().min(2, "A descrição deve ter pelo menos 2 caracteres."),
  cost: z.coerce.number().min(0.01, "O custo deve ser maior que zero."),
  date: z.date({ required_error: "A data do custo é obrigatória." }),
});

type FixedCostFormValues = z.infer<typeof fixedCostFormSchema>;

interface FixedCostFormDialogProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onCostCreated: () => void;
}

export function FixedCostFormDialog({
  isOpen: controlledIsOpen,
  setIsOpen: setControlledIsOpen,
  trigger,
  onCostCreated,
}: FixedCostFormDialogProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = React.useState(false);
  const { toast } = useToast();

  const isOpen = controlledIsOpen ?? uncontrolledIsOpen;
  const setIsOpen = setControlledIsOpen ?? setUncontrolledIsOpen;

  const defaultValues: Partial<FixedCostFormValues> = {
    description: "",
    cost: 0,
    date: new Date(),
  };

  const form = useForm<FixedCostFormValues>({
    resolver: zodResolver(fixedCostFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues);
    }
  }, [form, isOpen]);

  const onSubmit = async (data: FixedCostFormValues) => {
    try {
      await addFixedCost(data);
      toast({
        title: "Conta Registrada",
        description: `A conta "${data.description}" foi adicionada.`,
      });
      onCostCreated();
      setIsOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível registrar a conta.",
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
        <DialogTitle className="font-headline text-2xl">Registrar Nova Conta</DialogTitle>
        <DialogDescription>
          Adicione despesas como aluguel, contas de luz, água, internet, etc.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição da Conta</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Aluguel do Ateliê" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="150.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel className="mb-1.5">Data de Pagamento</FormLabel>
                    <DatePickerWithDialog
                        date={field.value}
                        setDate={field.onChange}
                    />
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
            <Button type="submit" className="h-12 px-8 font-bold shadow-md">Salvar Conta</Button>
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
