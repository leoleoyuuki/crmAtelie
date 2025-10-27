
'use client';
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
    const formattedDate = (date: Date) => format(date, "dd/MM/yy HH:mm", { locale: ptBR });
    const formattedCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    
    return (
      <div ref={ref} className="bg-white text-black font-mono w-[58mm] p-2 text-[10pt] leading-tight">
        <div className="text-center mb-2">
            <Logo className="h-8 w-8 mx-auto" />
            <h1 className="text-[12pt] font-bold mt-1">AtelierFlow</h1>
            <p className="text-[9pt]">Comprovante de Pedido</p>
        </div>

        <div className="border-t border-b border-dashed border-black my-2 py-1 text-[9pt]">
          <div className="flex justify-between">
            <span>Pedido:</span>
            <span>#{order.id.substring(0, 7).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span>Data:</span>
            <span>{formattedDate(order.createdAt)}</span>
          </div>
        </div>

        <div className="mb-2 text-center">
            <h2 className="font-bold text-[11pt] uppercase">Cliente</h2>
            <p className="text-[10pt]">{order.customerName}</p>
            {customer?.phone && <p className="text-[10pt]">{customer.phone}</p>}
        </div>

        <div className="border-t border-dashed border-black pt-1 my-1">
          {order.items.map((item, index) => (
            <div key={index} className="mb-2 text-[10pt]">
              <div className="flex justify-between font-bold">
                  <span>{item.serviceType}</span>
                  <span>{formattedCurrency(item.value)}</span>
              </div>
              {item.description && <p className="text-[9pt] break-words ml-1">- {item.description}</p>}
              {item.assignedTo && <p className="text-[9pt] break-words ml-1">_Resp: {item.assignedTo}_</p>}
            </div>
          ))}
        </div>

        <div className="border-t-2 border-double border-black pt-1 my-2">
            <div className="flex justify-between font-bold text-[12pt]">
                <span>TOTAL:</span>
                <span>{formattedCurrency(order.totalValue)}</span>
            </div>
        </div>

         <div className="mt-2 text-center">
            <p className="font-bold text-[11pt]">ENTREGA PREVISTA:</p>
            <p className="text-[10pt]">{format(order.dueDate, "PPP", { locale: ptBR })}</p>
        </div>

        <div className="mt-3 text-center text-[9pt] border-t border-dashed border-black pt-2">
            <p>Obrigado pela sua preferência!</p>
            <p>AtelierFlow</p>
        </div>
      </div>
    );
  }
);

OrderTicket.displayName = 'OrderTicket';
