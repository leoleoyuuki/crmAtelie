"use client"

import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Customer } from "@/lib/types"
import { CardHeader, CardTitle, CardDescription } from "../ui/card"
import { CustomerFormDialog } from "../dashboard/customer-form-dialog"
import { UserPlus } from "lucide-react"
import { Button } from "../ui/button"

interface CustomerTableToolbarProps<TData> {
  table: Table<TData>
  onCustomerCreated: (customer: Customer) => void
}


export function CustomerTableToolbar<TData>({ table, onCustomerCreated }: CustomerTableToolbarProps<TData>) {
  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline">Todos os Clientes</CardTitle>
        <CardDescription>
          Gerencie e acompanhe todos os seus clientes.
        </CardDescription>
      </CardHeader>
      <div className="flex items-center justify-between p-6 pt-0">
        <div className="flex items-center pr-2">
          <Input
            placeholder="Filtrar por nome do cliente..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="h-10 w-full"
          />
        </div>
        <CustomerFormDialog
            onCustomerCreated={onCustomerCreated}
            onCustomerUpdated={() => {}}
            trigger={
                <Button size="icon" className="md:w-auto md:px-4 flex-shrink-0">
                    <UserPlus className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Novo Cliente</span>
                </Button>
            }
        />
      </div>
    </>
  )
}
