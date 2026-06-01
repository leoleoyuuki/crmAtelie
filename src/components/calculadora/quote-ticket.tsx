'use client';
import React from 'react';
import { TicketSettings } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn, formatCurrency } from '@/lib/utils';

interface QuoteTicketProps {
  name: string;
  description?: string;
  materials?: Array<{ name: string; quantity: number }>;
  finalPrice: number;
  ticketSettings?: TicketSettings;
  paperWidth?: '58mm' | '80mm' | '110mm' | 'A4' | '1/2 A4' | '1/4 A4';
}

const LOGO_DATA_URI = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTcuNyA3LjcgMiAyMiIgLz48cGF0aCBkPSJNMTcuNyAxNy43IDIyIDEybC00LTQtMyAzLTQtNC0zIDMtNC00LTQgNCA0IDRaIiAvPjxwYXRoIGQ9Im0xNCA2IDMgMyIgLz48cGF0aCBkPSJNMjIgMiAxMiAxMiIgLz48L3N2Zz4=";

export const QuoteTicket = React.forwardRef<HTMLDivElement, QuoteTicketProps>(
  ({ name, description, materials, finalPrice, ticketSettings, paperWidth = '58mm' }, ref) => {
    const formattedDate = (date: Date) => format(date, "dd/MM/yy HH:mm", { locale: ptBR });
    const formattedCurrency = (value: number) => formatCurrency(value);
    
    // Branding overrides
    const logo = ticketSettings?.logoUrl || LOGO_DATA_URI;
    const businessName = ticketSettings?.businessName || "AtelierFlow";
    const showLogo = ticketSettings?.showLogo !== false;

    // Scaling logic
    const is80mm = paperWidth === '80mm';
    const is110mm = paperWidth === '110mm';
    const isA6 = paperWidth === '1/4 A4';
    const isA5 = paperWidth === '1/2 A4';
    const isA4 = paperWidth === 'A4';
    
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
        "bg-white text-black font-mono p-4 leading-tight mx-auto transition-all duration-300",
        containerWidth,
        baseFontSize
      )}>
        <div className="text-center mb-2">
            {showLogo && <img src={logo} width={logoSize} height={logoSize} alt={`${businessName} Logo`} className="mx-auto" />}
            <h1 className={cn("font-bold mt-1", titleSize)}>{businessName}</h1>
            <p className={baseFontSize}>Orçamento de Serviço</p>
        </div>

        <div className={cn("border-t border-b border-dashed border-black my-2 py-1", baseFontSize)}>
          <div className="flex justify-between">
            <span>Data:</span>
            <span>{formattedDate(new Date())}</span>
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
            <h2 className={cn("font-bold uppercase border-b border-dashed border-black/50 pb-1 mb-1", sectionTitleSize)}>Produto / Serviço</h2>
            <p className={cn("font-bold", itemSize)}>{name || "Serviço sem nome"}</p>
            {description && <p className={cn("break-words text-gray-700 italic mt-1", smallSize)}>{description}</p>}
        </div>

        {materials && materials.length > 0 && (
          <div className="border-t border-dashed border-black pt-1 my-1">
            <h3 className={cn("font-bold uppercase mb-1 text-center", smallSize)}>Materiais Inclusos</h3>
            {materials.map((mat, index) => {
              const qty = Number(mat.quantity) || 1;
              if (!mat.name) return null;
              return (
                <div key={index} className={cn("flex justify-between", itemSize)}>
                  <span>• {mat.name}</span>
                  <span className="font-bold">Qtd: {qty}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="border-t-2 border-double border-black pt-1 my-2">
            <div className={cn("flex justify-between font-bold", isA4 ? "text-[28pt]" : isA5 ? "text-[24pt]" : (isA6 || is110mm) ? "text-[20pt]" : is80mm ? "text-[16pt]" : "text-[14pt]")}>
                <span>VALOR TOTAL:</span>
                <span>{formattedCurrency(finalPrice)}</span>
            </div>
        </div>

        <div className={cn("mt-4 text-center border-t border-dashed border-black pt-2", baseFontSize)}>
            <p className="italic">{ticketSettings?.footerText || "Orçamento válido por 15 dias."}</p>
        </div>
      </div>
    );
  }
);

QuoteTicket.displayName = 'QuoteTicket';
