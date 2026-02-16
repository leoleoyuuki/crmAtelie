
"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Order, Customer } from '@/lib/types';
import { getOrderById, getCustomerById } from '@/lib/data';
import { OrderTicket } from '@/components/dashboard/order-ticket';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Printer, Share2, ArrowLeft, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';

export default function PrintPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

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
            setError('Pedido não encontrado ou sem permissão.');
          }
        } catch (e) {
          console.error(e);
          setError('Erro ao carregar detalhes do pedido.');
        } finally {
          setLoading(false);
        }
      };
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleCopyAsImage = async () => {
    if (!ticketRef.current) return;
    
    setIsGeneratingImage(true);
    try {
      // Delay para garantir renderização completa antes do canvas
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error("Falha ao gerar imagem.");
        
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            const item = new ClipboardItem({ "image/png": blob });
            await navigator.clipboard.write([item]);
            toast({
                title: "Imagem Copiada!",
                description: "Agora é só colar no WhatsApp do cliente.",
            });
          } else {
            throw new Error("Clipboard API indesejável.");
          }
        } catch (err) {
          const dataUrl = canvas.toDataURL("image/png");
          const link = document.createElement('a');
          link.download = `comprovante-${orderId.substring(0, 5)}.png`;
          link.href = dataUrl;
          link.click();
          toast({
            title: "Download Iniciado",
            description: "Não conseguimos copiar automaticamente, então baixamos a imagem.",
          });
        }
      }, "image/png");
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Erro ao gerar imagem",
        description: "Tente novamente em alguns instantes.",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col gap-4 justify-center items-center h-screen bg-red-50 text-red-700 p-4 text-center">
            <p className="font-bold">{error}</p>
            <Button onClick={() => router.back()} variant="outline">Voltar</Button>
        </div>
    );
  }

  if (!order) return null;

  return (
    <>
      <style jsx global>{`
        @media print {
          body, html {
            margin: 0;
            padding: 0;
            background: white !important;
          }
          .no-print {
            display: none !important;
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
          }
        }
        @page {
          size: 58mm auto;
          margin: 0;
        }
      `}</style>
      <main className="bg-gray-100 min-h-screen flex flex-col items-center justify-start py-8 px-4">
        <div className="no-print w-full max-w-[220px] mb-6 space-y-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground w-full justify-start"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <div className="p-4 bg-white rounded-xl shadow-sm border space-y-3">
            <Button className="w-full shadow-md" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir (Papel)
            </Button>
            <Button 
                variant="secondary" 
                className="w-full shadow-sm" 
                onClick={handleCopyAsImage}
                disabled={isGeneratingImage}
            >
                {isGeneratingImage ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Share2 className="mr-2 h-4 w-4" />
                )}
                {isGeneratingImage ? "Gerando..." : "Copiar p/ WhatsApp"}
            </Button>
          </div>
        </div>

        <div id="printable-area" className="bg-white shadow-2xl rounded-sm">
          <OrderTicket ref={ticketRef} order={order} customer={customer} />
        </div>
        
        <p className="no-print mt-8 text-[10px] text-muted-foreground text-center max-w-[200px]">
            Dica: Ao copiar para o WhatsApp, a imagem mantém a logo e formatação profissional.
        </p>
      </main>
    </>
  );
}
