"use client"

import React, { useState, useMemo } from "react";
import { Material } from "@/lib/types";
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
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { MaterialTableToolbar } from "./material-table-toolbar";
import { MaterialTableRowActions } from "./material-table-row-actions";
import { useIsMobile } from "@/hooks/use-mobile";
import { MaterialCardMobile } from "./material-card-mobile";
import { Box, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

interface MaterialTableShellProps {
  data: Material[];
}

export function MaterialTableShell({ data }: MaterialTableShellProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: false },
  ]);
  const isMobile = useIsMobile();
  
  const columns: ColumnDef<Material>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
            <button 
                className="flex items-center gap-1 hover:text-foreground transition-colors uppercase text-[10px] font-black tracking-widest"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Material
                <ArrowUpDown className="h-3 w-3" />
            </button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                <Box className="h-4 w-4 text-secondary" />
            </div>
            <span className="font-bold text-sm text-foreground">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: "stock",
        header: () => <span className="uppercase text-[10px] font-black tracking-widest">Saldo em Estoque</span>,
        cell: ({ row }) => {
            const stock = row.original.stock;
            const unit = row.original.unit;
            return (
                <div className="flex items-baseline gap-1">
                    <span className={`text-sm font-black ${stock <= 2 ? 'text-destructive' : 'text-foreground'}`}>
                        {stock}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{unit}</span>
                </div>
            )
        }
      },
      {
        accessorKey: 'costPerUnit',
        header: () => <div className="text-right uppercase text-[10px] font-black tracking-widest">Custo p/ Unidade</div>,
        cell: ({ row }) => {
          const amount = parseFloat(String(row.getValue("costPerUnit") || 0));
          const formatted = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(amount);
          return <div className="text-right font-bold text-sm text-foreground">{formatted}</div>;
        },
      },
       {
        accessorKey: "usedInOrders",
        header: () => <div className="text-center uppercase text-[10px] font-black tracking-widest">Popularidade</div>,
        cell: ({ row }) => {
            const usedCount = row.original.usedInOrders || 0;
            return (
                <div className="flex justify-center">
                    <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded-full">
                        {usedCount} {usedCount === 1 ? 'uso' : 'usos'}
                    </span>
                </div>
            )
        }
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="text-right">
            <MaterialTableRowActions 
              material={row.original} 
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

  const renderPagination = () => (
    <div className="flex items-center justify-between p-6 border-t bg-muted/5">
        <p className="text-xs text-muted-foreground font-medium">
            Total de <span className="font-bold text-foreground">{data.length}</span> insumos
        </p>
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-8 rounded-lg font-bold text-xs"
            >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-8 rounded-lg font-bold text-xs"
            >
                Próximo
                <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
        </div>
    </div>
  );

  return (
    <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-card">
      <MaterialTableToolbar table={table} />
      <CardContent className="p-0">
        {isMobile ? (
          <div className="space-y-4 p-6">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <MaterialCardMobile
                  key={row.id}
                  row={row as Row<Material>}
                />
              ))
            ) : (
              <div className="py-24 text-center text-muted-foreground italic">
                Nenhum material no estoque.
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
                      Nenhum material encontrado.
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
