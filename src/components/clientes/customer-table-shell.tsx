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

interface CustomerTableShellProps {
  data: Customer[];
  loading: boolean;
}

export function CustomerTableShell({ data, loading }: CustomerTableShellProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const isMobile = useIsMobile();
  
  const columns: ColumnDef<Customer>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Nome",
        cell: ({ row }) => (
          <div className="font-medium text-sm">{row.original.name}</div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Telefone",
        cell: ({ row }) => <div className="text-sm">{row.original.phone}</div>,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <div className="text-sm">{row.original.email || "N/A"}</div>,
      },
      {
        accessorKey: 'createdAt',
        header: 'Cliente Desde',
        cell: ({ row }) => {
          const createdAt = row.original.createdAt;
          // Check if createdAt is a valid date before formatting
          return isValid(createdAt)
            ? format(createdAt, 'dd/MM/yyyy')
            : "Calculando...";
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="text-right">
            <CustomerTableRowActions 
              customer={row.original} 
            />
          </div>
        ),
      },
    ],
    []
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
      pagination: {
        pageSize: 10,
      },
       columnVisibility: {
        createdAt: false,
      },
    }
  });

  if (loading) {
      return <Skeleton className="h-[600px] w-full" />;
  }

  const renderPagination = () => (
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
  );

  return (
    <Card>
      <CustomerTableToolbar table={table} />
      <CardContent>
        {isMobile ? (
          <div className="space-y-4">
            {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                    <CustomerCardMobile
                        key={row.id}
                        row={row as Row<Customer>}
                    />
                ))
            ) : (
                <div className="py-24 text-center text-muted-foreground">
                    Nenhum cliente encontrado.
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
