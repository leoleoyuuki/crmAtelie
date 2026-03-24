'use client';

import * as z from 'zod';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, CalculatorIcon, ChevronDown } from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';
import { db } from '@/firebase/config';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { addPriceTableItem } from '@/lib/data';

const formSchema = z.object({
  name: z.string().min(1, 'Nome do produto é obrigatório'),
  description: z.string().optional(),
  professionalCostPerHour: z.coerce.number().min(0),
  professionalHours: z.coerce.number().min(0),
  isMonthlyRealEstate: z.boolean().default(false),
  realEstateMonthlyCost: z.coerce.number().min(0).optional(),
  realEstateWeeklyHours: z.coerce.number().min(1).optional(),
  realEstateCostPerHour: z.coerce.number().min(0),
  realEstateHours: z.coerce.number().min(0),
  materials: z.array(z.object({
    name: z.string().min(1, 'Nome exigido'),
    quantity: z.coerce.number().min(0),
    unitCost: z.coerce.number().min(0),
  })),
  marginType: z.enum(['percentage', 'fixed']),
  marginValue: z.coerce.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

export function QuoteCalculatorForm({ isPublic = false }: { isPublic?: boolean }) {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      professionalCostPerHour: 0,
      professionalHours: 0,
      isMonthlyRealEstate: false,
      realEstateMonthlyCost: 0,
      realEstateWeeklyHours: 40,
      realEstateCostPerHour: 0,
      realEstateHours: 0,
      materials: [],
      marginType: 'percentage',
      marginValue: 30, // 30% default
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'materials',
  });

  const watchedValues = useWatch({ control: form.control });

  // Calculations
  const profCost = (Number(watchedValues.professionalCostPerHour) || 0) * (Number(watchedValues.professionalHours) || 0);

  const reHourlyCost = watchedValues.isMonthlyRealEstate 
    ? ((Number(watchedValues.realEstateMonthlyCost) || 0) / ((Number(watchedValues.realEstateWeeklyHours) || 1) * 4.33)) 
    : (Number(watchedValues.realEstateCostPerHour) || 0);
  const reCost = reHourlyCost * (Number(watchedValues.realEstateHours) || 0);
  
  const totalMaterialCost = (watchedValues.materials || []).reduce((acc, mat) => {
    return acc + ((Number(mat.quantity) || 0) * (Number(mat.unitCost) || 0));
  }, 0);

  const totalCost = profCost + reCost + totalMaterialCost;

  let profit = 0;
  if (watchedValues.marginType === 'percentage') {
      profit = totalCost * ((Number(watchedValues.marginValue) || 0) / 100);
  } else {
      profit = Number(watchedValues.marginValue) || 0;
  }

  const finalPrice = totalCost + profit;
  const realizedMarginPercentage = totalCost > 0 ? (profit / totalCost) * 100 : 0;

  const formatCurrency = (val: number) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  async function handleSave(data: FormValues, destination: 'catalog' | 'priceTable' | 'both') {
    if (!user) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado.' });
        return;
    }

    setIsSaving(true);
    
    try {
        // Save to Catalog
        if (destination === 'catalog' || destination === 'both') {
            const catalogPayload = {
                userId: user.uid,
                name: data.name,
                description: data.description || '',
                professionalCostPerHour: data.professionalCostPerHour,
                professionalHours: data.professionalHours,
                realEstateCostPerHour: data.isMonthlyRealEstate 
                    ? ((data.realEstateMonthlyCost || 0) / ((data.realEstateWeeklyHours || 1) * 4.33)) 
                    : data.realEstateCostPerHour,
                realEstateHours: data.realEstateHours,
                materials: data.materials.map((m: any) => ({
                    ...m,
                    totalCost: Number(m.quantity) * Number(m.unitCost)
                })),
                totalMaterialCost,
                totalCost,
                marginType: data.marginType,
                marginValue: data.marginValue,
                profit,
                finalPrice,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            await addDoc(collection(db, 'catalogProducts'), catalogPayload);
        }

        // Save to Price Table
        if (destination === 'priceTable' || destination === 'both') {
            await addPriceTableItem({
                serviceName: data.name,
                description: data.description || '',
                price: finalPrice,
            });
        }
        
        const destinationText = destination === 'both' 
            ? 'Catálogo e na Tabela de Preços' 
            : (destination === 'catalog' ? 'Catálogo' : 'Tabela de Preços');

        toast({
            title: `Salvo com sucesso!`,
            description: `Produto registrado no ${destinationText}.`,
        });

        // Redirect based on primary destination
        if (destination === 'priceTable') {
            router.push('/tabela-precos');
        } else {
            router.push('/catalogo');
        }

    } catch (err) {
        console.error(err);
        toast({ 
            variant: 'destructive', 
            title: 'Erro ao salvar', 
            description: 'Não foi possível completar o salvamento.' 
        });
    } finally {
        setIsSaving(false);
    }
  }

  // Define this for the form handleSubmit compatibility
  async function onSubmit(data: FormValues) {
      if (isPublic) {
          toast({ title: 'Simulação concluída', description: 'Para salvar orçamentos, crie sua conta no AtelierFlow!' });
          return;
      }
      await handleSave(data, 'catalog');
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Formulário */}
        <div className="w-full lg:w-2/3">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <Card className="border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">Identificação</CardTitle>
                        <CardDescription>Dê um nome e descrição para o produto/orçamento.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Produto/Serviço</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Vestido de Noiva Especial" {...field} className="bg-muted/30" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Detalhes do pedido, características importantes..." {...field} className="bg-muted/30" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">Custos de Mão de Obra e Operação</CardTitle>
                        <CardDescription>Quanto custa a sua hora e o seu ateliê para fabricar este pedido?</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-bold text-sm text-primary uppercase tracking-wider">Profissional</h4>
                            <FormField
                                control={form.control}
                                name="professionalCostPerHour"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Custo da Hora (R$)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} className="bg-muted/30" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="professionalHours"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total de Horas</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.5" {...field} className="bg-muted/30" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-sm text-primary uppercase tracking-wider">Ateliê (Imóvel)</h4>
                                <FormField
                                    control={form.control}
                                    name="isMonthlyRealEstate"
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-2">
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            <FormLabel className="text-[10px] text-muted-foreground font-normal">Cálculo Mensal</FormLabel>
                                        </div>
                                    )}
                                />
                            </div>
                            
                            {watchedValues.isMonthlyRealEstate ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="realEstateMonthlyCost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Custo Mensal (R$)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" {...field} className="bg-muted/30" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="realEstateWeeklyHours"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Horas/Semana</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="1" {...field} className="bg-muted/30" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="col-span-2 bg-muted/20 p-2 rounded text-[10px] text-muted-foreground flex justify-between items-center border">
                                        <span>Custo Equivalente da Hora:</span>
                                        <span className="font-bold text-foreground text-xs">{formatCurrency(reHourlyCost)}</span>
                                    </div>
                                </div>
                            ) : (
                                <FormField
                                    control={form.control}
                                    name="realEstateCostPerHour"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Custo da Hora (R$)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} className="bg-muted/30" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            <FormField
                                control={form.control}
                                name="realEstateHours"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total de Horas</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.5" {...field} className="bg-muted/30" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Materiais</CardTitle>
                            <CardDescription>Adicione todos os materiais que serão utilizados.</CardDescription>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', quantity: 1, unitCost: 0 })}>
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Material
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic text-center py-4">Nenhum material adicionado.</p>
                        ) : (
                            fields.map((field, index) => (
                                <div key={field.id} className="flex flex-col sm:flex-row gap-3 items-end p-4 border rounded-xl bg-muted/10 relative">
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        className="sm:absolute sm:-right-3 sm:-top-3 sm:rounded-full sm:h-8 sm:w-8 sm:shadow-sm sm:border sm:bg-background text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    
                                    <div className="flex-1 w-full">
                                        <FormField
                                            control={form.control}
                                            name={`materials.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Nome do Material</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ex: Renda Francesa..." {...field} className="h-9" />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="w-full sm:w-24">
                                        <FormField
                                            control={form.control}
                                            name={`materials.${index}.quantity`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Qtd</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" step="0.01" {...field} className="h-9" />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="w-full sm:w-32">
                                        <FormField
                                            control={form.control}
                                            name={`materials.${index}.unitCost`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Custo Unit (R$)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" step="0.01" {...field} className="h-9" />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-xl text-primary">Margem & Lucro</CardTitle>
                        <CardDescription>Configure como deseja precificar este produto.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-4 items-end">
                        <div className="w-48">
                            <FormField
                                control={form.control}
                                name="marginType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Margem</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-background">
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="percentage">Em Porcentagem (%)</SelectItem>
                                                <SelectItem value="fixed">Em Valor Fixo (R$)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex-1">
                            <FormField
                                control={form.control}
                                name="marginValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{watchedValues.marginType === 'percentage' ? 'Margem Alvo (%)' : 'Lucro Desejado (R$)'}</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} className="bg-background font-bold text-primary" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>
                
                {!isPublic && (
                    <div className="pt-4 lg:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" size="lg" className="w-full text-base font-bold shadow-xl" disabled={isSaving}>
                                    {isSaving ? "Salvando..." : (
                                        <>
                                            <Save className="h-5 w-5 mr-2" />
                                            Salvar Orçamento
                                            <ChevronDown className="h-4 w-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-64 rounded-xl p-2">
                                <DropdownMenuItem onSelect={() => form.handleSubmit((data) => handleSave(data, 'catalog'))()} className="rounded-xl py-3 cursor-pointer">
                                    <Save className="h-4 w-4 mr-2 text-primary" />
                                    <span>Salvar no Catálogo</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => form.handleSubmit((data) => handleSave(data, 'priceTable'))()} className="rounded-xl py-3 cursor-pointer">
                                    <CalculatorIcon className="h-4 w-4 mr-2 text-primary" />
                                    <span>Salvar na Tabela de Preços</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => form.handleSubmit((data) => handleSave(data, 'both'))()} className="rounded-xl py-3 cursor-pointer font-bold border-t mt-1 pt-3">
                                    <Save className="h-4 w-4 mr-2 text-primary" />
                                    <span>Salvar em Ambos</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </form>
            </Form>
        </div>

        {/* Resumo Lateral (Sticky) */}
        <div className="w-full lg:w-1/3 space-y-6 sticky top-24">
            <Card className="border-border/50 shadow-xl overflow-hidden flex flex-col">
                <div className="bg-primary p-6 text-primary-foreground text-center space-y-1">
                    <h3 className="uppercase tracking-widest text-[10px] font-black opacity-80">Preço Sugerido</h3>
                    <p className="text-4xl font-black font-headline tracking-tighter shadow-sm">{formatCurrency(finalPrice)}</p>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">Resumo de Custos</h4>
                        
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Mão de Obra ({watchedValues.professionalHours || 0}h)</span>
                            <span className="font-medium">{formatCurrency(profCost)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Imóvel/Ateliê ({watchedValues.realEstateHours || 0}h)</span>
                            <span className="font-medium">{formatCurrency(reCost)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Materiais ({watchedValues.materials?.length || 0} itens)</span>
                            <span className="font-medium">{formatCurrency(totalMaterialCost)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center font-bold text-base pt-2 border-t text-foreground">
                            <span>Custo Total</span>
                            <span>{formatCurrency(totalCost)}</span>
                        </div>
                    </div>

                    <div className="space-y-3 bg-muted/30 p-4 rounded-xl border">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-white/10 pb-2">Resumo de Margem</h4>
                        
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Lucro Mapeado</span>
                            <span className="font-bold text-emerald-600">{formatCurrency(profit)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Margem Efetiva</span>
                            <span className="font-bold">{realizedMarginPercentage.toFixed(1)}%</span>
                        </div>
                    </div>

                    {!isPublic ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    type="button" 
                                    size="lg" 
                                    className="w-full text-base font-bold shadow-xl lg:flex hidden" 
                                    disabled={isSaving}
                                >
                                    {isSaving ? "Salvando..." : (
                                        <>
                                            <Save className="h-5 w-5 mr-2" />
                                            Salvar Orçamento
                                            <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                                        </>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 rounded-xl p-2">
                                <DropdownMenuItem onSelect={() => form.handleSubmit((data) => handleSave(data, 'catalog'))()} className="rounded-xl py-3 cursor-pointer">
                                    <div className="flex flex-col text-left">
                                        <span className="font-bold text-sm">Salvar no Catálogo</span>
                                        <span className="text-[10px] text-muted-foreground">Ficha técnica completa com materiais</span>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => form.handleSubmit((data) => handleSave(data, 'priceTable'))()} className="rounded-xl py-3 cursor-pointer">
                                    <div className="flex flex-col text-left">
                                        <span className="font-bold text-sm">Salvar na Tabela de Preços</span>
                                        <span className="text-[10px] text-muted-foreground">Apenas nome e preço final</span>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => form.handleSubmit((data) => handleSave(data, 'both'))()} className="rounded-xl py-3 cursor-pointer border-t mt-1 pt-3 bg-primary/5">
                                    <div className="flex flex-col text-left">
                                        <span className="font-bold text-sm text-primary">Salvar em Ambos</span>
                                        <span className="text-[10px] text-primary/70">Registros no catálogo e na tabela</span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button 
                            type="button" 
                            size="lg" 
                            variant="secondary"
                            className="w-full text-base font-bold shadow-lg border-2 border-primary/20 hover:border-primary/50 transition-all group"
                            onClick={() => window.open('/login', '_blank')}
                        >
                            <Save className="h-5 w-5 mr-2 text-primary group-hover:scale-110 transition-transform" />
                            Criar Conta para Salvar
                        </Button>
                    )}
                </div>
            </Card>

            <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl flex items-start gap-3">
                <CalculatorIcon className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                    A margem efetiva é calculada a partir da proporção do lucro sobre o custo total da peça (markup dinâmico) para facilitar a comparação.
                </p>
            </div>
        </div>
    </div>
  );
}
