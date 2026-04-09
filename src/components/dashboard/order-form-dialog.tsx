
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
import { Order, OrderStatus, Customer, PriceTableItem } from "@/lib/types";
import { addOrder, updateOrder, getCustomers, getPriceTableItems, addCustomer } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, UserPlus, Trash2, Search } from "lucide-react";
import { CustomerFormDialog } from "./customer-form-dialog";
import { TrialLimitScreen } from "./trial-limit-screen";
import { Separator } from "../ui/separator";
import { DatePickerWithDialog } from "../ui/date-picker";
import { VoiceAssistant } from "./voice-assistant";

const orderItemSchema = z.object({
  serviceType: z.string().min(1, "O tipo de serviço é obrigatório."),
  description: z.string().optional(),
  value: z.coerce.number().min(0, "O valor deve ser positivo."),
  quantity: z.coerce.number().min(1, "Mínimo 1."),
  assignedTo: z.string().optional(),
});

const orderFormSchema = z.object({
  customerId: z.string({ required_error: "Selecione um cliente." }).min(1, "Selecione um cliente."),
  items: z.array(orderItemSchema).min(1, "O pedido deve ter pelo menos um item."),
  dueDate: z.date({ required_error: "A data de entrega é obrigatória." }),
  status: z.enum(['Novo', 'Em Processo', 'Aguardando Retirada', 'Concluído']),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

const statuses: OrderStatus[] = ['Novo', 'Em Processo', 'Aguardando Retirada', 'Concluído'];

function OrderItemForm({ index, control, remove, priceTableItems, setValue, onTriggerFetchPriceItems, isPriceItemsCached, isLoadingPriceItems }: any) {
    const [serviceSearch, setServiceSearch] = useState("");
    const [debouncedServiceSearch, setDebouncedServiceSearch] = useState("");
    const [isServiceSelectOpen, setIsServiceSelectOpen] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedServiceSearch(serviceSearch);
        }, 500);
        return () => clearTimeout(handler);
    }, [serviceSearch]);

    // Trigger lazy fetch when 3+ chars and not yet cached
    useEffect(() => {
        if (debouncedServiceSearch.length >= 3 && !isPriceItemsCached) {
            onTriggerFetchPriceItems();
        }
        if (debouncedServiceSearch.length >= 3) {
            setIsServiceSelectOpen(true);
        }
    }, [debouncedServiceSearch, isPriceItemsCached, onTriggerFetchPriceItems]);

    // Accent-insensitive normalization
    const normalize = (str: string) =>
        str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    const filteredServices = debouncedServiceSearch.length >= 3
        ? priceTableItems.filter((s: PriceTableItem) =>
            normalize(s.serviceName).includes(normalize(debouncedServiceSearch))
          )
        : [];

    const handlePriceItemSelect = (itemId: string) => {
        if (!itemId) return;
        const selectedItem = priceTableItems.find((item: PriceTableItem) => item.id === itemId);
        if (selectedItem) {
            setValue(`items.${index}.serviceType`, selectedItem.serviceName);
            setValue(`items.${index}.description`, selectedItem.description || "");
            setValue(`items.${index}.value`, selectedItem.price);
            setValue(`items.${index}.quantity`, 1);
            
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
                        placeholder="Digite 3+ letras..."
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        className="h-9"
                    />
                    <Select
                        onValueChange={(value) => handlePriceItemSelect(value)}
                        open={isServiceSelectOpen}
                        onOpenChange={setIsServiceSelectOpen}
                    >
                        <SelectTrigger className="h-9 w-12 p-0 flex justify-center">
                            <Search className="h-4 w-4 text-muted-foreground" />
                        </SelectTrigger>
                        <SelectContent align="end">
                            {isLoadingPriceItems && (
                                <div className="p-4 text-sm text-muted-foreground text-center italic">Buscando serviços...</div>
                            )}

                            {!isLoadingPriceItems && debouncedServiceSearch.length < 3 && (
                                <div className="p-4 text-sm text-muted-foreground text-center italic">Digite pelo menos 3 letras para buscar</div>
                            )}

                            {!isLoadingPriceItems && debouncedServiceSearch.length >= 3 && filteredServices.length > 0 && filteredServices.map((s: PriceTableItem) => (
                                <SelectItem key={s.id} value={s.id}>
                                    {s.serviceName} - R${s.price.toFixed(2)}
                                </SelectItem>
                            ))}

                            {!isLoadingPriceItems && debouncedServiceSearch.length >= 3 && filteredServices.length === 0 && (
                                <div className="p-4 text-sm text-muted-foreground text-center italic">Nenhum serviço encontrado.</div>
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
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                    <FormField
                        control={control}
                        name={`items.${index}.serviceType`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Serviço</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Produção, Criação..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Qtd.</FormLabel>
                            <FormControl>
                                <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name={`items.${index}.value`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Vlr Unit. (R$)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" placeholder="0,00" {...field} />
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
                            <Input placeholder="Cor, material, detalhes específicos..." {...field} value={field.value ?? ''} />
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
  const [customersCached, setCustomersCached] = useState(false);
  const [priceTableItems, setPriceTableItems] = useState<PriceTableItem[]>([]);
  const [priceTableCached, setPriceTableCached] = useState(false);
  const [isLoadingPriceItems, setIsLoadingPriceItems] = useState(false);
  
  const [customerSearch, setCustomerSearch] = useState("");
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState("");
  const [isCustomerSelectOpen, setIsCustomerSelectOpen] = useState(false);
  const [shouldOpenSelect, setShouldOpenSelect] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [limitHit, setLimitHit] = React.useState<"orders" | "customers" | null>(null);

  const isEditing = !!order;
  const { toast } = useToast();

  const isOpen = controlledIsOpen ?? uncontrolledIsOpen;
  const setIsOpen = setControlledIsOpen ?? setUncontrolledIsOpen;

  useEffect(() => {
    if (isOpen) {
      // Reset all caches when dialog reopens
      setCustomersCached(false);
      setCustomers([]);
      setPriceTableCached(false);
      setPriceTableItems([]);
    }
  }, [isOpen]);

  const handleFetchPriceItems = React.useCallback(async () => {
    if (priceTableCached || isLoadingPriceItems) return;
    setIsLoadingPriceItems(true);
    try {
      const fetched = await getPriceTableItems();
      setPriceTableItems(fetched);
      setPriceTableCached(true);
    } catch (error) {
      console.error("Failed to fetch price items", error);
    } finally {
      setIsLoadingPriceItems(false);
    }
  }, [priceTableCached, isLoadingPriceItems]);

   useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCustomerSearch(customerSearch);
    }, 500);
    return () => clearTimeout(handler);
  }, [customerSearch]);

  // Fetch customers from Firestore only once, after 3+ chars typed
  useEffect(() => {
    if (debouncedCustomerSearch.length >= 3 && !customersCached) {
      const fetchCustomers = async () => {
        setIsLoadingCustomers(true);
        try {
          const fetched = await getCustomers();
          setCustomers(fetched);
          setCustomersCached(true);
        } catch (error) {
          console.error("Failed to fetch customers", error);
        } finally {
          setIsLoadingCustomers(false);
        }
      };
      fetchCustomers();
    }
    if (debouncedCustomerSearch.length >= 3 && shouldOpenSelect) {
      setIsCustomerSelectOpen(true);
    }
  }, [debouncedCustomerSearch, customersCached, shouldOpenSelect]);

  // Accent-insensitive normalization helper
  const normalize = (str: string) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const filteredCustomers = debouncedCustomerSearch.length >= 3
    ? customers.filter(c => {
        const search = normalize(debouncedCustomerSearch);
        return normalize(c.name).includes(search) ||
               (c.phone && c.phone.includes(debouncedCustomerSearch));
      })
    : [];
  
  const defaultValues: Partial<OrderFormValues> = {
    customerId: '',
    items: [{ serviceType: '', value: 0, quantity: 1, description: '', assignedTo: '' }],
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
      setShouldOpenSelect(false);
      
      if (order) {
          setCustomerSearch(order.customerName || "");
          setCustomers([{ id: order.customerId, name: order.customerName } as Customer]);
          
          form.reset({
            ...order,
            items: order.items 
                ? order.items.map(item => ({
                    ...item, 
                    description: item.description ?? '', 
                    assignedTo: item.assignedTo ?? '',
                    quantity: item.quantity ?? 1
                  })) 
                : defaultValues.items,
          });
      } else {
          setCustomerSearch("");
          setCustomers([]);
          form.reset(defaultValues);
      }
      setLimitHit(null);
    }
  }, [order, form, isOpen]);

  const handleVoiceResult = (data: any) => {
    if (data.customerName) {
       setCustomerSearch(data.customerName);
       setShouldOpenSelect(true); // Trigger search
    }

    if (data.dueDate) {
        // Create local Date from YYYY-MM-DD to avoid timezone issues
        const [year, month, day] = data.dueDate.split('-');
        if (year && month && day) {
            form.setValue('dueDate', new Date(Number(year), Number(month) - 1, Number(day)), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
        }
    }

    if (data.items && data.items.length > 0) {
        const newItems = data.items.map((item: any) => ({
            serviceType: item.serviceType || '',
            description: item.description || '',
            value: item.value || 0,
            quantity: item.quantity || 1,
            assignedTo: ''
        }));
        form.setValue('items', newItems);
    }
  };

  const onSubmit = async (data: OrderFormValues) => {
    setIsSubmitting(true);
    const selectedCustomer = customers.find(c => c.id === data.customerId);
    if (!selectedCustomer) {
        toast({ variant: "destructive", title: "Erro", description: "Selecione um cliente válido." });
        setIsSubmitting(false);
        return;
    }
    
    try {
      const totalValue = data.items.reduce((sum, item) => sum + (item.value * item.quantity), 0);
      const orderData = {
        ...data,
        customerName: selectedCustomer.name,
        totalValue,
      };

      if (isEditing && order) {
        await updateOrder(order.id, orderData);
        onOrderUpdated?.();
        toast({ variant: "success", title: "Pedido Atualizado" });
      } else {
        await addOrder(orderData as Omit<Order, 'id' | 'createdAt' | 'userId'>);
        onOrderCreated?.();
        toast({ variant: "success", title: "Pedido Criado com Sucesso" });
      }
      setIsOpen(false);
      form.reset(defaultValues);
    } catch (error: any) {
        if (error?.message === "TRIAL_LIMIT_ORDERS") {
            setLimitHit("orders");
        } else {
            toast({ 
                variant: "destructive", 
                title: "Erro", 
                description: "Não foi possível salvar o pedido." 
            });
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleCustomerCreated = async (newCustomer: Customer) => {
    setCustomers(prev => [newCustomer, ...prev]);
    setCustomerSearch(newCustomer.name);
    setDebouncedCustomerSearch(newCustomer.name);
    form.setValue('customerId', newCustomer.id, { shouldValidate: true, shouldDirty: true });
    setIsCustomerSelectOpen(false);
  };

  const handleCustomerUpdated = (updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    setCustomerSearch(updatedCustomer.name);
    setDebouncedCustomerSearch(updatedCustomer.name);
    form.setValue('customerId', updatedCustomer.id);
  };

  const handleQuickCreateCustomer = async () => {
    if (!debouncedCustomerSearch.trim() || isCreatingCustomer) return;
    
    setIsCreatingCustomer(true);
    try {
        const newCustomer = await addCustomer({ 
            name: debouncedCustomerSearch.trim(), 
            phone: "", 
            email: "" 
        });
        setCustomers(prev => [newCustomer, ...prev]);
        setCustomerSearch(newCustomer.name);
        setDebouncedCustomerSearch(newCustomer.name);
        form.setValue('customerId', newCustomer.id, { shouldValidate: true, shouldDirty: true });
        toast({ variant: "success", title: "Cliente criado!", description: `${newCustomer.name} foi selecionada.` });
        setIsCustomerSelectOpen(false); // Close select
    } catch (error: any) {
        if (error?.message === "TRIAL_LIMIT_CUSTOMERS") {
            setLimitHit("customers");
        } else {
            toast({ 
                variant: "destructive", 
                title: "Erro ao criar cliente", 
                description: "Tente novamente." 
            });
        }
    } finally {
        setIsCreatingCustomer(false);
    }
  };

   const dialogContent = (
    <DialogContent 
        className="flex flex-col h-[95dvh] sm:h-auto sm:max-h-[90vh] p-0 overflow-hidden sm:max-w-3xl lg:max-w-[50%] lg:w-[50%] lg:h-full lg:max-h-none lg:right-0 lg:left-auto lg:top-0 lg:translate-x-0 lg:translate-y-0 lg:rounded-none lg:rounded-l-3xl lg:border-y-0 lg:border-r-0 shadow-2xl lg:duration-500 lg:data-[state=open]:animate-in lg:data-[state=closed]:animate-out lg:data-[state=closed]:slide-out-to-right lg:data-[state=open]:slide-in-from-right lg:data-[state=open]:zoom-in-100 lg:data-[state=closed]:zoom-out-100"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
    >
        {limitHit ? (
            <TrialLimitScreen type={limitHit} onClose={() => setIsOpen(false)} />
        ) : (
            <>
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
                                    placeholder="Digite 3+ letras para buscar..."
                                    value={customerSearch}
                                    onChange={(e) => {
                                        setCustomerSearch(e.target.value);
                                        setShouldOpenSelect(true);
                                    }}
                                    className="h-10"
                                />
                                <FormField
                                    control={form.control}
                                    name="customerId"
                                    render={({ field }) => (
                                    <FormItem>
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                const customer = customers.find(c => c.id === val);
                                                if (customer) {
                                                    setCustomerSearch(customer.name);
                                                    setDebouncedCustomerSearch(customer.name);
                                                    setShouldOpenSelect(false);
                                                }
                                            }}
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
                                                {isLoadingCustomers && (
                                                    <div className="p-4 text-sm text-muted-foreground text-center italic">
                                                        Buscando clientes...
                                                    </div>
                                                )}

                                                {!isLoadingCustomers && debouncedCustomerSearch.length < 3 && (
                                                    <div className="p-4 text-sm text-muted-foreground text-center italic">
                                                        Digite pelo menos 3 letras para buscar
                                                    </div>
                                                )}

                                                {!isLoadingCustomers && debouncedCustomerSearch.length >= 3 && filteredCustomers.length > 0 && filteredCustomers.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.name} {c.phone ? `(${c.phone})` : ''}
                                                    </SelectItem>
                                                ))}

                                                {!isLoadingCustomers && debouncedCustomerSearch.length >= 3 && filteredCustomers.length === 0 && (
                                                    <div className="p-3 text-sm text-muted-foreground text-center italic">
                                                        Nenhum cliente encontrado.
                                                    </div>
                                                )}
                                                
                                                {!isLoadingCustomers && debouncedCustomerSearch.trim().length >= 3 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        className="w-full justify-start font-bold text-primary hover:text-primary hover:bg-primary/10 gap-2 p-2 h-auto"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleQuickCreateCustomer();
                                                        }}
                                                        disabled={isCreatingCustomer}
                                                    >
                                                        <PlusCircle className="h-4 w-4" />
                                                        {isCreatingCustomer ? "Criando..." : `Criar novo cliente "${debouncedCustomerSearch}"`}
                                                    </Button>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                            <VoiceAssistant onResult={handleVoiceResult} />
                            <Button type="button" variant="outline" size="icon" title="Novo Cliente Manual" className="h-10 w-10 shrink-0" onClick={() => setIsCustomerDialogOpen(true)}>
                                <UserPlus className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Itens do Pedido</h3>
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
                                    onTriggerFetchPriceItems={handleFetchPriceItems}
                                    isPriceItemsCached={priceTableCached}
                                    isLoadingPriceItems={isLoadingPriceItems}
                                />
                            ))}
                        </div>
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full h-12 border-dashed border-2 hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all gap-2" 
                            onClick={() => append({ serviceType: '', value: 0, quantity: 1, description: '', assignedTo: '' })}
                        >
                            <PlusCircle className="h-5 w-5" />
                            <span className="font-semibold">Adicionar mais um item</span>
                        </Button>
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
            </>
        )}
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
