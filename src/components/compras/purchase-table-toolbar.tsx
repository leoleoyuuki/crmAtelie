"use client"

import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Search, Download, FileText, Table as TableIcon } from "lucide-react"
import { Button } from "../ui/button"
import { PurchaseFormDialog } from "./purchase-form-dialog"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { exportToCSV, exportToPDF } from "@/lib/export-utils"
import { Purchase } from "@/lib/types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface PurchaseTableToolbarProps<TData> {
  table: Table<TData>
  onPurchaseCreated: () => void;
}

export function PurchaseTableToolbar<TData>({ table, onPurchaseCreated }: PurchaseTableToolbarProps<TData>) {
  const handleExportCSV = () => {
    const rows = table.getFilteredRowModel().rows;
    const exportData = rows.map(row => {
      const p = row.original as Purchase;
      const date = p.createdAt instanceof Date ? p.createdAt : (p.createdAt as any)?.toDate?.() || new Date(p.createdAt);
      return {
        'Material': p.materialName,
        'Quantidade': p.quantity,
        'Unidade': p.unit,
        'Custo Total (R$)': p.cost,
        'Categoria': p.category,
        'Data': format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR })
      };
    });
    exportToCSV(exportData, 'registro_compras');
  };

  const handleExportPDF = () => {
    const rows = table.getFilteredRowModel().rows;
    const headers = ['Material', 'Qtd', 'Unidade', 'Custo Total', 'Categoria', 'Data'];
    const body = rows.map(row => {
        const p = row.original as Purchase;
        const date = p.createdAt instanceof Date ? p.createdAt : (p.createdAt as any)?.toDate?.() || new Date(p.createdAt);
        return [
            p.materialName,
            p.quantity.toString(),
            p.unit,
            `R$ ${p.cost.toFixed(2)}`,
            p.category,
            format(date, 'dd/MM/yyyy', { locale: ptBR })
        ];
    });
    exportToPDF(headers, body, 'registro_compras', 'Relatório de Compras');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Filtrar compras pelo nome do material..."
                value={(table.getColumn("materialName")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                table.getColumn("materialName")?.setFilterValue(event.target.value)
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
            <PurchaseFormDialog
                onPurchaseCreated={onPurchaseCreated}
                trigger={
                    <Button className="h-12 px-6 rounded-xl flex-1 md:flex-none font-bold shadow-lg shadow-primary/20">
                        <ShoppingCart className="h-4 w-4 md:mr-2" />
                        Registrar Compra
                    </Button>
                }
            />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-primary text-primary-foreground border border-primary shadow-md">
            Todas as Compras
        </button>
        <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-background text-muted-foreground hover:bg-muted border border-border transition-all">
            Este Mês
        </button>
        <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-background text-muted-foreground hover:bg-muted border border-border transition-all">
            Matéria-prima
        </button>
        <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-background text-muted-foreground hover:bg-muted border border-border transition-all">
            Equipamentos
        </button>
      </div>
    </div>
  )
}
