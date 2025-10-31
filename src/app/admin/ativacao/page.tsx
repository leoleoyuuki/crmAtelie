
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateActivationCode } from './actions';
import { KeyRound, Copy } from 'lucide-react';
import type { TokenDuration } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function GenerateActivationPage() {
  const [duration, setDuration] = useState<TokenDuration>(3);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedCode(null);
    try {
      const code = await generateActivationCode(duration);
      setGeneratedCode(code);
      toast({
        title: 'Código Gerado!',
        description: 'Compartilhe este código com seu cliente.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao Gerar Código',
        description: error.message || 'Não foi possível gerar o código.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      toast({
        title: 'Copiado!',
        description: 'O código de ativação foi copiado para a área de transferência.',
      });
    }
  };

  return (
    <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
       <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Gerador de Códigos
        </h2>
      </div>

      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Gerar Novo Código de Ativação</CardTitle>
          <CardDescription>
            Selecione a duração da assinatura e gere um novo código para um cliente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="font-semibold">Duração da Assinatura</Label>
            <RadioGroup
              defaultValue="3"
              className="mt-2 grid grid-cols-3 gap-4"
              onValueChange={(value) => setDuration(Number(value) as TokenDuration)}
              disabled={isLoading}
            >
              <div>
                <RadioGroupItem value="3" id="d3" className="peer sr-only" />
                <Label
                  htmlFor="d3"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  3 Meses
                </Label>
              </div>
              <div>
                <RadioGroupItem value="6" id="d6" className="peer sr-only" />
                <Label
                  htmlFor="d6"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  6 Meses
                </Label>
              </div>
              <div>
                <RadioGroupItem value="12" id="d12" className="peer sr-only" />
                <Label
                  htmlFor="d12"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  12 Meses
                </Label>
              </div>
            </RadioGroup>
          </div>

          {isLoading && (
             <div className="space-y-2 pt-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
          )}

          {generatedCode && !isLoading && (
            <div className="space-y-2 pt-4">
              <Label className="font-semibold">Código Gerado</Label>
              <div className="flex items-center space-x-2">
                <Input value={generatedCode} readOnly className="font-mono" />
                <Button variant="outline" size="icon" onClick={handleCopyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Copie e envie este código para seu cliente ativar a conta.
              </p>
            </div>
          )}

        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
            <KeyRound className="mr-2 h-4 w-4" />
            {isLoading ? 'Gerando...' : 'Gerar Código'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
