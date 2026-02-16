
'use client';
import React from 'react';
import { Order, Customer } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrderTicketProps {
  order: Order;
  customer: Customer | null;
}

// Logo convertida para Data URI (Base64) para garantir renderização no html2canvas
const LOGO_DATA_URI = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTcuNyA3LjcgMiAyMiIgLz48cGF0aCBkPSJNMTcuNyAxNy43IDIyIDEybC00LTQtMyAzLTQtNC0zIDMtNC00LTQgNCA0IDRaIiAvPjxwYXRoIGQ9Im0xNCA2IDMgMyIgLz48cGF0aCBkPSJNMjIgMiAxMiAxMiIgLz48L3N2Zz4=";

export const OrderTicket = React.forwardRef<HTMLDivElement, OrderTicketProps>(
  ({ order, customer }, ref) => {
    const formattedDate = (date: Date) => format(date, "dd/MM/yy HH:mm", { locale: ptBR });
    const formattedCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    
    return (
      <div ref={ref} className="bg-white text-black font-mono w-[220px] p-2 text-[10pt] leading-tight mx-auto">
        <div className="text-center mb-2">
            <img src={LOGO_DATA_URI} width={48} height={48} alt="AtelierFlow Logo" className="mx-auto" />
            <h1 className="text-[14pt] font-bold mt-1">AtelierFlow</h1>
            <p className="text-[10pt]">Comprovante de Pedido</p>
        </div>

        <div className="border-t border-b border-dashed border-black my-2 py-1 text-[10pt]">
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
            <h2 className="font-bold text-[12pt] uppercase border-b border-dashed border-black/20 pb-1 mb-1">Cliente</h2>
            <p className="text-[11pt] font-bold">{order.customerName}</p>
            {customer?.phone && <p className="text-[11pt]">{customer.phone}</p>}
        </div>

        <div className="border-t border-dashed border-black pt-1 my-1">
          {order.items && order.items.map((item, index) => {
            const quantity = item.quantity || 1;
            const subtotal = item.value * quantity;
            
            return (
              <div key={index} className="mb-2 text-[11pt]">
                <div className="flex justify-between font-bold">
                    <span>{quantity > 1 ? `${quantity}x ` : ''}{item.serviceType}</span>
                    <span>{formattedCurrency(subtotal)}</span>
                </div>
                {quantity > 1 && (
                  <p className="text-[9pt] text-gray-600 ml-1 italic">Vlr unit: {formattedCurrency(item.value)}</p>
                )}
                {item.description && <p className="text-[10pt] break-words ml-1">- {item.description}</p>}
                {item.assignedTo && <p className="text-[10pt] break-words ml-1 italic opacity-70">_Responsável: {item.assignedTo}_</p>}
              </div>
            );
          })}
        </div>

        <div className="border-t-2 border-double border-black pt-1 my-2">
            <div className="flex justify-between font-bold text-[14pt]">
                <span>TOTAL:</span>
                <span>{formattedCurrency(order.totalValue)}</span>
            </div>
        </div>

         <div className="mt-2 text-center bg-gray-50 p-1 border border-dashed border-black/10">
            <p className="font-bold text-[11pt]">ENTREGA PREVISTA:</p>
            <p className="text-[11pt]">{format(order.dueDate, "PPP", { locale: ptBR })}</p>
        </div>

        <div className="mt-4 text-center text-[10pt] border-t border-dashed border-black pt-2">
            <p className="italic">Obrigado pela preferência!</p>
        </div>
      </div>
    );
  }
);

OrderTicket.displayName = 'OrderTicket';
