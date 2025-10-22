
'use client';

import { Order, Customer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { OrderTicket } from '@/components/dashboard/order-ticket';

interface PrintTicketClientProps {
  order: Order;
  customer: Customer | null;
}

export default function PrintTicketClient({ order, customer }: PrintTicketClientProps) {

  if (!order) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="p-10 bg-white shadow-md text-red-600">
          Pedido não encontrado ou você não tem permissão para visualizá-lo.
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body, html {
            margin: 0;
            padding: 0;
            background: white;
          }
          .no-print {
            display: none;
          }
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 58mm;
            height: auto;
          }
        }
        @page {
          size: 58mm auto;
          margin: 0mm;
        }
      `}</style>
      <main className="bg-gray-100 flex flex-col items-center justify-start py-8">
        <div className="no-print mb-4 p-4 bg-white rounded-lg shadow-md flex flex-col items-center gap-2">
          <p className="text-sm text-center text-gray-600">
            Pré-visualização da impressão. Use o botão abaixo ou Ctrl/Cmd+P para imprimir.
          </p>
          <Button onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir Comprovante
          </Button>
        </div>
        <div id="printable-area" className="bg-white shadow-lg w-[58mm]">
            <OrderTicket order={order} customer={customer} />
        </div>
      </main>
    </>
  );
}
