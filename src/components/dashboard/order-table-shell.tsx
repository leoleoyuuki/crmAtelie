
"use client"

import React, { useState, useMemo, useEffect } from "react";
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
import { ArrowUpDown } from "lucide-react";
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
        header: "Cliente",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.customerName}</div>
        ),
      },
      {
        accessorKey: "id",
        header: "Pedido",
        cell: ({ row }) => (
            <div className="font-mono text-xs uppercase">
                #{row.original.id.substring(0, 7)}
            </div>
        )
      },
      {
        accessorKey: "items",
        header: "Serviços",
        filterFn: serviceTypeFilterFn,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.items && row.original.items.map((item, index) => (
              <Badge key={index} variant="secondary" className="px-1 py-0.5 text-[10px] whitespace-nowrap">
                {item.serviceType}
              </Badge>
            ))}
          </div>
        )
      },
      {
        accessorKey: "totalValue",
        header: () => <div className="text-right">Total</div>,
        cell: ({ row }) => {
          if (isPrivacyMode) {
              return <div className="text-right font-medium">R$ ●●●,●●</div>;
          }
          const amount = parseFloat(row.getValue("totalValue"));
          const formatted = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(amount);
          return <div className="text-right font-medium">{formatted}</div>;
        },
      },
      {
        accessorKey: "dueDate",
        header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Data de Entrega
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            )
        },
        cell: ({ row }) => {
            const dueDate = row.original.dueDate;
            if (!dueDate) return null;
            const isDueSoon = isBefore(dueDate, addDays(new Date(), 3)) && !isBefore(dueDate, new Date());
            return <div className={cn('text-center', isDueSoon ? 'text-destructive font-semibold' : '')}>{format(dueDate, "PPP", { locale: ptBR })}</div>
        }
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as OrderStatus;
          const colorClass = {
            "Novo": "bg-blue-500/20 text-blue-700 border-blue-500/50",
            "Em Processo": "bg-yellow-500/20 text-yellow-700 border-yellow-500/50",
            "Aguardando Retirada": "bg-purple-500/20 text-purple-700 border-purple-500/50",
            "Concluído": "bg-green-500/20 text-green-700 border-green-500/50",
          }[status];

          return <Badge className={colorClass} variant="outline">{status}</Badge>;
        },
      },
       {
        accessorKey: 'createdAt',
        header: 'Criado em',
        filterFn: monthFilterFn,
        cell: ({ row }) => format(row.original.createdAt, 'dd/MM/yyyy'),
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
    if (isPage) {
        return (
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onPrevPage}
                    disabled={!hasPrevPage || loading}
                >
                    Anterior
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onNextPage}
                    disabled={!hasNextPage || loading}
                >
                    Próximo
                </Button>
            </div>
        );
    }
     // Render internal pagination for non-page (dashboard) view
    if (table.getPageCount() > 1) {
        return (
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
        )
    }

    return null;
  }

  if (loading && data.length === 0) {
      return <Skeleton className="h-[400px] w-full" />
  }

  return (
    <Card>
      <OrderTableToolbar 
        table={table} 
        onOrderCreated={handleUpdate}
        isPage={isPage} 
        serviceTypes={uniqueServiceTypes}
      />
      <CardContent>
        {isMobile ? (
          <div className="space-y-4">
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
                <div className="py-24 text-center text-muted-foreground">
                    Nenhum resultado.
                </div>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
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
                      className="h-24 text-center"
                    >
                      Nenhum resultado.
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
