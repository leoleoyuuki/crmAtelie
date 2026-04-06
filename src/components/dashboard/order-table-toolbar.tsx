
"use client"

import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { OrderFormDialog } from "./order-form-dialog"
import { OrderStatus } from "@/lib/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getMonths } from "@/lib/data"
import { Button } from "../ui/button"
import { PlusCircle, Search, Download, Filter, FileText, Table as TableIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { exportToCSV, exportToPDF } from "@/lib/export-utils"
import { Order } from "@/lib/types"
import { format } from "date-fns"

interface OrderTableToolbarProps<TData> {
  table: Table<TData>
  onOrderCreated?: () => void
  isPage?: boolean;
  serviceTypes?: string[];
}

const statuses: OrderStatus[] = ['Novo', 'Em Processo', 'Aguardando Retirada', 'Concluído'];
const months = getMonths();

export function OrderTableToolbar<TData>({ 
    table, 
    onOrderCreated, 
    isPage = false,
    serviceTypes = []
}: OrderTableToolbarProps<TData>) {
  const currentStatusFilter = table.getColumn("status")?.getFilterValue() as string;

  const handleExportCSV = () => {
    const rows = table.getFilteredRowModel().rows;
    const exportData = rows.map(row => {
      const o = row.original as Order;
      const date = o.createdAt instanceof Date ? o.createdAt : (o.createdAt as any)?.toDate?.() || new Date(o.createdAt);
      return {
        'Cliente': o.customerName,
        'Serviços': (o.items || []).map(i => i.serviceType).join(', '),
        'Valor Total (R$)': o.totalValue,
        'Status': o.status,
        'Prazo': o.dueDate ? format(o.dueDate, 'dd/MM/yyyy') : '',
        'Criado em': format(date, 'dd/MM/yyyy HH:mm')
      };
    });
    exportToCSV(exportData, 'pedidos');
  };

  const handleExportPDF = () => {
    const rows = table.getFilteredRowModel().rows;
    const headers = ['Cliente', 'Serviços', 'Valor', 'Status', 'Prazo'];
    const body = rows.map(row => {
        const o = row.original as Order;
        return [
            o.customerName,
            (o.items || []).map(i => i.serviceType).join(', '),
            `R$ ${o.totalValue.toFixed(2)}`,
            o.status,
            o.dueDate ? format(o.dueDate, 'dd/MM/yy') : '---'
        ];
    });
    exportToPDF(headers, body, 'pedidos', 'Relatório de Pedidos');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Search and Main Actions */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Buscar por nome do cliente..."
                value={(table.getColumn("customerName")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                table.getColumn("customerName")?.setFilterValue(event.target.value)
                }
                className="h-12 pl-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl"
            />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12 rounded-xl flex-1 md:flex-none font-bold">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
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
            <OrderFormDialog
                onOrderCreated={onOrderCreated}
                trigger={
                    <Button className="h-12 px-6 rounded-xl flex-1 md:flex-none font-bold shadow-lg shadow-primary/20">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Novo Pedido
                    </Button>
                }
            />
        </div>
      </div>

      {/* Filter Pills Style Patreon */}
      <div className="flex flex-wrap items-center gap-2">
        <button
            onClick={() => table.getColumn("status")?.setFilterValue(undefined)}
            className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                !currentStatusFilter 
                    ? "bg-primary text-primary-foreground border-primary shadow-md" 
                    : "bg-background text-muted-foreground hover:bg-muted border-border"
            )}
        >
            Todos os Pedidos
        </button>
        {statuses.map(status => (
            <button
                key={status}
                onClick={() => table.getColumn("status")?.setFilterValue(status)}
                className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                    currentStatusFilter === status
                        ? "bg-primary text-primary-foreground border-primary shadow-md" 
                        : "bg-background text-muted-foreground hover:bg-muted border-border"
                )}
            >
                {status}
            </button>
        ))}
        
        <div className="h-4 w-px bg-border mx-2 hidden md:block" />

        {/* Dropdown Filters for Secondary fields */}
        <Select
            value={(table.getColumn("createdAt")?.getFilterValue() as string) ?? "all"}
            onValueChange={(value) => {
                table.getColumn("createdAt")?.setFilterValue(value === "all" ? undefined : value)
            }}
        >
            <SelectTrigger className="h-8 w-auto min-w-[120px] rounded-full border-dashed bg-muted/20 text-[10px] font-bold uppercase tracking-wider">
                <Filter className="h-3 w-3 mr-2" />
                <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Qualquer Mês</SelectItem>
                {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                ))}
            </SelectContent>
        </Select>

        <Select
            value={(table.getColumn("items")?.getFilterValue() as string) ?? "all"}
            onValueChange={(value) => {
              table.getColumn("items")?.setFilterValue(value === "all" ? undefined : value)
            }}
        >
            <SelectTrigger className="h-8 w-auto min-w-[120px] rounded-full border-dashed bg-muted/20 text-[10px] font-bold uppercase tracking-wider">
                <Filter className="h-3 w-3 mr-2" />
                <SelectValue placeholder="Serviço" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todos Serviços</SelectItem>
                {serviceTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
            </SelectContent>
        </Select>

        {currentStatusFilter && (
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => table.resetColumnFilters()}
                className="text-[10px] font-bold text-muted-foreground uppercase h-8"
            >
                Limpar Filtros
            </Button>
        )}
      </div>
    </div>
  )
}
