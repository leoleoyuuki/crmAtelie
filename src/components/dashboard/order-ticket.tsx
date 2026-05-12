
'use client';
import React from 'react';
import { Order, Customer, TicketSettings } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn, formatCurrency } from '@/lib/utils';

interface OrderTicketProps {
  order: Order;
  customer: Customer | null;
  ticketSettings?: TicketSettings;
}

// Logo convertida para Data URI (Base64) para garantir renderização no html2canvas
const LOGO_DATA_URI = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTcuNyA3LjcgMiAyMiIgLz48cGF0aCBkPSJNMTcuNyAxNy43IDIyIDEybC00LTQtMyAzLTQtNC0zIDMtNC00LTQgNCA0IDRaIiAvPjxwYXRoIGQ9Im0xNCA2IDMgMyIgLz48cGF0aCBkPSJNMjIgMiAxMiAxMiIgLz48L3N2Zz4=";

export const OrderTicket = React.forwardRef<HTMLDivElement, OrderTicketProps>(
  ({ order, customer, ticketSettings }, ref) => {
    const formattedDate = (date: Date) => format(date, "dd/MM/yy HH:mm", { locale: ptBR });
    const formattedCurrency = (value: number) => formatCurrency(value);
    
    // Branding overrides
    const logo = ticketSettings?.logoUrl || LOGO_DATA_URI;
    const businessName = ticketSettings?.businessName || "AtelierFlow";
    const showLogo = ticketSettings?.showLogo !== false; // Default to true if not specified

    return (
      <div ref={ref} className="bg-white text-black font-mono w-[220px] p-2 text-[10pt] leading-tight mx-auto">
        <div className="text-center mb-2">
            {showLogo && <img src={logo} width={48} height={48} alt={`${businessName} Logo`} className="mx-auto" />}
            <h1 className="text-[14pt] font-bold mt-1">{businessName}</h1>
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
          {/* Custom Fields */}
          {ticketSettings?.customFields && ticketSettings.customFields.map((field, idx) => (
            <div key={idx} className="flex justify-between">
              <span>{field.label}:</span>
              <span>{field.value}</span>
            </div>
          ))}
        </div>

        <div className="mb-2 text-center">
            <h2 className="font-bold text-[12pt] uppercase border-b border-dashed border-black/20 pb-1 mb-1">Cliente</h2>
            <p className="text-[11pt] font-bold">{order.customerName}</p>
            {customer?.phone && <p className="text-[11pt]">{customer.phone}</p>}
        </div>

        {order.customData && Object.keys(order.customData).length > 0 && (
          <div className="border-t border-dashed border-black py-1 mb-1 text-[10pt]">
            {Object.entries(order.customData).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="uppercase text-[8pt] opacity-70">{key}:</span>
                <span className="font-bold">{value}</span>
              </div>
            ))}
          </div>
        )}

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
            <p className="italic">{ticketSettings?.footerText || "Obrigado pela preferência!"}</p>
        </div>
      </div>
    );
  }
);

OrderTicket.displayName = 'OrderTicket';
