
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
import { format, isBefore, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { OrderTableRowActions } from "./order-table-row-actions";
import { OrderTableToolbar } from "./order-table-toolbar";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

interface OrderTableShellProps {
  data: Order[];
  isPage?: boolean;
}

export default function OrderTableShell({ data, isPage = false }: OrderTableShellProps) {
  const [orders, setOrders] = useState<Order[]>(data);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  
  useEffect(() => {
    setOrders(data);
  }, [data]);

  const addOptimisticOrder = (order: Order) => {
    setOrders(currentOrders => [order, ...currentOrders]);
  };

  const updateOptimisticOrder = (orderId: string, updatedOrder: Partial<Order>) => {
    setOrders(currentOrders =>
      currentOrders.map(o => o.id === orderId ? { ...o, ...updatedOrder } : o)
    );
  };

  const removeOptimisticOrder = (orderId: string) => {
    setOrders(currentOrders => currentOrders.filter(o => o.id !== orderId));
  };
  
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
        accessorKey: "items",
        header: "Serviços",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.items.map((item, index) => (
              <Badge key={index} variant="secondary">{item.serviceType}</Badge>
            ))}
          </div>
        )
      },
      {
        accessorKey: "totalValue",
        header: () => <div className="text-right">Total</div>,
        cell: ({ row }) => {
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
        header: "Data de Entrega",
        cell: ({ row }) => {
            const dueDate = row.original.dueDate;
            if (!dueDate) return null;
            const isDueSoon = isBefore(dueDate, addDays(new Date(), 3)) && !isBefore(dueDate, new Date());
            return <span className={isDueSoon ? 'text-destructive font-semibold' : ''}>{format(dueDate, "PPP", { locale: ptBR })}</span>
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
        cell: ({ row }) => format(row.original.createdAt, 'dd/MM/yyyy'),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="text-right">
            <OrderTableRowActions 
              order={row.original} 
              onUpdate={updateOptimisticOrder} 
              onDelete={removeOptimisticOrder} 
            />
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: orders,
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
      pagination: {
        pageSize: isPage ? 10 : 5,
      },
       columnVisibility: {
        createdAt: false, 
      },
    }
  });

  return (
    <Card>
      <OrderTableToolbar 
        table={table} 
        onOrderCreated={addOptimisticOrder} 
        isPage={isPage} 
      />
      <CardContent>
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
  );
}
