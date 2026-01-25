

'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Copy, ArrowLeft } from 'lucide-react';
import type { AccessToken, TokenDuration } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { doc, setDoc, serverTimestamp, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import Link from 'next/link';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';

const generateRandomCode = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};


export default function GenerateActivationPage() {
  const [duration, setDuration] = useState<TokenDuration>(3);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState<AccessToken[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const { toast } = useToast();
  const { db } = useFirebase();

  useEffect(() => {
    const q = query(collection(db, 'accessTokens'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data: AccessToken[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
            usedAt: doc.data().usedAt?.toDate ? doc.data().usedAt.toDate() : undefined,
        })) as AccessToken[];
        setTokens(data);
        setLoadingTokens(false);
    }, (error) => {
        console.error("Error fetching tokens:", error);
        setLoadingTokens(false);
        toast({ variant: 'destructive', title: 'Erro ao buscar tokens' });
    });

    return () => unsubscribe();
  }, [db, toast]);

  const generateActivationCode = async (finalDuration: TokenDuration): Promise<string> => {
      const code = `${generateRandomCode(4)}-${generateRandomCode(4)}-${generateRandomCode(4)}`;
      const tokenRef = doc(db, 'accessTokens', code);

      const tokenData = {
        code,
        duration: finalDuration,
        isUsed: false,
        createdAt: serverTimestamp(),
        usedBy: null,
        usedAt: null,
      };

      try {
        await setDoc(tokenRef, tokenData);
        return code;
      } catch (error) {
        console.error("Error creating activation code:", error);
        throw new Error('Failed to save activation code to the database.');
      }
  };

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
        description: error.message || 'Não foi possível gerar o código. Verifique suas permissões.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copiado!',
      description: 'O código de ativação foi copiado para a área de transferência.',
    });
  };

  const formatDuration = (d: TokenDuration) => {
    if (d === 0.1) return '3 Dias (Trial)';
    if (d === 0.25) return '7 Dias (Trial)';
    if (d === 1) return '1 Mês';
    return `${d} Meses`;
  }

  const columns: ColumnDef<AccessToken>[] = useMemo(
    () => [
        {
            accessorKey: "code",
            header: "Código",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="font-mono">{row.original.code}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyToClipboard(row.original.code)}>
                        <Copy className="h-3 w-3" />
                    </Button>
                </div>
            )
        },
        {
            accessorKey: "duration",
            header: "Duração",
            cell: ({ row }) => formatDuration(row.original.duration),
        },
        {
            accessorKey: "isUsed",
            header: "Status",
            cell: ({ row }) => (
                row.original.isUsed
                    ? <Badge variant="secondary">Usado</Badge>
                    : <Badge variant="default" className="bg-green-600">Disponível</Badge>
            )
        },
        {
            accessorKey: "createdAt",
            header: "Criado em",
            cell: ({ row }) => format(row.original.createdAt, "dd/MM/yy HH:mm", { locale: ptBR }),
        },
        {
            accessorKey: "usedBy",
            header: "Usado Por (Email)",
             cell: ({ row }) => row.original.isUsed ? (row.original.usedBy || 'N/A') : '---'
        },
    ], []
  );

  const table = useReactTable({
      data: tokens,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
      state: {
          sorting,
      },
  });

  return (
    <div className="flex-1 space-y-8 px-4 pt-6 md:px-8">
       <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="h-7 w-7">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Gerenciador de Códigos
        </h2>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
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
              className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4"
              onValueChange={(value) => setDuration(Number(value))}
              disabled={isLoading}
            >
               <div>
                <RadioGroupItem value="0.25" id="d025" className="peer sr-only" />
                <Label htmlFor="d025" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  7 Dias (Trial)
                </Label>
              </div>
              <div>
                <RadioGroupItem value="3" id="d3" className="peer sr-only" />
                <Label htmlFor="d3" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  3 Meses
                </Label>
              </div>
              <div>
                <RadioGroupItem value="6" id="d6" className="peer sr-only" />
                <Label htmlFor="d6" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  6 Meses
                </Label>
              </div>
              <div>
                <RadioGroupItem value="12" id="d12" className="peer sr-only" />
                <Label htmlFor="d12" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
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
                <Button variant="outline" size="icon" onClick={() => handleCopyToClipboard(generatedCode)}>
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

      <Card>
        <CardHeader>
          <CardTitle>Códigos de Ativação</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os códigos gerados.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {loadingTokens ? <Skeleton className="h-64 w-full" /> : (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Nenhum código encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            )}
             <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Anterior
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Próximo
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
