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
import { ArrowUpDown, ChevronUp, ChevronDown, Scissors } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface PriceTableShellProps {
  data: PriceTableItem[];
  onItemCreated: (item: PriceTableItem) => void;
  onItemUpdated: (itemId: string, updatedItem: Partial<PriceTableItem>) => void;
  onItemDeleted: (itemId: string) => void;
}

const PAGE_SIZE = 10;

export function PriceTableShell({ data, onItemCreated, onItemUpdated, onItemDeleted }: PriceTableShellProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'serviceName', desc: false },
  ]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  
  const columns: ColumnDef<PriceTableItem>[] = useMemo(
    () => [
      {
        accessorKey: "serviceName",
        header: ({ column }) => (
            <button 
                className="flex items-center gap-1 hover:text-foreground transition-colors uppercase text-[10px] font-black tracking-widest"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Nome do Serviço
                <ArrowUpDown className="h-3 w-3" />
            </button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                <Scissors className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-sm text-foreground">{row.original.serviceName}</span>
                {row.original.description && <span className="text-[10px] text-muted-foreground line-clamp-1 italic">{row.original.description}</span>}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: () => <div className="text-right uppercase text-[10px] font-black tracking-widest">Valor Padrão</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("price"));
          const formatted = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(amount);
          return <div className="text-right font-black text-sm text-foreground">{formatted}</div>;
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
      pagination: {
          pageSize: visibleCount,
          pageIndex: 0
      }
    },
  });

  const hasMore = data.length > visibleCount;
  const hasPrev = visibleCount > PAGE_SIZE;

  const renderPagination = () => (
    <div className="flex items-center justify-between p-6 border-t bg-muted/5">
        <p className="text-xs text-muted-foreground font-medium">
            Total de <span className="font-bold text-foreground">{data.length}</span> serviços cadastrados
        </p>
        <div className="flex items-center gap-2">
            {hasPrev && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVisibleCount(prev => Math.max(PAGE_SIZE, prev - PAGE_SIZE))}
                    className="h-8 rounded-lg font-bold text-xs bg-background"
                >
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Ver Menos
                </Button>
            )}
            {hasMore && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                    className="h-8 rounded-lg font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Ver Mais
                </Button>
            )}
        </div>
    </div>
  );

  return (
    <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-card">
      <PriceTableToolbar table={table} onItemCreated={onItemCreated} />
      <CardContent className="p-0">
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
                    Nenhum serviço encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {renderPagination()}
      </CardContent>
    </Card>
  );
}
