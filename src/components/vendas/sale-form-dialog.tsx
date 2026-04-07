"use client";

import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

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
import { addSale } from "@/lib/data";
import { Sale, CatalogProduct, Customer } from "@/lib/types";
import { useCollection } from "@/firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

const saleFormSchema = z.object({
  productSource: z.enum(["manual", "catalog"]),
  catalogProductId: z.string().optional(),
  manualProductName: z.string().optional(),
  customerId: z.string().optional(),
  cost: z.coerce.number().min(0, "O custo deve ser positivo"),
  price: z.coerce.number().min(0.01, "O preço deve ser maior que zero"),
  date: z.date({
    required_error: "A data da venda é obrigatória.",
  }),
}).refine(data => {
  if (data.productSource === 'catalog') {
    return !!data.catalogProductId;
  }
  return !!data.manualProductName?.trim();
}, {
  message: "Informe o produto (selecione do catálogo ou digite o nome).",
  path: ["manualProductName"],
});

type SaleFormValues = z.infer<typeof saleFormSchema>;

interface SaleFormDialogProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSaleCreated?: () => void;
}

export function SaleFormDialog({
  isOpen: controlledIsOpen,
  setIsOpen: setControlledIsOpen,
  trigger,
  onSaleCreated,
}: SaleFormDialogProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = React.useState(false);
  const { toast } = useToast();

  const isOpen = controlledIsOpen ?? uncontrolledIsOpen;
  const setIsOpen = setControlledIsOpen ?? setUncontrolledIsOpen;

  const { data: catalogProducts } = useCollection<CatalogProduct>('catalogProducts');
  const { data: customers } = useCollection<Customer>('customers');

  const defaultValues: Partial<SaleFormValues> = {
    productSource: "catalog",
    catalogProductId: "",
    manualProductName: "",
    customerId: "none",
    cost: 0,
    price: 0,
    date: new Date(),
  };

  const [productSearch, setProductSearch] = useState("");
  const [debouncedProductSearch, setDebouncedProductSearch] = useState("");
  const [isProductPopoverOpen, setIsProductPopoverOpen] = useState(false);

  const [customerSearch, setCustomerSearch] = useState("");
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState("");
  const [isCustomerPopoverOpen, setIsCustomerPopoverOpen] = useState(false);

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues,
  });

  const productSource = useWatch({
    control: form.control,
    name: "productSource",
  });

  const cost = useWatch({
    control: form.control,
    name: "cost",
  });

  const price = useWatch({
    control: form.control,
    name: "price",
  });
  
  const profit = (Number(price) || 0) - (Number(cost) || 0);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedProductSearch(productSearch);
    }, 400);
    return () => clearTimeout(handler);
  }, [productSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCustomerSearch(customerSearch);
    }, 400);
    return () => clearTimeout(handler);
  }, [customerSearch]);

  // Accent-insensitive normalization
  const normalize = (str: string) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const filteredProducts = debouncedProductSearch.length >= 3
    ? catalogProducts?.filter(p => normalize(p.name).includes(normalize(debouncedProductSearch))) ?? []
    : [];

  const filteredCustomers = debouncedCustomerSearch.length >= 3
    ? customers?.filter(c => normalize(c.name).includes(normalize(debouncedCustomerSearch))) ?? []
    : [];

  // Auto-open select when results are found
  useEffect(() => {
    if (debouncedProductSearch.length >= 3 && filteredProducts && filteredProducts.length > 0) {
      setIsProductPopoverOpen(true);
    }
  }, [debouncedProductSearch, filteredProducts.length]);

  useEffect(() => {
    if (debouncedCustomerSearch.length >= 3 && filteredCustomers && filteredCustomers.length > 0) {
      setIsCustomerPopoverOpen(true);
    }
  }, [debouncedCustomerSearch, filteredCustomers.length]);

  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues);
    }
  }, [form, isOpen]);

  const handleCatalogProductChange = (productId: string) => {
    form.setValue("catalogProductId", productId);
    const product = catalogProducts?.find(p => p.id === productId);
    if (product) {
      // Arredonda para 2 casas decimais para evitar problemas de precisão no input
      const roundedCost = Math.round(product.totalCost * 100) / 100;
      const roundedPrice = Math.round(product.finalPrice * 100) / 100;
      
      form.setValue("cost", roundedCost);
      form.setValue("price", roundedPrice);
      setProductSearch(product.name);
      setIsProductPopoverOpen(false);
    }
  };
  const handleCustomerChange = (customerId: string) => {
    if (customerId === "none") {
      form.setValue("customerId", "none");
      setCustomerSearch("");
    } else {
      form.setValue("customerId", customerId);
      const customer = customers?.find(c => c.id === customerId);
      if (customer) {
        setCustomerSearch(customer.name);
      }
    }
    setIsCustomerPopoverOpen(false);
  };

  const onSubmit = async (data: SaleFormValues) => {
    try {
      let finalProductName = data.manualProductName?.trim() || "Produto Desconhecido";
      if (data.productSource === 'catalog' && data.catalogProductId) {
        const product = catalogProducts?.find(p => p.id === data.catalogProductId);
        if (product) {
          finalProductName = product.name;
        }
      }

      const roundedCost = Math.round(data.cost * 100) / 100;
      const roundedPrice = Math.round(data.price * 100) / 100;
      const calculatedProfit = Math.round((roundedPrice - roundedCost) * 100) / 100;

      const dataToSave: Omit<Sale, 'id' | 'userId' | 'createdAt'> = {
        productName: finalProductName,
        catalogProductId: data.productSource === 'catalog' ? data.catalogProductId : undefined,
        customerId: data.customerId && data.customerId !== "none" ? data.customerId : undefined,
        customerName: data.customerId && data.customerId !== "none" ? customers?.find(c => c.id === data.customerId)?.name : undefined,
        cost: roundedCost,
        price: roundedPrice,
        profit: calculatedProfit,
        date: data.date,
      };

      await addSale(dataToSave);
      
      toast({
        variant: "success",
        title: "Venda Registrada",
        description: `A venda de ${finalProductName} foi salva com sucesso.`,
      });
      
      onSaleCreated?.();
      setIsOpen(false);
      form.reset(defaultValues);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível registrar a venda.",
      });
    }
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle className="font-headline text-2xl">Registrar Venda Direta</DialogTitle>
        <DialogDescription>
          Registre a venda de um produto faturado à pronta entrega ou do seu catálogo.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          
          <FormField
            control={form.control}
            name="productSource"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Origem do Produto</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="catalog" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Estoque / Catálogo de Produtos
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="manual" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Produto Avulso (Inserção Manual)
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {productSource === "catalog" ? (
             <FormField
                control={form.control}
                name="catalogProductId"
                render={({ field }) => (
                    <FormItem className="flex flex-col gap-1.5">
                        <FormLabel>Produto do Catálogo</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                              <Input
                                  placeholder="Buscar (3+ letras)..."
                                  value={productSearch}
                                  onChange={(e) => {
                                      setProductSearch(e.target.value);
                                  }}
                                  className="w-full pr-8"
                              />
                              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-40" />
                          </div>
                          
                          <Select 
                            open={isProductPopoverOpen} 
                            onOpenChange={setIsProductPopoverOpen}
                            value={field.value}
                            onValueChange={handleCatalogProductChange}
                          >
                            <FormControl>
                              <SelectTrigger className={cn("w-full", !field.value && "text-muted-foreground")}>
                                <SelectValue placeholder="Resultados..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px]">
                              {filteredProducts && filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                  <SelectItem 
                                    key={product.id} 
                                    value={product.id}
                                    className="py-2"
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium text-sm">{product.name}</span>
                                      <span className="text-[10px] opacity-60">
                                        {formatCurrency(product.finalPrice)} | Ref: {product.reference}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-4 text-xs text-center text-muted-foreground italic">
                                  {productSearch.length < 3 ? "Digite 3+ letras..." : "Nenhum resultado."}
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />
          ) : (
            <FormField
                control={form.control}
                name="manualProductName"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nome do Produto</FormLabel>
                        <FormControl>
                            <Input placeholder="ex: Vestido Sob Medida" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
          )}

          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
                <FormItem className="flex flex-col gap-1.5">
                    <FormLabel>Cliente (Opcional)</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                            <Input
                                placeholder="Buscar (3+ letras)..."
                                value={customerSearch}
                                onChange={(e) => {
                                    setCustomerSearch(e.target.value);
                                }}
                                className="w-full pr-8"
                            />
                            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-40" />
                        </div>

                        <Select 
                          open={isCustomerPopoverOpen} 
                          onOpenChange={setIsCustomerPopoverOpen}
                          value={field.value}
                          onValueChange={handleCustomerChange}
                        >
                          <FormControl>
                            <SelectTrigger className={cn("w-full", !field.value && "text-muted-foreground")}>
                              <SelectValue placeholder="Resultados..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[300px]">
                            <SelectItem value="none" className="font-medium">
                              Nenhum / Venda Avulsa
                            </SelectItem>
                            {filteredCustomers && filteredCustomers.length > 0 ? (
                              filteredCustomers.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  {customer.name}
                                </SelectItem>
                              ))
                            ) : (
                              debouncedCustomerSearch.length >= 3 && (
                                <div className="p-4 text-xs text-center text-muted-foreground italic">
                                  Nenhum cliente encontrado.
                                </div>
                              )
                            )}
                          </SelectContent>
                        </Select>
                    </div>
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
                    <FormLabel>Custo Total (R$)</FormLabel>
                     <FormControl>
                        <Input type="number" step="0.01" placeholder="Ex: 50.00" {...field} />
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
                    <FormLabel>Preço de Venda (R$)</FormLabel>
                     <FormControl>
                        <Input type="number" step="0.01" placeholder="Ex: 150.00" {...field} className="font-bold text-primary" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>Data da Venda</FormLabel>
                    <Popover>
                    <PopoverTrigger asChild>
                        <FormControl>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                            )}
                        >
                            {field.value ? (
                            format(field.value, "PP", { locale: ptBR })
                            ) : (
                            <span>Escolha uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                        </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        />
                    </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
                )}
            />

            <div className="space-y-2">
                <p className="text-sm font-medium leading-none">Lucro Bruto Calculado</p>
                <div className="h-10 px-3 py-2 border rounded-md bg-muted/30 flex items-center">
                    <span className={cn("font-bold text-sm", profit >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive")}>
                        {formatCurrency(profit)}
                    </span>
                </div>
            </div>
          </div>
          
          <DialogFooter className="pt-4 border-t">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">Salvar Venda</Button>
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
