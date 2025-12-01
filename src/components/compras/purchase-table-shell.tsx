
"use client"

import React, { useState, useMemo } from "react";
import { Purchase } from "@/lib/types";
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
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { PurchaseTableToolbar } from "./purchase-table-toolbar";
import { PurchaseTableRowActions } from "./purchase-table-row-actions";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PurchaseTableShellProps {
  data: Purchase[];
}

export function PurchaseTableShell({ data }: PurchaseTableShellProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  
  const columns: ColumnDef<Purchase>[] = useMemo(
    () => [
      {
        accessorKey: "createdAt",
        header: "Data da Compra",
        cell: ({ row }) => format(row.original.createdAt, "dd/MM/yyyy", { locale: ptBR }),
      },
      {
        accessorKey: "materialName",
        header: "Material",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.materialName}</div>
        ),
      },
      {
        accessorKey: "category",
        header: "Categoria",
        cell: ({ row }) => {
            const category = row.original.category;
            return category ? <Badge variant="secondary">{category}</Badge> : <span className="text-muted-foreground">-</span>;
        }
      },
      {
        accessorKey: "quantity",
        header: "Quantidade Comprada",
        cell: ({ row }) => {
            const quantity = row.original.quantity;
            const unit = row.original.unit;
            return <div>{`${quantity} ${unit}`}</div>
        }
      },
      {
        accessorKey: "cost",
        header: () => <div className="text-right">Custo Total</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("cost"));
          const formatted = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(amount);
          return <div className="text-right font-medium">{formatted}</div>;
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="text-right">
            <PurchaseTableRowActions 
              purchase={row.original} 
            />
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
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
        pageSize: 10,
      },
    }
  });

  return (
    <Card>
      <PurchaseTableToolbar table={table} />
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
                    Nenhum registro de compra encontrado.
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
