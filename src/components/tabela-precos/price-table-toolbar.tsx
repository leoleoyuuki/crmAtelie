"use client"

import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { PriceTableItem } from "@/lib/types"
import { PriceFormDialog } from "./price-form-dialog"
import { PlusCircle, Search, Download, FileText, Table as TableIcon } from "lucide-react"
import { Button } from "../ui/button"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { exportToCSV, exportToPDF } from "@/lib/export-utils"

interface PriceTableToolbarProps<TData> {
  table: Table<TData>
  onItemCreated: (item: PriceTableItem) => void
}

export function PriceTableToolbar<TData>({ table, onItemCreated }: PriceTableToolbarProps<TData>) {
  const handleExportCSV = () => {
    const rows = table.getFilteredRowModel().rows;
    const exportData = rows.map(row => {
      const p = row.original as PriceTableItem;
      return {
        'Serviço': p.serviceName,
        'Descrição': p.description || '',
        'Preço (R$)': p.price
      };
    });
    exportToCSV(exportData, 'tabela_precos');
  };

  const handleExportPDF = () => {
    const rows = table.getFilteredRowModel().rows;
    const headers = ['Serviço', 'Descrição', 'Preço'];
    const body = rows.map(row => {
        const p = row.original as PriceTableItem;
        return [
            p.serviceName,
            p.description || '',
            `R$ ${p.price.toFixed(2)}`
        ];
    });
    exportToPDF(headers, body, 'tabela_precos', 'Tabela de Preços e Serviços');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Search and Main Actions */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Pesquisar serviço..."
                value={(table.getColumn("serviceName")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                table.getColumn("serviceName")?.setFilterValue(event.target.value)
                }
                className="h-12 pl-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl"
            />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12 rounded-xl flex-1 md:flex-none font-bold">
                        <Download className="h-4 w-4 mr-2" />
                        Relatório
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px] rounded-xl p-2">
                    <DropdownMenuItem onClick={handleExportCSV} className="rounded-lg font-medium cursor-pointer">
                        <TableIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                        Exportar CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportPDF} className="rounded-lg font-medium cursor-pointer">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        Exportar PDF
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <PriceFormDialog
                onItemCreated={onItemCreated}
                onItemUpdated={() => {}} // This will be handled by the shell
                trigger={
                    <Button className="h-12 px-6 rounded-xl flex-1 md:flex-none font-bold shadow-lg shadow-primary/20">
                        <PlusCircle className="h-4 w-4 md:mr-2" />
                        Novo Serviço
                    </Button>
                }
            />
        </div>
      </div>

      {/* Filter Pills Style Patreon */}
      <div className="flex flex-wrap items-center gap-2">
        <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-primary text-primary-foreground border border-primary shadow-md">
            Todos os Serviços
        </button>
        <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-background text-muted-foreground hover:bg-muted border border-border transition-all">
            Serviços Padrão
        </button>
        <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-background text-muted-foreground hover:bg-muted border border-border transition-all">
            Reparos e Ajustes
        </button>
        <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-background text-muted-foreground hover:bg-muted border border-border transition-all">
            Projetos Especiais
        </button>
      </div>
    </div>
  )
}
