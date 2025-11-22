
"use client";

import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Order, OrderStatus, ServiceType, Customer } from "@/lib/types";
import { addOrder, updateOrder, getCustomers } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, UserPlus, Trash2 } from "lucide-react";
import { CustomerFormDialog } from "./customer-form-dialog";
import { Separator } from "../ui/separator";

const orderItemSchema = z.object({
  serviceType: z.enum(["Ajuste", "Design Personalizado", "Reparo", "Lavagem a Seco"]),
  description: z.string().optional(),
  value: z.coerce.number().min(0, "O valor deve ser positivo."),
  assignedTo: z.string().optional(),
});

const orderFormSchema = z.object({
  customerId: z.string({ required_error: "Selecione um cliente." }).min(1, "Selecione um cliente."),
  items: z.array(orderItemSchema).min(1, "O pedido deve ter pelo menos um item."),
  dueDate: z.date({ required_error: "A data de entrega é obrigatória." }),
  status: z.enum(['Novo', 'Em Processo', 'Aguardando Retirada', 'Concluído']),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

const serviceTypes: ServiceType[] = ["Ajuste", "Design Personalizado", "Reparo", "Lavagem a Seco"];
const statuses: OrderStatus[] = ['Novo', 'Em Processo', 'Aguardando Retirada', 'Concluído'];

interface OrderFormDialogProps {
  order?: Order;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  onOrderCreated?: (order: Order) => void;
  onOrderUpdated?: (orderId: string, updatedOrder: Partial<Order>) => void;
}

export function OrderFormDialog({
  order,
  isOpen: controlledIsOpen,
  setIsOpen: setControlledIsOpen,
  onOrderCreated,
  onOrderUpdated,
}: OrderFormDialogProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = React.useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState("");
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const isEditing = !!order;
  const { toast } = useToast();

  const isOpen = controlledIsOpen ?? uncontrolledIsOpen;
  const setIsOpen = setControlledIsOpen ?? setUncontrolledIsOpen;

  useEffect(() => {
    const fetchAndSetCustomers = async () => {
      try {
        const fetchedCustomers = await getCustomers();
        setCustomers(fetchedCustomers);
      } catch (error) {
        console.error("Failed to fetch customers", error);
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os clientes." });
      }
    };

    if (isOpen) {
      fetchAndSetCustomers();
    }
  }, [isOpen, toast]);

   useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCustomerSearch(customerSearch);
      if (customerSearch) {
        setIsSelectOpen(true);
      }
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [customerSearch]);


  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(debouncedCustomerSearch.toLowerCase()) ||
    c.phone.includes(debouncedCustomerSearch)
  );
  
  const defaultValues: Partial<OrderFormValues> = {
    customerId: '',
    items: [{ serviceType: 'Ajuste', value: 0, description: '', assignedTo: '' }],
    dueDate: new Date(),
    status: 'Novo',
  };

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  useEffect(() => {
    if (isOpen) {
      setCustomerSearch(""); // Reset search on open
      if (order) {
          form.reset({
            ...order,
            items: order.items 
                ? order.items.map(item => ({...item, description: item.description ?? '', assignedTo: item.assignedTo ?? ''})) 
                : defaultValues.items,
          });
      } else {
          form.reset(defaultValues);
      }
    }
  }, [order, form, isOpen]);

  const onSubmit = async (data: OrderFormValues) => {
    const selectedCustomer = customers.find(c => c.id === data.customerId);
    if (!selectedCustomer) {
        toast({ variant: "destructive", title: "Erro", description: "Cliente selecionado não encontrado." });
        return;
    }
    
    try {
      const totalValue = data.items.reduce((sum, item) => sum + item.value, 0);
      const orderData = {
        ...data,
        customerName: selectedCustomer.name,
        totalValue,
      };

      if (isEditing && order) {
        const updated = await updateOrder(order.id, orderData);
        onOrderUpdated?.(order.id, updated);
        toast({ title: "Pedido Atualizado", description: `O pedido foi atualizado.` });
      } else {
        const newOrder = await addOrder(orderData as Omit<Order, 'id' | 'createdAt' | 'userId'>);
        onOrderCreated?.(newOrder as Order);
        toast({ title: "Pedido Criado", description: `Novo pedido foi criado.` });
      }
      setIsOpen(false);
      form.reset(defaultValues);
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Algo deu errado." });
    }
  };

  const handleCustomerCreated = (newCustomer: Customer) => {
    setCustomers(prev => [newCustomer, ...prev]);
    form.setValue('customerId', newCustomer.id);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {!isEditing && (
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Pedido
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-3xl flex flex-col max-h-[95vh] h-full sm:h-auto sm:max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="font-headline">{isEditing ? "Editar Pedido" : "Criar Novo Pedido"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Atualize os detalhes deste pedido." : "Preencha os detalhes para o novo pedido do cliente."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto pr-6 space-y-4">
                <div className="space-y-2">
                  <FormLabel>Cliente</FormLabel>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Buscar cliente por nome ou telefone..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                        />
                        <FormField
                          control={form.control}
                          name="customerId"
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                open={isSelectOpen}
                                onOpenChange={setIsSelectOpen}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um cliente da lista" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {filteredCustomers.length > 0 ? (
                                    filteredCustomers.map(c => (
                                      <SelectItem key={c.id} value={c.id}>
                                        {c.name} - {c.phone}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <div className="p-4 text-sm text-muted-foreground">Nenhum cliente encontrado.</div>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                      <Button type="button" variant="outline" size="icon" onClick={() => setIsCustomerDialogOpen(true)}>
                          <UserPlus className="h-4 w-4" />
                      </Button>
                  </div>
                </div>

                <Separator />
                
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                      <FormLabel className="font-semibold">Item {index + 1}</FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                              control={form.control}
                              name={`items.${index}.serviceType`}
                              render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Tipo de Serviço</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                      <SelectTrigger>
                                      <SelectValue placeholder="Selecione..." />
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
                              name={`items.${index}.value`}
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Valor (R$)</FormLabel>
                                  <FormControl>
                                      <Input type="number" placeholder="50,00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />
                      </div>
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>Descrição</FormLabel>
                              <FormControl>
                              <Input placeholder="Detalhes do serviço..." {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name={`items.${index}.assignedTo`}
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>Atribuído a</FormLabel>
                              <FormControl>
                              <Input placeholder="Nome do profissional" {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                      {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ serviceType: 'Ajuste', value: 0, description: '', assignedTo: '' })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
                </Button>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                              <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
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
                </div>
              </div>
              
              <DialogFooter className="pt-4 border-t">
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
      <CustomerFormDialog 
        isOpen={isCustomerDialogOpen} 
        setIsOpen={setIsCustomerDialogOpen}
        onCustomerCreated={handleCustomerCreated}
        onCustomerUpdated={() => {}}
      />
    </>
  );
}
