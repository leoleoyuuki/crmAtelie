import { Sale } from "@/lib/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SalesListProps {
  data: Sale[];
  onNextPage?: () => void;
  onPrevPage?: () => void;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  loading?: boolean;
}

export function SalesList({
  data,
  onNextPage,
  onPrevPage,
  hasNextPage,
  hasPrevPage,
  loading
}: SalesListProps) {
  
  if (loading && data.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Carregando vendas...</div>;
  }
  
  if (!loading && data.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center p-12 bg-muted/20 border border-dashed rounded-xl">
              <TrendingUp className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-lg font-bold">Nenhuma Venda Direta Registrada</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm text-center">
                  Quando você registrar vendas de itens à pronta-entrega ou do catálogo, elas aparecerão aqui separadas das encomendas regulares.
              </p>
          </div>
      )
  }

  const parseDate = (dateVal: any) => {
    if (!dateVal) return new Date();
    if (Object.prototype.toString.call(dateVal) === '[object Date]') return dateVal;
    if (typeof dateVal.toDate === 'function') return dateVal.toDate();
    if (typeof dateVal === 'string') return new Date(dateVal);
    if (typeof dateVal === 'number') return new Date(dateVal);
    return new Date();
  };

  return (
    <div className="space-y-4">
      {/* ── DESKTOP TABLE VIEW ───────────────────────────────── */}
      <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold">Data</TableHead>
              <TableHead className="font-bold">Produto</TableHead>
              <TableHead className="font-bold">Cliente</TableHead>
              <TableHead className="font-bold text-right">Custo</TableHead>
              <TableHead className="font-bold text-right">Preço Final</TableHead>
              <TableHead className="font-bold text-right">Lucro Bruto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((sale) => {
              const dateObj = parseDate(sale.date);
              return (
                <TableRow key={sale.id} className="cursor-default hover:bg-muted/30">
                  <TableCell className="text-sm text-muted-foreground">
                      {format(dateObj, "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="font-medium">{sale.productName}</TableCell>
                  <TableCell className="text-muted-foreground">
                      {sale.customerName ? sale.customerName : <span className="opacity-50 italic">Avulso</span>}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(sale.cost)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-foreground">
                      {formatCurrency(sale.price)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600 dark:text-green-500">
                      {formatCurrency(sale.profit)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* ── MOBILE CARD VIEW ─────────────────────────────────── */}
      <div className="md:hidden space-y-4">
        {data.map((sale) => {
          const dateObj = parseDate(sale.date);
          return (
            <div key={sale.id} className="p-5 rounded-3xl border bg-card shadow-sm hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="min-w-0 flex-1">
                  <h4 className="text-xl font-black text-foreground leading-tight">{sale.productName}</h4>
                  <div className="flex items-center gap-2 mt-1.5 auto-wrap">
                    <span className="text-[11px] text-muted-foreground font-black uppercase tracking-widest bg-muted/50 px-2 py-0.5 rounded">
                      {format(dateObj, "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-bold truncate">
                      {sale.customerName || 'Venda Avulsa'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 pt-4 border-t border-muted/20">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Preço de Venda</span>
                  <p className="text-xl font-black text-foreground tracking-tighter">
                    {formatCurrency(sale.price)}
                  </p>
                </div>
                
                <div className="flex items-center justify-between bg-green-500/5 -mx-5 px-5 py-3 border-y border-green-500/10">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Lucro Real</span>
                  </div>
                  <span className="text-xl font-black text-green-600 dark:text-green-500 tracking-tighter">
                     {formatCurrency(sale.profit)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">
                  <span>Custo de Produção</span>
                  <span>{formatCurrency(sale.cost)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>


      {(hasPrevPage || hasNextPage) && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevPage}
            disabled={!hasPrevPage}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={!hasNextPage}
          >
            Próxima
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
