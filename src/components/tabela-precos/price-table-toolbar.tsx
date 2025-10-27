
"use client"

import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { PriceTableItem } from "@/lib/types"
import { CardHeader, CardTitle, CardDescription } from "../ui/card"
import { PriceFormDialog } from "./price-form-dialog"
import { Tag } from "lucide-react"
import { Button } from "../ui/button"

interface PriceTableToolbarProps<TData> {
  table: Table<TData>
  onItemCreated: (item: PriceTableItem) => void
}

export function PriceTableToolbar<TData>({ table, onItemCreated }: PriceTableToolbarProps<TData>) {
  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline">Serviços e Preços</CardTitle>
        <CardDescription>
          Gerencie os serviços e preços padrões do seu ateliê.
        </CardDescription>
      </CardHeader>
      <div className="flex items-center justify-between p-6 pt-0">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Filtrar por nome do serviço..."
            value={(table.getColumn("serviceName")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("serviceName")?.setFilterValue(event.target.value)
            }
            className="h-10 w-[200px] lg:w-[300px]"
          />
        </div>
        <PriceFormDialog
            onItemCreated={onItemCreated}
            onItemUpdated={() => {}} // This will be handled by the shell
            trigger={
                <Button>
                    <Tag className="mr-2 h-4 w-4" />
                    Novo Serviço
                </Button>
            }
        />
      </div>
    </>
  )
}
