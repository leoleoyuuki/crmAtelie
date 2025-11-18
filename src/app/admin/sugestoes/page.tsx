
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Suggestion } from '@/lib/types';
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, ArrowLeft } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SuggestionRowActionsProps {
  suggestion: Suggestion;
}

function SuggestionRowActions({ suggestion }: SuggestionRowActionsProps) {
    const { db } = useFirebase();
    const { toast } = useToast();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleDelete = async () => {
        const docRef = doc(db, 'suggestions', suggestion.id);
        try {
            await deleteDoc(docRef);
            toast({
                title: "Sugestão Excluída",
                description: "A sugestão foi removida com sucesso.",
            });
            setIsDeleteDialogOpen(false);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro ao Excluir",
                description: "Não foi possível remover a sugestão.",
            });
        }
    };

    return (
        <>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-red-600" onSelect={() => setIsDeleteDialogOpen(true)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Essa ação não pode ser desfeita e excluirá permanentemente esta sugestão.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default function SuggestionsAdminPage() {
    const { db } = useFirebase();
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
    const { user, loading: userLoading } = useUser();
    const router = useRouter();

    const isAdmin = user?.uid === "3YuL6Ff7G9cHAV7xa81kyQF4bCw2";

    useEffect(() => {
        if (userLoading) return;
        if (!isAdmin) {
            router.push('/');
            return;
        }

        const q = query(collection(db, 'suggestions'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Suggestion[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate(),
            })) as Suggestion[];
            setSuggestions(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching suggestions:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [db, userLoading, isAdmin, router]);

    const columns: ColumnDef<Suggestion>[] = useMemo(
        () => [
            {
                accessorKey: "createdAt",
                header: "Data",
                cell: ({ row }) => format(row.original.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
            },
            {
                accessorKey: "userName",
                header: "Usuário",
            },
            {
                accessorKey: "userEmail",
                header: "Email",
            },
            {
                accessorKey: "text",
                header: "Sugestão",
                cell: ({ row }) => <p className="whitespace-pre-wrap">{row.original.text}</p>
            },
            {
                id: "actions",
                cell: ({ row }) => <SuggestionRowActions suggestion={row.original} />,
            },
        ], []
    );

    const table = useReactTable({
        data: suggestions,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    });

    if (loading || userLoading) {
        return (
            <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }
     if (!isAdmin) {
        return (
             <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Acesso Negado</CardTitle>
                        <CardDescription>Você não tem permissão para acessar esta página.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4 mb-2">
                        <Button asChild variant="outline" size="icon" className="h-7 w-7">
                            <Link href="/">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="sr-only">Voltar</span>
                            </Link>
                        </Button>
                        <CardTitle className="font-headline text-3xl">Sugestões dos Usuários</CardTitle>
                    </div>
                    <CardDescription className="pl-11">
                        Visualize e gerencie o feedback e as ideias enviadas pelos usuários.
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                                            Nenhuma sugestão encontrada.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
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
