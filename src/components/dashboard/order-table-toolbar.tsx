"use client"

import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { OrderFormDialog } from "./order-form-dialog"
import { Order, OrderStatus } from "@/lib/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CardHeader, CardTitle, CardDescription } from "../ui/card"

interface OrderTableToolbarProps<TData> {
  table: Table<TData>
  onOrderCreated: (order: Order) => void
}

const statuses: OrderStatus[] = ['Novo', 'Em Processo', 'Aguardando Retirada', 'Concluído'];

export function OrderTableToolbar<TData>({ table, onOrderCreated }: OrderTableToolbarProps<TData>) {
  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline">Pedidos Recentes</CardTitle>
        <CardDescription>
          Gerencie e acompanhe todos os pedidos de seus clientes.
        </CardDescription>
      </CardHeader>
      <div className="flex items-center justify-between p-6 pt-0">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Filtrar por nome do cliente..."
            value={(table.getColumn("customerName")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("customerName")?.setFilterValue(event.target.value)
            }
            className="h-10 w-[150px] lg:w-[250px]"
          />
          <Select
            value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
            onValueChange={(value) => {
              if (value === "all") {
                table.getColumn("status")?.setFilterValue(undefined);
              } else {
                table.getColumn("status")?.setFilterValue(value);
              }
            }}
          >
            <SelectTrigger className="h-10 w-[180px]">
              <SelectValue placeholder="Filtrar por status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <OrderFormDialog onOrderCreated={onOrderCreated} />
      </div>
    </>
  )
}
