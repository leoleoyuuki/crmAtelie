
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
  paperWidth?: '58mm' | '80mm' | '110mm' | 'A4' | '1/2 A4' | '1/4 A4';
}

// Logo convertida para Data URI (Base64) para garantir renderização no html2canvas
const LOGO_DATA_URI = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTcuNyA3LjcgMiAyMiIgLz48cGF0aCBkPSJNMTcuNyAxNy43IDIyIDEybC00LTQtMyAzLTQtNC0zIDMtNC00LTQgNCA0IDRaIiAvPjxwYXRoIGQ9Im0xNCA2IDMgMyIgLz48cGF0aCBkPSJNMjIgMiAxMiAxMiIgLz48L3N2Zz4=";

export const OrderTicket = React.forwardRef<HTMLDivElement, OrderTicketProps>(
  ({ order, customer, ticketSettings, paperWidth }, ref) => {
    const formattedDate = (date: Date) => format(date, "dd/MM/yy HH:mm", { locale: ptBR });
    const formattedCurrency = (value: number) => formatCurrency(value);
    
    // Branding overrides
    const logo = ticketSettings?.logoUrl || LOGO_DATA_URI;
    const businessName = ticketSettings?.businessName || "AtelierFlow";
    const showLogo = ticketSettings?.showLogo !== false; // Default to true if not specified

    // Scaling logic
    const is80mm = paperWidth === '80mm';
    const is110mm = paperWidth === '110mm';
    const isA6 = paperWidth === '1/4 A4'; // ~105mm
    const isA5 = paperWidth === '1/2 A4'; // ~148mm
    const isA4 = paperWidth === 'A4';     // ~210mm
    
    // Font Scaling
    const baseFontSize = isA4 ? 'text-[18pt]' : isA5 ? 'text-[16pt]' : (isA6 || is110mm) ? 'text-[14pt]' : is80mm ? 'text-[12pt]' : 'text-[10pt]';
    const titleSize = isA4 ? 'text-[34pt]' : isA5 ? 'text-[28pt]' : (isA6 || is110mm) ? 'text-[24pt]' : is80mm ? 'text-[18pt]' : 'text-[14pt]';
    const sectionTitleSize = isA4 ? 'text-[22pt]' : isA5 ? 'text-[18pt]' : (isA6 || is110mm) ? 'text-[16pt]' : is80mm ? 'text-[14pt]' : 'text-[12pt]';
    const itemSize = isA4 ? 'text-[20pt]' : isA5 ? 'text-[18pt]' : (isA6 || is110mm) ? 'text-[15pt]' : is80mm ? 'text-[13pt]' : 'text-[11pt]';
    const smallSize = isA4 ? 'text-[14pt]' : isA5 ? 'text-[12pt]' : (isA6 || is110mm) ? 'text-[11pt]' : is80mm ? 'text-[10pt]' : 'text-[9pt]';
    
    // Dimension Scaling
    const logoSize = isA4 ? 120 : isA5 ? 100 : (isA6 || is110mm) ? 80 : is80mm ? 64 : 48;
    const containerWidth = isA4 ? 'w-[794px]' : isA5 ? 'w-[560px]' : isA6 ? 'w-[397px]' : is110mm ? 'w-[416px]' : is80mm ? 'w-[302px]' : 'w-[220px]';

    return (
      <div ref={ref} className={cn(
        "bg-white text-black font-mono p-2 leading-tight mx-auto transition-all duration-300",
        containerWidth,
        baseFontSize
      )}>
        <div className="text-center mb-2">
            {showLogo && <img src={logo} width={logoSize} height={logoSize} alt={`${businessName} Logo`} className="mx-auto" />}
            <h1 className={cn("font-bold mt-1", titleSize)}>{businessName}</h1>
            <p className={baseFontSize}>Comprovante de Pedido</p>
        </div>

        <div className={cn("border-t border-b border-dashed border-black my-2 py-1", baseFontSize)}>
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
            <h2 className={cn("font-bold uppercase border-b border-dashed border-black/50 pb-1 mb-1", sectionTitleSize)}>Cliente</h2>
            <p className={cn("font-bold", itemSize)}>{order.customerName}</p>
            {customer?.phone && <p className={itemSize}>{customer.phone}</p>}
        </div>

        {order.customData && Object.keys(order.customData).length > 0 && (
          <div className={cn("border-t border-dashed border-black py-1 mb-1", baseFontSize)}>
            {Object.entries(order.customData).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className={cn("uppercase font-bold", isA4 ? "text-[16pt]" : isA5 ? "text-[14pt]" : (isA6 || is110mm) ? "text-[12pt]" : is80mm ? "text-[10pt]" : "text-[8pt]")}>{key}:</span>
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
              <div key={index} className={cn("mb-2", itemSize)}>
                <div className="flex justify-between font-bold">
                    <span>{quantity > 1 ? `${quantity}x ` : ''}{item.serviceType}</span>
                    <span>{formattedCurrency(subtotal)}</span>
                </div>
                {quantity > 1 && (
                  <p className={cn("text-gray-600 ml-1 italic", smallSize)}>Vlr unit: {formattedCurrency(item.value)}</p>
                )}
                {item.description && <p className={cn("break-words ml-1", baseFontSize)}>- {item.description}</p>}
                {item.assignedTo && <p className={cn("break-words ml-1 italic opacity-70", baseFontSize)}>_Responsável: {item.assignedTo}_</p>}
              </div>
            );
          })}
        </div>

        <div className="border-t-2 border-double border-black pt-1 my-2">
            <div className={cn("flex justify-between font-bold", isA4 ? "text-[28pt]" : isA5 ? "text-[24pt]" : (isA6 || is110mm) ? "text-[20pt]" : is80mm ? "text-[16pt]" : "text-[14pt]")}>
                <span>TOTAL:</span>
                <span>{formattedCurrency(order.totalValue)}</span>
            </div>
        </div>

         <div className="mt-2 text-center bg-gray-50 p-1 border border-dashed border-black/10">
            <p className={cn("font-bold", itemSize)}>ENTREGA PREVISTA:</p>
            <p className={itemSize}>{format(order.dueDate, "PPP", { locale: ptBR })}</p>
        </div>

        <div className={cn("mt-4 text-center border-t border-dashed border-black pt-2", baseFontSize)}>
            <p className="italic">{ticketSettings?.footerText || "Obrigado pela preferência!"}</p>
        </div>
      </div>
    );
  }
);

OrderTicket.displayName = 'OrderTicket';
