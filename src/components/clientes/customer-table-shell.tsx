"use client"

import React, { useState, useMemo } from "react";
import { Customer } from "@/lib/types";
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
import { format, isValid } from "date-fns";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { CustomerTableToolbar } from "./customer-table-toolbar";
import { CustomerTableRowActions } from "./customer-table-row-actions";
import { Skeleton } from "../ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { CustomerCardMobile } from "./customer-card-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

interface CustomerTableShellProps {
  data: Customer[];
  loading: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onDataMutated: () => void;
}

export function CustomerTableShell({ 
    data, 
    loading, 
    onNextPage, 
    onPrevPage, 
    hasNextPage, 
    hasPrevPage,
    onDataMutated 
}: CustomerTableShellProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const isMobile = useIsMobile();
  
  const columns: ColumnDef<Customer>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
            <button 
                className="flex items-center gap-1 hover:text-foreground transition-colors uppercase text-[10px] font-black tracking-widest"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Nome
                <ArrowUpDown className="h-3 w-3" />
            </button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 rounded-lg border bg-muted/50">
                <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
                    {row.original.name.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <span className="font-bold text-sm text-foreground">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: () => <span className="uppercase text-[10px] font-black tracking-widest">WhatsApp</span>,
        cell: ({ row }) => <div className="text-sm font-medium text-muted-foreground">{row.original.phone}</div>,
      },
      {
        accessorKey: "email",
        header: () => <span className="uppercase text-[10px] font-black tracking-widest">E-mail</span>,
        cell: ({ row }) => <div className="text-sm font-medium text-muted-foreground">{row.original.email || "---"}</div>,
      },
      {
        accessorKey: 'createdAt',
        header: () => <span className="uppercase text-[10px] font-black tracking-widest text-center block">Desde</span>,
        cell: ({ row }) => {
          const createdAt = row.original.createdAt;
          return (
            <div className="text-center">
                <span className="text-xs font-bold">
                    {isValid(createdAt) ? format(createdAt, 'dd/MM/yy') : "..."}
                </span>
            </div>
          )
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="text-right">
            <CustomerTableRowActions 
              customer={row.original} 
              onCustomerDeleted={onDataMutated}
            />
          </div>
        ),
      },
    ],
    [onDataMutated]
  );

  const table = useReactTable({
    data: data,
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

  if (loading && table.getRowModel().rows.length === 0) {
      return <Skeleton className="h-[600px] w-full rounded-3xl" />;
  }

  const renderPagination = () => (
    <div className="flex items-center justify-between p-6 border-t bg-muted/5">
        <p className="text-xs text-muted-foreground font-medium">
            Total de <span className="font-bold text-foreground">{data.length}</span> clientes na lista
        </p>
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPrevPage()}
                disabled={!hasPrevPage || loading}
                className="h-8 rounded-lg font-bold text-xs"
            >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onNextPage()}
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
      <CustomerTableToolbar table={table} onCustomerCreated={onDataMutated} />
      <CardContent className="p-0">
        {isMobile ? (
          <div className="space-y-4 p-6">
            {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                    <CustomerCardMobile
                        key={row.id}
                        row={row as Row<Customer>}
                    />
                ))
            ) : (
                <div className="py-24 text-center text-muted-foreground italic">
                    Nenhum cliente cadastrado.
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
                      Nenhum cliente encontrado.
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
