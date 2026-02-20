"use client"

import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { CustomerFormDialog } from "../dashboard/customer-form-dialog"
import { UserPlus, Search, Download, MessageSquare } from "lucide-react"
import { Button } from "../ui/button"

interface CustomerTableToolbarProps<TData> {
  table: Table<TData>
  onCustomerCreated: () => void;
}

export function CustomerTableToolbar<TData>({ table, onCustomerCreated }: CustomerTableToolbarProps<TData>) {
  return (
    <div className="space-y-6 p-6">
      {/* Search and Main Actions */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Pesquisar por nome ou e-mail..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="h-12 pl-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl"
            />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" className="h-12 rounded-xl flex-1 md:flex-none font-bold">
                <Download className="h-4 w-4 mr-2" />
                CSV
            </Button>
            <CustomerFormDialog
                onCustomerCreated={onCustomerCreated}
                onCustomerUpdated={onCustomerCreated}
                trigger={
                    <Button className="h-12 px-6 rounded-xl flex-1 md:flex-none font-bold shadow-lg shadow-primary/20">
                        <UserPlus className="h-4 w-4 md:mr-2" />
                        Cadastrar Cliente
                    </Button>
                }
            />
        </div>
      </div>

      {/* Filter Pills Style Patreon */}
      <div className="flex flex-wrap items-center gap-2">
        <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-primary text-primary-foreground border border-primary shadow-md">
            Todos os Contatos
        </button>
        <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-background text-muted-foreground hover:bg-muted border border-border transition-all">
            Com Pedidos Ativos
        </button>
        <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-background text-muted-foreground hover:bg-muted border border-border transition-all">
            Novos este mês
        </button>
        <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-background text-muted-foreground hover:bg-muted border border-border transition-all">
            Inativos
        </button>
      </div>
    </div>
  )
}
