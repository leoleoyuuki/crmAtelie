
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
import { Order, OrderStatus, ServiceType, Customer, PriceTableItem } from "@/lib/types";
import { addOrder, updateOrder, getCustomers, getPriceTableItems } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, UserPlus, Trash2 } from "lucide-react";
import { CustomerFormDialog } from "./customer-form-dialog";
import { Separator } from "../ui/separator";
import { DatePickerWithDialog } from "../ui/date-picker";

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

function OrderItemForm({ index, control, remove, priceTableItems, setValue }: any) {
    const [serviceSearch, setServiceSearch] = useState("");
    const [debouncedServiceSearch, setDebouncedServiceSearch] = useState("");
    const [isServiceSelectOpen, setIsServiceSelectOpen] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedServiceSearch(serviceSearch);
        }, 500);
        return () => clearTimeout(handler);
    }, [serviceSearch]);

    const filteredServices = priceTableItems.filter((s: PriceTableItem) =>
        s.serviceName.toLowerCase().includes(debouncedServiceSearch.toLowerCase())
    );

    const handlePriceItemSelect = (itemId: string) => {
        if (!itemId) return;
        const selectedItem = priceTableItems.find((item: PriceTableItem) => item.id === itemId);
        if (selectedItem) {
            const serviceNameLower = selectedItem.serviceName.toLowerCase();
            let matchedServiceType: ServiceType = 'Ajuste';
            if (serviceNameLower.includes('design')) matchedServiceType = 'Design Personalizado';
            else if (serviceNameLower.includes('reparo') || serviceNameLower.includes('conserto')) matchedServiceType = 'Reparo';
            else if (serviceNameLower.includes('lavagem')) matchedServiceType = 'Lavagem a Seco';
            
            setValue(`items.${index}.serviceType`, matchedServiceType);
            setValue(`items.${index}.description`, selectedItem.description || selectedItem.serviceName);
            setValue(`items.${index}.value`, selectedItem.price);
            
            // Update search input text and close menu
            setServiceSearch(selectedItem.serviceName);
            setIsServiceSelectOpen(false);
        }
    };

    return (
        <div className="p-4 border rounded-lg space-y-4 relative bg-card/50">
            <div className="flex justify-between items-center">
                <FormLabel className="font-semibold text-primary">Item {index + 1}</FormLabel>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
            
            <div className="space-y-2">
                <FormLabel className="text-xs">Buscar na Tabela de Preços</FormLabel>
                <div className="flex gap-2">
                    <Input
                        placeholder="Nome do serviço..."
                        value={serviceSearch}
                        onChange={(e) => {
                            setServiceSearch(e.target.value);
                            if (e.target.value.trim() !== "") {
                                setIsServiceSelectOpen(true);
                            }
                        }}
                        className="h-9"
                    />
                    <Select
                        onValueChange={(value) => handlePriceItemSelect(value)}
                        open={isServiceSelectOpen}
                        onOpenChange={setIsServiceSelectOpen}
                    >
                        <SelectTrigger className="h-9 w-12 p-0 flex justify-center">
                            <PlusCircle className="h-4 w-4 text-muted-foreground" />
                        </SelectTrigger>
                        <SelectContent align="end">
                            {filteredServices.length > 0 ? (
                                filteredServices.map((s: PriceTableItem) => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.serviceName} - R${s.price.toFixed(2)}
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="p-4 text-sm text-muted-foreground text-center">Nenhum serviço encontrado.</div>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Separator className="flex-1" />
                <span className="text-[10px] text-muted-foreground uppercase font-bold">ou preencher manual</span>
                <Separator className="flex-1" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={control}
                    name={`items.${index}.serviceType`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo</FormLabel>
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
                    control={control}
                    name={`items.${index}.value`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Valor (R$)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="0,00" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <FormField
                control={control}
                name={`items.${index}.description`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Descrição/Detalhes</FormLabel>
                        <FormControl>
                            <Input placeholder="Cor, tecido, ajustes específicos..." {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}

interface OrderFormDialogProps {
  order?: Order;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onOrderCreated?: () => void;
  onOrderUpdated?: () => void;
}

export function OrderFormDialog({
  order,
  isOpen: controlledIsOpen,
  setIsOpen: setControlledIsOpen,
  trigger,
  onOrderCreated,
  onOrderUpdated,
}: OrderFormDialogProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = React.useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [priceTableItems, setPriceTableItems] = useState<PriceTableItem[]>([]);
  
  const [customerSearch, setCustomerSearch] = useState("");
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState("");
  const [isCustomerSelectOpen, setIsCustomerSelectOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!order;
  const { toast } = useToast();

  const isOpen = controlledIsOpen ?? uncontrolledIsOpen;
  const setIsOpen = setControlledIsOpen ?? setUncontrolledIsOpen;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedCustomers, fetchedPriceItems] = await Promise.all([
          getCustomers(),
          getPriceTableItems(),
        ]);
        setCustomers(fetchedCustomers);
        setPriceTableItems(fetchedPriceItems);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

   useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCustomerSearch(customerSearch);
      if (customerSearch) {
        setIsCustomerSelectOpen(true);
      }
    }, 500);
    return () => clearTimeout(handler);
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

  const { control, setValue } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });
  
  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      setCustomerSearch("");
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
    setIsSubmitting(true);
    const selectedCustomer = customers.find(c => c.id === data.customerId);
    if (!selectedCustomer) {
        toast({ variant: "destructive", title: "Erro", description: "Selecione um cliente válido." });
        setIsSubmitting(false);
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
        await updateOrder(order.id, orderData);
        onOrderUpdated?.();
        toast({ title: "Pedido Atualizado" });
      } else {
        await addOrder(orderData as Omit<Order, 'id' | 'createdAt' | 'userId'>);
        onOrderCreated?.();
        toast({ title: "Pedido Criado com Sucesso" });
      }
      setIsOpen(false);
      form.reset(defaultValues);
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar o pedido." });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleCustomerCreated = (newCustomer: Customer) => {
    setCustomers(prev => [newCustomer, ...prev]);
    form.setValue('customerId', newCustomer.id);
    setIsCustomerSelectOpen(true);
    onOrderCreated?.();
  };

  const handleCustomerUpdated = (updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    form.setValue('customerId', updatedCustomer.id);
  };

   const dialogContent = (
    <DialogContent className="sm:max-w-3xl flex flex-col h-[95dvh] sm:h-auto sm:max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
            <DialogTitle className="font-headline text-2xl">{isEditing ? "Editar Pedido" : "Novo Pedido"}</DialogTitle>
            <DialogDescription>
                Registre os serviços e defina o prazo de entrega.
            </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto px-6 space-y-6 pt-2">
                    <div className="space-y-3">
                        <FormLabel>Cliente</FormLabel>
                        <div className="flex items-start gap-2">
                            <div className="flex-1 space-y-2">
                                <Input
                                    placeholder="Buscar por nome ou telefone..."
                                    value={customerSearch}
                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                    className="h-10"
                                />
                                <FormField
                                    control={form.control}
                                    name="customerId"
                                    render={({ field }) => (
                                    <FormItem>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            open={isCustomerSelectOpen}
                                            onOpenChange={setIsCustomerSelectOpen}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Selecione o cliente na lista" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {filteredCustomers.length > 0 ? (
                                                    filteredCustomers.map(c => (
                                                        <SelectItem key={c.id} value={c.id}>
                                                            {c.name} ({c.phone})
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="p-4 text-sm text-muted-foreground text-center italic">
                                                        Nenhum cliente encontrado.
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="button" variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={() => setIsCustomerDialogOpen(true)}>
                                <UserPlus className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Itens do Pedido</h3>
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ serviceType: 'Ajuste', value: 0, description: '', assignedTo: '' })}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <OrderItemForm
                                    key={field.id}
                                    index={index}
                                    control={control}
                                    remove={remove}
                                    priceTableItems={priceTableItems}
                                    setValue={setValue}
                                />
                            ))}
                        </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                        <FormField
                            control={form.control}
                            name="dueDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="mb-1.5">Data Prevista de Entrega</FormLabel>
                                    <DatePickerWithDialog
                                        date={field.value}
                                        setDate={field.onChange}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status Inicial</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Status..." />
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
                
                <DialogFooter className="p-6 border-t bg-muted/20">
                    <div className="flex w-full items-center justify-between gap-4">
                        <DialogClose asChild>
                            <Button type="button" variant="ghost" disabled={isSubmitting} className="hidden sm:inline-flex">
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-8 h-12 text-base font-bold shadow-lg">
                            {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Finalizar Pedido')}
                        </Button>
                    </div>
                </DialogFooter>
            </form>
        </Form>
    </DialogContent>
  );

  if (trigger) {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            {dialogContent}
        </Dialog>
        <CustomerFormDialog
            isOpen={isCustomerDialogOpen}
            setIsOpen={setIsCustomerDialogOpen}
            onCustomerCreated={handleCustomerCreated}
            onCustomerUpdated={handleCustomerUpdated}
        />
      </>
    );
  }
  
  return (
    <>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {dialogContent}
        </Dialog>
         <CustomerFormDialog
            isOpen={isCustomerDialogOpen}
            setIsOpen={setIsCustomerDialogOpen}
            onCustomerCreated={handleCustomerCreated}
            onCustomerUpdated={handleCustomerUpdated}
        />
    </>
  );
}
