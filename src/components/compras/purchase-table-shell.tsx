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
import { PurchaseTableToolbar } from "./purchase-table-toolbar";
import { PurchaseTableRowActions } from "./purchase-table-row-actions";
import { Badge } from "../ui/badge";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";
import { PurchaseCardMobile } from "./purchase-card-mobile";
import { Skeleton } from "../ui/skeleton";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";

interface PurchaseTableShellProps {
  data: Purchase[];
  loading: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onDataMutated: () => void;
}

export function PurchaseTableShell({ 
    data, 
    loading,
    onNextPage,
    onPrevPage,
    hasNextPage,
    hasPrevPage,
    onDataMutated,
}: PurchaseTableShellProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const isMobile = useIsMobile();
  
  const columns: ColumnDef<Purchase>[] = useMemo(
    () => [
      {
        accessorKey: "materialName",
        header: () => <span className="uppercase text-[10px] font-black tracking-widest">Insumo</span>,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                <ShoppingBag className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-sm text-foreground leading-tight">{row.original.materialName}</span>
                <span className="text-[10px] text-muted-foreground font-mono uppercase">ID: {row.original.id.substring(0, 7)}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: () => <span className="uppercase text-[10px] font-black tracking-widest">Categoria</span>,
        cell: ({ row }) => {
            const category = row.original.category;
            return category 
                ? <Badge variant="secondary" className="px-2 py-0.5 text-[9px] font-bold uppercase border-none bg-muted/50 whitespace-nowrap">{category}</Badge> 
                : <span className="text-muted-foreground">-</span>;
        }
      },
      {
        accessorKey: "quantity",
        header: () => <span className="uppercase text-[10px] font-black tracking-widest">Quantidade</span>,
        cell: ({ row }) => {
            const quantity = row.original.quantity;
            const unit = row.original.unit;
            return (
                <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold">{quantity}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{unit}</span>
                </div>
            )
        }
      },
      {
        accessorKey: "cost",
        header: () => <div className="text-right uppercase text-[10px] font-black tracking-widest">Custo Total</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("cost"));
          const formatted = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(amount);
          return <div className="text-right font-black text-sm text-foreground">{formatted}</div>;
        },
      },
      {
        accessorKey: "createdAt",
        header: () => <div className="text-center uppercase text-[10px] font-black tracking-widest">Data</div>,
        cell: ({ row }) => {
          const createdAt = row.original.createdAt;
          return (
            <div className="text-center">
                <span className="text-xs font-bold">
                    {isValid(createdAt) ? format(createdAt, "dd/MM/yy", { locale: ptBR }) : "..."}
                </span>
            </div>
          )
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="text-right">
            <PurchaseTableRowActions 
              purchase={row.original} 
              onPurchaseDeleted={onDataMutated}
            />
          </div>
        ),
      },
    ],
    [onDataMutated]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      sorting,
    },
    manualPagination: true,
  });

  if (loading && data.length === 0) {
      return <Skeleton className="h-[600px] w-full rounded-3xl" />
  }

  const renderPagination = () => (
    <div className="flex items-center justify-between p-6 border-t bg-muted/5">
        <p className="text-xs text-muted-foreground font-medium">
            Mostrando <span className="font-bold text-foreground">{table.getRowModel().rows.length}</span> compras
        </p>
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={onPrevPage}
                disabled={!hasPrevPage || loading}
                className="h-8 rounded-lg font-bold text-xs"
            >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onNextPage}
                disabled={!hasNextPage || loading}
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
      <PurchaseTableToolbar table={table} onPurchaseCreated={onDataMutated} />
      <CardContent className="p-0">
        {isMobile ? (
           <div className="space-y-4 p-6">
            {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                    <PurchaseCardMobile
                        key={row.id}
                        row={row as Row<Purchase>}
                    />
                ))
            ) : (
                <div className="py-24 text-center text-muted-foreground italic">
                    Nenhum registro de compra encontrado.
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
                      Nenhum resultado encontrado.
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
