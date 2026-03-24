'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { sendLeadNotification } from '@/lib/webhooks';
import { User, Phone } from 'lucide-react';

const leadSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(10, 'Informe um WhatsApp válido com DDD'),
});

type LeadValues = z.infer<typeof leadSchema>;

interface LeadFormProps {
  onSuccess: () => void;
  toolName: string;
}

export function LeadForm({ onSuccess, toolName }: LeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LeadValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  const onSubmit = async (data: LeadValues) => {
    setIsSubmitting(true);
    try {
      await sendLeadNotification(data.name, data.phone, toolName);
      // Persist lead info to skip form in future visits
      localStorage.setItem('atelierflow_lead_info', JSON.stringify({
        name: data.name,
        phone: data.phone,
        capturedAt: new Date().toISOString(),
      }));
      onSuccess();
    } catch (error) {
      console.error('Error submitting lead:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto border-border/50 shadow-xl overflow-hidden">
      <div className="bg-primary/10 p-6 text-center space-y-2 border-b">
        <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
          <User className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-black font-headline">Quase lá!</CardTitle>
        <CardDescription>
          Informe seus dados para acessar a {toolName} gratuitamente.
        </CardDescription>
      </div>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Seu Nome
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Como podemos te chamar?" {...field} className="bg-muted/30 h-12" />
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
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    WhatsApp
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(00) 00000-0000" 
                      {...field} 
                      className="bg-muted/30 h-12"
                      onChange={(e) => {
                        // Simple phone mask logic could go here
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-bold shadow-lg transition-all hover:scale-[1.02]" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Acessando...' : 'Ver Calculadora Agora'}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground">
              Ao continuar, você concorda com nossos termos e política de privacidade.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
