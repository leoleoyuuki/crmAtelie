
"use client"

import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { CardHeader, CardTitle, CardDescription } from "../ui/card"
import { Archive } from "lucide-react"
import { Button } from "../ui/button"
import { MaterialFormDialog } from "./material-form-dialog"

interface MaterialTableToolbarProps<TData> {
  table: Table<TData>
}

export function MaterialTableToolbar<TData>({ table }: MaterialTableToolbarProps<TData>) {
  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline">Inventário de Materiais</CardTitle>
        <CardDescription>
          Visualize e gerencie os materiais do seu ateliê. A entrada de novos itens é feita através da página de Compras.
        </CardDescription>
      </CardHeader>
      <div className="flex items-center justify-between p-6 pt-0">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Filtrar por nome do material..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="h-10 w-[200px] lg:w-[300px]"
          />
        </div>
      </div>
    </>
  )
}
