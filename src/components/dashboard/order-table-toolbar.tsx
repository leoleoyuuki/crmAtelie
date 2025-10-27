
"use client"

import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { OrderFormDialog } from "./order-form-dialog"
import { Order, OrderStatus, ServiceType } from "@/lib/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CardHeader, CardTitle, CardDescription } from "../ui/card"
import { getMonths } from "@/lib/data"

interface OrderTableToolbarProps<TData> {
  table: Table<TData>
  onOrderCreated: (order: Order) => void
  isPage?: boolean;
}

const statuses: OrderStatus[] = ['Novo', 'Em Processo', 'Aguardando Retirada', 'Concluído'];
const serviceTypes: ServiceType[] = ["Ajuste", "Design Personalizado", "Reparo", "Lavagem a Seco"];
const months = getMonths();


export function OrderTableToolbar<TData>({ table, onOrderCreated, isPage = false }: OrderTableToolbarProps<TData>) {
  return (
    <>
      {!isPage && (
        <CardHeader>
            <CardTitle className="font-headline">Pedidos Recentes</CardTitle>
            <CardDescription>
            Gerencie e acompanhe todos os pedidos de seus clientes.
            </CardDescription>
        </CardHeader>
      )}
      <div className="flex items-center justify-between p-6 pt-0">
        <div className="flex flex-1 items-center space-x-2 flex-wrap gap-y-2">
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
              table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value);
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
           <Select
            value={(table.getColumn("items")?.getFilterValue() as string) ?? "all"}
            onValueChange={(value) => {
              table.getColumn("items")?.setFilterValue(value === "all" ? undefined : value)
            }}
          >
            <SelectTrigger className="h-10 w-[180px]">
              <SelectValue placeholder="Tipo de Serviço..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Serviços</SelectItem>
              {serviceTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
             value={(table.getColumn("createdAt")?.getFilterValue() as string) ?? "all"}
             onValueChange={(value) => {
                table.getColumn("createdAt")?.setFilterValue(value === "all" ? undefined : value)
             }}
          >
            <SelectTrigger className="h-10 w-[180px]">
                <SelectValue placeholder="Filtrar por Mês..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todos os Meses</SelectItem>
                 {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="pl-2">
            <OrderFormDialog onOrderCreated={onOrderCreated} />
        </div>
      </div>
    </>
  )
}
