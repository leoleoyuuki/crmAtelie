
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Order, Customer } from '@/lib/types';
import { getOrderById, getCustomerById } from '@/lib/data';
import { OrderTicket } from '@/components/dashboard/order-ticket';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export default function PrintPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      const fetchOrderDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const fetchedOrder = await getOrderById(orderId);
          if (fetchedOrder) {
            setOrder(fetchedOrder);
            const fetchedCustomer = await getCustomerById(fetchedOrder.customerId);
            setCustomer(fetchedCustomer);
          } else {
            setError('Pedido não encontrado ou você não tem permissão para visualizá-lo.');
          }
        } catch (e) {
          console.error(e);
          setError('Ocorreu um erro ao buscar os detalhes do pedido.');
        } finally {
          setLoading(false);
        }
      };
      fetchOrderDetails();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="p-10 bg-white shadow-md w-[58mm]">
          <Skeleton className="h-6 w-6 mx-auto mb-2" />
          <Skeleton className="h-4 w-32 mx-auto mb-2" />
          <Skeleton className="h-3 w-24 mx-auto mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }


  if (error) {
    return <div className="flex justify-center items-center h-screen bg-red-100 text-red-700">{error}</div>;
  }

  if (!order) {
    return null;
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
            width: 48mm; /* Força a largura exata na impressão */
            height: 85mm;
          }
        }
        @page {
          size: 58mm;
          height: 85mm;
          margin: 5mm;
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
        <div id="printable-area" className="bg-white shadow-lg">
          <OrderTicket order={order} customer={customer} />
        </div>
      </main>
    </>
  );
}
