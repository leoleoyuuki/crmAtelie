
"use client"

import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { CardHeader, CardTitle, CardDescription } from "../ui/card"
import { ShoppingCart } from "lucide-react"
import { Button } from "../ui/button"
import { PurchaseFormDialog } from "./purchase-form-dialog"

interface PurchaseTableToolbarProps<TData> {
  table: Table<TData>
  onPurchaseCreated: () => void;
}

export function PurchaseTableToolbar<TData>({ table, onPurchaseCreated }: PurchaseTableToolbarProps<TData>) {
  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline">Histórico de Compras</CardTitle>
        <CardDescription>
          Registre e gerencie as compras de materiais do seu ateliê.
        </CardDescription>
      </CardHeader>
      <div className="flex items-center justify-between p-6 pt-0">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Filtrar por nome do material..."
            value={(table.getColumn("materialName")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("materialName")?.setFilterValue(event.target.value)
            }
            className="h-10 w-[150px] lg:w-[300px]"
          />
        </div>
        <PurchaseFormDialog
            onPurchaseCreated={onPurchaseCreated}
            trigger={
                <Button size="icon" className="md:w-auto md:px-4 flex-shrink-0">
                    <ShoppingCart className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Nova Compra</span>
                </Button>
            }
        />
      </div>
    </>
  )
}
