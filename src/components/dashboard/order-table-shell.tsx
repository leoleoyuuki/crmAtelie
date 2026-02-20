
"use client"

import React, { useState, useMemo } from "react";
import { Order, OrderStatus } from "@/lib/types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
  getSortedRowModel,
  FilterFn,
  Row,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, isBefore, addDays, getMonth, getYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { OrderTableRowActions } from "./order-table-row-actions";
import { OrderTableToolbar } from "./order-table-toolbar";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { OrderCardMobile } from "./order-card-mobile";
import { Skeleton } from "../ui/skeleton";


interface OrderTableShellProps {
  data: Order[];
  isPage?: boolean;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  loading?: boolean;
  onDataMutated?: () => void;
  isPrivacyMode?: boolean;
}


const monthFilterFn: FilterFn<any> = (row, columnId, value, addMeta) => {
    const date = row.original.createdAt;
    if (!date) return false;
    const [month, year] = value.split('-').map(Number);
    return getMonth(date) === month && getYear(date) === year;
}

const serviceTypeFilterFn: FilterFn<any> = (row, columnId, value, addMeta) => {
    const items = row.original.items || [];
    return items.some(item => item.serviceType === value);
}

const completionStatusFilterFn: FilterFn<any> = (row, columnId, value, addMeta) => {
    const status = row.original.status;
    if (value === "Concluído") {
        return status === "Concluído";
    }
    if (value === "Não Concluído") {
        return status !== "Concluído";
    }
    return true;
}


export default function OrderTableShell({ 
    data, 
    isPage = false,
    onNextPage,
    onPrevPage,
    hasNextPage,
    hasPrevPage,
    loading,
    onDataMutated,
    isPrivacyMode = false,
}: OrderTableShellProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const isMobile = useIsMobile();

  const handleUpdate = () => {
    onDataMutated?.();
  }

  const uniqueServiceTypes = useMemo(() => {
    const types = new Set<string>();
    data.forEach(order => {
        order.items?.forEach(item => {
            if (item.serviceType) types.add(item.serviceType);
        });
    });
    return Array.from(types).sort();
  }, [data]);

  const columns: ColumnDef<Order>[] = useMemo(
    () => [
      {
        accessorKey: "customerName",
        header: ({ column }) => (
            <button 
                className="flex items-center gap-1 hover:text-foreground transition-colors uppercase text-[10px] font-black tracking-widest"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Nome do Cliente
                <ArrowUpDown className="h-3 w-3" />
            </button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-bold text-sm text-foreground">{row.original.customerName}</span>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-tight">#{row.original.id.substring(0, 7)}</span>
          </div>
        ),
      },
      {
        accessorKey: "items",
        header: () => <span className="uppercase text-[10px] font-black tracking-widest">Serviços</span>,
        filterFn: serviceTypeFilterFn,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {row.original.items && row.original.items.map((item, index) => (
              <Badge key={index} variant="secondary" className="px-2 py-0.5 text-[9px] font-bold uppercase border-none bg-muted/50 whitespace-nowrap">
                {item.serviceType}
              </Badge>
            ))}
          </div>
        )
      },
      {
        accessorKey: "totalValue",
        header: () => <div className="text-right uppercase text-[10px] font-black tracking-widest">Valor Total</div>,
        cell: ({ row }) => {
          if (isPrivacyMode) {
              return <div className="text-right font-black">R$ ●●●,●●</div>;
          }
          const amount = parseFloat(row.getValue("totalValue"));
          const formatted = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(amount);
          return <div className="text-right font-black text-sm">{formatted}</div>;
        },
      },
      {
        accessorKey: "dueDate",
        header: () => <div className="text-center uppercase text-[10px] font-black tracking-widest">Data de Entrega</div>,
        cell: ({ row }) => {
            const dueDate = row.original.dueDate;
            if (!dueDate) return null;
            const isDueSoon = isBefore(dueDate, addDays(new Date(), 3)) && !isBefore(dueDate, new Date());
            return (
                <div className="flex flex-col items-center">
                    <span className={cn('text-xs font-bold', isDueSoon ? 'text-destructive' : 'text-foreground')}>
                        {format(dueDate, "dd/MM/yyyy")}
                    </span>
                    <span className="text-[10px] text-muted-foreground italic">
                        {format(dueDate, "eeee", { locale: ptBR })}
                    </span>
                </div>
            )
        }
      },
      {
        accessorKey: "status",
        header: () => <span className="uppercase text-[10px] font-black tracking-widest">Status</span>,
        cell: ({ row }) => {
          const status = row.getValue("status") as OrderStatus;
          const colorClass = {
            "Novo": "bg-blue-500/10 text-blue-700 border-blue-200",
            "Em Processo": "bg-yellow-500/10 text-yellow-700 border-yellow-200",
            "Aguardando Retirada": "bg-purple-500/10 text-purple-700 border-purple-200",
            "Concluído": "bg-green-500/10 text-green-700 border-green-200",
          }[status];

          return <Badge className={cn(colorClass, "px-3 py-1 rounded-lg font-bold text-[10px] border shadow-none")} variant="outline">{status}</Badge>;
        },
      },
       {
        accessorKey: 'createdAt',
        header: 'Criado em',
        filterFn: monthFilterFn,
        cell: ({ row }) => row.original.createdAt ? format(row.original.createdAt, 'dd/MM/yyyy') : '---',
      },
       {
        accessorKey: 'completionStatus',
        filterFn: completionStatusFilterFn,
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="text-right">
            <OrderTableRowActions 
              order={row.original} 
              onUpdate={handleUpdate}
              onDelete={handleUpdate}
            />
          </div>
        ),
      },
    ],
    [onDataMutated, isPrivacyMode]
  );

  const table = useReactTable({
    data: data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      sorting,
    },
    initialState: {
      pagination: { pageSize: isPage ? 10 : 5 },
       columnVisibility: {
        createdAt: false, 
        completionStatus: false,
      },
    },
    manualPagination: isPage,
  });

  const renderPagination = () => {
    const canPrev = isPage ? hasPrevPage : table.getCanPreviousPage();
    const canNext = isPage ? hasNextPage : table.getCanNextPage();
    const onPrev = isPage ? onPrevPage : () => table.previousPage();
    const onNext = isPage ? onNextPage : () => table.nextPage();

    return (
        <div className="flex items-center justify-between p-6 border-t bg-muted/5">
            <p className="text-xs text-muted-foreground font-medium">
                Mostrando <span className="font-bold text-foreground">{table.getRowModel().rows.length}</span> resultados
            </p>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onPrev}
                    disabled={!canPrev || loading}
                    className="h-8 rounded-lg font-bold text-xs"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onNext}
                    disabled={!canNext || loading}
                    className="h-8 rounded-lg font-bold text-xs"
                >
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    );
  }

  if (loading && data.length === 0) {
      return <Skeleton className="h-[400px] w-full rounded-3xl" />
  }

  return (
    <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-card">
      <OrderTableToolbar 
        table={table} 
        onOrderCreated={handleUpdate}
        isPage={isPage} 
        serviceTypes={uniqueServiceTypes}
      />
      <CardContent className="p-0">
        {isMobile ? (
          <div className="space-y-4 p-6">
            {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                    <OrderCardMobile 
                        key={row.id}
                        row={row as Row<Order>}
                        onUpdate={handleUpdate}
                        onDelete={handleUpdate}
                        isPrivacyMode={isPrivacyMode}
                    />
                ))
            ) : (
                <div className="py-24 text-center text-muted-foreground italic">
                    Nenhum pedido encontrado.
                </div>
            )}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30 border-y">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="h-12 py-0">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-muted/20 border-b last:border-0 transition-colors h-16"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-48 text-center text-muted-foreground italic"
                    >
                      Nenhum resultado para os filtros aplicados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
        {renderPagination()}
      </CardContent>
    </Card>
  );
}
