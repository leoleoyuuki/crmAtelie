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
import { cn } from "@/lib/utils";

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
    if (isOpen) {
      form.reset(defaultValues);
    }
  }, [form, isOpen]);

  const handleCatalogProductChange = (productId: string) => {
    form.setValue("catalogProductId", productId);
    const product = catalogProducts?.find(p => p.id === productId);
    if (product) {
      form.setValue("cost", product.totalCost);
      form.setValue("price", product.finalPrice);
    }
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

      const calculatedProfit = data.price - data.cost;

      const dataToSave: Omit<Sale, 'id' | 'userId' | 'createdAt'> = {
        productName: finalProductName,
        catalogProductId: data.productSource === 'catalog' ? data.catalogProductId : undefined,
        customerId: data.customerId && data.customerId !== "none" ? data.customerId : undefined,
        customerName: data.customerId && data.customerId !== "none" ? customers?.find(c => c.id === data.customerId)?.name : undefined,
        cost: data.cost,
        price: data.price,
        profit: calculatedProfit,
        date: data.date,
      };

      await addSale(dataToSave);
      
      toast({
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
                    <FormItem>
                        <FormLabel>Produto do Catálogo</FormLabel>
                        <Select onValueChange={handleCatalogProductChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um produto..." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {catalogProducts?.map(prod => (
                                <SelectItem key={prod.id} value={prod.id}>{prod.name}</SelectItem>
                            ))}
                            {(!catalogProducts || catalogProducts.length === 0) && (
                                <div className="p-2 text-sm text-muted-foreground text-center">Nenhum produto cadastrado.</div>
                            )}
                            </SelectContent>
                        </Select>
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
                <FormItem>
                    <FormLabel>Cliente (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente..." />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="none">Nenhum / Venda Avulsa</SelectItem>
                        {customers?.map(cust => (
                            <SelectItem key={cust.id} value={cust.id}>{cust.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
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
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(profit)}
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
