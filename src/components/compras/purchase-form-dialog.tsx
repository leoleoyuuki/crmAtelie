"use client";

import React, { useEffect, useState } from "react";
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
import { addPurchase, getMaterials } from "@/lib/data";
import { Purchase, Material } from "@/lib/types";
import { Separator } from "../ui/separator";

const purchaseFormSchema = z.object({
  materialName: z.string().min(1, "O nome do material é obrigatório."),
  unit: z.string().min(1, "A unidade é obrigatória (ex: m, cm, un)."),
  quantity: z.coerce.number().min(0.01, "A quantidade deve ser maior que zero."),
  cost: z.coerce.number().min(0, "O custo deve ser um valor positivo."),
});

type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;

interface PurchaseFormDialogProps {
  purchase?: Purchase;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onPurchaseCreated: () => void;
}

export function PurchaseFormDialog({
  purchase,
  isOpen: controlledIsOpen,
  setIsOpen: setControlledIsOpen,
  trigger,
  onPurchaseCreated,
}: PurchaseFormDialogProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = React.useState(false);
  const { toast } = useToast();
  
  const isOpen = controlledIsOpen ?? uncontrolledIsOpen;
  const setIsOpen = setControlledIsOpen ?? setUncontrolledIsOpen;

  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    async function fetchData() {
        const fetchedMaterials = await getMaterials();
        setMaterials(fetchedMaterials);
    }
    if (isOpen) {
        fetchData();
    }
  }, [isOpen]);

  const defaultValues: Partial<PurchaseFormValues> = {
    materialName: "",
    unit: "",
    quantity: 0,
    cost: 0,
  };

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues);
      setSearchTerm("");
      setShowResults(false);
    }
  }, [isOpen]);

  const onSubmit = async (data: PurchaseFormValues) => {
    try {
      const dataToSave: Omit<Purchase, 'id' | 'userId' | 'createdAt'> = {
        materialName: data.materialName.trim(),
        unit: data.unit,
        quantity: data.quantity,
        cost: data.cost,
      };

      await addPurchase(dataToSave);
      toast({
        variant: "success",
        title: "Compra Registrada",
        description: `A compra de ${data.materialName} foi adicionada.`,
      });
      
      onPurchaseCreated();
      setIsOpen(false);
      form.reset(defaultValues);

      if (typeof window !== 'undefined' && localStorage.getItem('atelierflow_onboarding_checklist_dismissed') !== 'true') {
        localStorage.setItem('atelierflow_onboarding_just_purchased', 'true');
        router.push('/estoque');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível registrar a compra.",
      });
    }
  };

  const filteredMaterials = debouncedSearchTerm.length >= 3
    ? materials.filter(m => m.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())).slice(0, 5)
    : [];

  const dialogContent = (
    <DialogContent 
        className="flex flex-col h-[95dvh] sm:h-auto sm:max-h-[85vh] p-0 overflow-hidden sm:max-w-[500px] lg:max-w-[50%] lg:w-[50%] lg:h-full lg:max-h-none lg:right-0 lg:left-auto lg:top-0 lg:translate-x-0 lg:translate-y-0 lg:rounded-none lg:rounded-l-3xl lg:border-y-0 lg:border-r-0 shadow-2xl lg:duration-500 lg:data-[state=open]:animate-in lg:data-[state=closed]:animate-out lg:data-[state=closed]:slide-out-to-right lg:data-[state=open]:slide-in-from-right lg:data-[state=open]:zoom-in-100 lg:data-[state=closed]:zoom-out-100 bg-background/95 backdrop-blur-xl border-accent/20"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
    >
      <DialogHeader className="p-8 pb-4">
        <DialogTitle className="font-headline text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70 tracking-tight">
          Registrar Compra
        </DialogTitle>
        <DialogDescription className="text-muted-foreground/80 text-base">
          Registre a entrada de novos materiais e atualize seu estoque automaticamente.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-8 py-4 space-y-8 scrollbar-thin scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/40 scrollbar-track-transparent">
            
            {/* Material Search Section */}
            <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="materialName"
                    render={({ field }) => (
                        <FormItem className="relative">
                            <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Material</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input 
                                        {...field}
                                        placeholder="Digite pelo menos 3 letras para buscar..." 
                                        className="h-14 px-4 bg-muted/30 border-accent/10 focus:border-primary/50 focus:ring-primary/20 text-lg transition-all"
                                        autoComplete="off"
                                        onChange={(e) => {
                                            field.onChange(e);
                                            setSearchTerm(e.target.value);
                                            setShowResults(true);
                                        }}
                                        onFocus={() => setShowResults(true)}
                                    />
                                    {showResults && filteredMaterials.length > 0 && (
                                        <div className="absolute z-50 w-full mt-2 bg-background/95 backdrop-blur-md border border-accent/20 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            <div className="p-2 border-b bg-muted/10">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Materiais Encontrados</span>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto">
                                                {filteredMaterials.map((mat) => (
                                                    <button
                                                        key={mat.id}
                                                        type="button"
                                                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-primary/10 transition-colors group"
                                                        onClick={() => {
                                                            form.setValue("materialName", mat.name);
                                                            form.setValue("unit", mat.unit);
                                                            setSearchTerm(mat.name);
                                                            setShowResults(false);
                                                        }}
                                                    >
                                                        <div>
                                                            <p className="font-semibold text-foreground group-hover:text-primary">{mat.name}</p>
                                                            <p className="text-xs text-muted-foreground lowercase">Unidade: {mat.unit}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-medium text-primary">Estoque: {mat.stock} {mat.unit}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <Separator className="bg-accent/10" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quantidade</FormLabel>
                        <FormControl>
                        <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            className="h-12 bg-muted/20 border-accent/10 focus:border-primary/50" 
                            {...field} 
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unidade</FormLabel>
                        <FormControl>
                        <Input 
                            placeholder="m, un, cm" 
                            className="h-12 bg-muted/20 border-accent/10 focus:border-primary/50" 
                            {...field} 
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="cost"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Custo Total (R$)</FormLabel>
                         <FormControl>
                            <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="0.00" 
                                className="h-12 bg-muted/20 border-accent/10 focus:border-primary/50" 
                                {...field} 
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <p className="text-sm text-primary flex items-center gap-2">
                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary animate-pulse" />
                    As contas de custos mensais no dashboard serão atualizadas automaticamente após o registro.
                </p>
            </div>
          </div>
          
          <div className="p-8 border-t bg-muted/20 flex flex-col sm:flex-row gap-3">
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="flex-1 sm:flex-none h-14 px-8 text-muted-foreground hover:text-foreground">
                Cancelar
              </Button>
            </DialogClose>
            <Button 
                type="submit" 
                className="flex-1 h-14 px-10 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
            >
                Registrar Compra
            </Button>
          </div>
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
