
import React from 'react';
import { Order, Customer } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Logo from '../icons/logo';

interface OrderTicketProps {
  order: Order;
  customer: Customer | null;
}

export const OrderTicket = React.forwardRef<HTMLDivElement, OrderTicketProps>(
  ({ order, customer }, ref) => {
    const formattedDate = (date: Date) => format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    const formattedCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

    const styles = `
      @media print {
        @page {
          size: 58mm;
          margin: 0;
        }
        body {
          width: 48mm;
          margin: 5mm;
          font-family: 'monospace', sans-serif;
          font-size: 8pt;
          color: #000;
          background-color: #fff;
        }
        .ticket-container {
          width: 48mm;
          padding: 0;
          margin: 0;
        }
      }
    `;

    return (
      <div ref={ref} className="ticket-container p-4 font-mono text-xs text-black bg-white">
        <style>{styles}</style>
        <div className="text-center">
            <Logo className="h-10 w-10 mx-auto" />
            <h1 className="text-sm font-bold mt-2">AtelierFlow</h1>
            <p className="text-[10px]">Comprovante de Pedido</p>
        </div>

        <div className="border-t border-b border-dashed border-black my-2 py-1">
          <div className="flex justify-between">
            <span>Pedido:</span>
            <span>#{order.id.substring(0, 7)}</span>
          </div>
          <div className="flex justify-between">
            <span>Data:</span>
            <span>{formattedDate(order.createdAt)}</span>
          </div>
        </div>

        <div className="mb-2">
            <h2 className="font-bold text-center">CLIENTE</h2>
            <p>{order.customerName}</p>
            {customer?.phone && <p>{customer.phone}</p>}
        </div>

        <div className="mb-2">
            <h2 className="font-bold text-center">SERVIÇO</h2>
            <p><strong>Tipo:</strong> {order.serviceType}</p>
            {order.description && <p className="text-wrap"><strong>Detalhes:</strong> {order.description}</p>}
        </div>

        <div className="border-t border-dashed border-black pt-1">
            <div className="flex justify-between font-bold text-sm">
                <span>TOTAL:</span>
                <span>{formattedCurrency(order.totalValue)}</span>
            </div>
        </div>

         <div className="mt-2 text-center">
            <p className="font-bold">ENTREGA PREVISTA:</p>
            <p>{format(order.dueDate, "PPP", { locale: ptBR })}</p>
        </div>

        <div className="mt-4 text-center text-[10px] border-t border-dashed border-black pt-2">
            <p>Obrigado pela sua preferência!</p>
            <p>AtelierFlow</p>
        </div>
      </div>
    );
  }
);

OrderTicket.displayName = 'OrderTicket';
