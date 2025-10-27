
"use client"

import React, { useState, useMemo } from "react";
import { PriceTableItem } from "@/lib/types";
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
import { PriceTableToolbar } from "./price-table-toolbar";
import { PriceTableRowActions } from "./price-table-row-actions";

interface PriceTableShellProps {
  data: PriceTableItem[];
  onItemCreated: (item: PriceTableItem) => void;
  onItemUpdated: (itemId: string, updatedItem: Partial<PriceTableItem>) => void;
  onItemDeleted: (itemId: string) => void;
}

export function PriceTableShell({ data, onItemCreated, onItemUpdated, onItemDeleted }: PriceTableShellProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'serviceName', desc: false },
  ]);
  
  const columns: ColumnDef<PriceTableItem>[] = useMemo(
    () => [
      {
        accessorKey: "serviceName",
        header: "Serviço",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.serviceName}</div>
        ),
      },
      {
        accessorKey: "price",
        header: () => <div className="text-right">Preço</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("price"));
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
            <PriceTableRowActions 
              item={row.original} 
              onUpdate={onItemUpdated} 
              onDelete={onItemDeleted} 
            />
          </div>
        ),
      },
    ],
    [onItemUpdated, onItemDeleted]
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
      <PriceTableToolbar table={table} onItemCreated={onItemCreated} />
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
                    Nenhum serviço encontrado.
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
