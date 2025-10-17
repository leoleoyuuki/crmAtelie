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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Order, OrderStatus, ServiceType } from "@/lib/types";
import { addOrder, updateOrder } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";

const orderFormSchema = z.object({
  customerName: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  customerPhone: z.string().min(10, "O número de telefone parece muito curto."),
  serviceType: z.enum(["Ajuste", "Design Personalizado", "Reparo", "Lavagem a Seco"]),
  description: z.string().max(200, "A descrição é muito longa.").optional(),
  totalValue: z.coerce.number().min(0, "O valor deve ser positivo."),
  dueDate: z.date({ required_error: "A data de entrega é obrigatória." }),
  status: z.enum(['Pendente', 'Em Andamento', 'Aguardando Retirada', 'Concluído', 'Entregue']),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

const serviceTypes: ServiceType[] = ["Ajuste", "Design Personalizado", "Reparo", "Lavagem a Seco"];
const statuses: OrderStatus[] = ['Pendente', 'Em Andamento', 'Aguardando Retirada', 'Concluído', 'Entregue'];

interface OrderFormDialogProps {
  order?: Order;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  onOrderCreated?: (order: Order) => void;
  onOrderUpdated?: (updatedOrder: Partial<Order>) => void;
}

export function OrderFormDialog({
  order,
  isOpen: controlledIsOpen,
  setIsOpen: setControlledIsOpen,
  onOrderCreated,
  onOrderUpdated,
}: OrderFormDialogProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = React.useState(false);
  const isEditing = !!order;
  const { toast } = useToast();

  const isOpen = controlledIsOpen ?? uncontrolledIsOpen;
  const setIsOpen = setControlledIsOpen ?? setUncontrolledIsOpen;

  const defaultValues: Partial<OrderFormValues> = order ? {
    ...order,
    totalValue: order.totalValue,
  } : {
    status: 'Pendente',
  };

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues,
  });
  
  useEffect(() => {
    if (order) {
        form.reset(order);
    } else {
        form.reset({
            customerName: '',
            customerPhone: '',
            description: '',
            status: 'Pendente',
        });
    }
  }, [order, form, isOpen]);


  const onSubmit = async (data: OrderFormValues) => {
    try {
      if (isEditing && order) {
        const updated = await updateOrder(order.id, data);
        onOrderUpdated?.(updated);
        toast({ title: "Pedido Atualizado", description: `O pedido #${order.id} foi atualizado.` });
      } else {
        const newOrder = await addOrder(data as Omit<Order, 'id' | 'createdAt'>);
        onOrderCreated?.(newOrder);
        toast({ title: "Pedido Criado", description: `Novo pedido #${newOrder.id} foi criado.` });
      }
      setIsOpen(false);
      form.reset();
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Algo deu errado." });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isEditing && (
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Pedido
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{isEditing ? "Editar Pedido" : "Criar Novo Pedido"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize os detalhes deste pedido." : "Preencha os detalhes para o novo pedido do cliente."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nome do Cliente</FormLabel>
                    <FormControl>
                        <Input placeholder="ex: João da Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Telefone do Cliente</FormLabel>
                    <FormControl>
                        <Input placeholder="ex: (11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Serviço</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um tipo de serviço" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {serviceTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva os detalhes do serviço..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="totalValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="ex: 50,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1.5">Data de Entrega</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status do pedido" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Criar Pedido'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
