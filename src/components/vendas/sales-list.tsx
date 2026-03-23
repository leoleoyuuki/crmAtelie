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
      <div className="rounded-xl border bg-card overflow-hidden">
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
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.cost)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-foreground">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.price)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600 dark:text-green-500">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.profit)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
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
