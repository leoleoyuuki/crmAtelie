
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
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Filtrar por nome do cliente..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="h-10 w-[200px] lg:w-[300px]"
          />
        </div>
        <CustomerFormDialog
            onCustomerCreated={onCustomerCreated}
            onCustomerUpdated={() => {}}
            trigger={
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Novo Cliente
                </Button>
            }
        />
      </div>
    </>
  )
}
