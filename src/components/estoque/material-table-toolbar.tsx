"use client"

import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Search, Download, FileText, Table as TableIcon } from "lucide-react"
import { Button } from "../ui/button"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { exportToCSV, exportToPDF } from "@/lib/export-utils"
import { Material } from "@/lib/types"

interface MaterialTableToolbarProps<TData> {
  table: Table<TData>
}

export function MaterialTableToolbar<TData>({ table }: MaterialTableToolbarProps<TData>) {
  const handleExportCSV = () => {
    const rows = table.getFilteredRowModel().rows;
    const exportData = rows.map(row => {
      const m = row.original as Material;
      return {
        'Material': m.name,
        'Estoque': m.stock,
        'Unidade': m.unit,
        'Popularidade': m.usedInOrders || 0
      };
    });
    exportToCSV(exportData, 'inventario_materiais');
  };

  const handleExportPDF = () => {
    const rows = table.getFilteredRowModel().rows;
    const headers = ['Material', 'Estoque', 'Unidade', 'Popularidade'];
    const body = rows.map(row => {
        const m = row.original as Material;
        return [
            m.name,
            m.stock.toString(),
            m.unit,
            `${m.usedInOrders || 0} usos`
        ];
    });
    exportToPDF(headers, body, 'inventario_materiais', 'Relatório de Inventário');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Pesquisar material pelo nome..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
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
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-primary text-primary-foreground border border-primary shadow-md">
            Todos os Materiais
        </button>
        <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-background text-muted-foreground hover:bg-muted border border-border transition-all">
            Estoque Baixo
        </button>
        <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-background text-muted-foreground hover:bg-muted border border-border transition-all">
            Insumos
        </button>
        <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-background text-muted-foreground hover:bg-muted border border-border transition-all">
            Matéria-prima
        </button>
      </div>
    </div>
  )
}
