
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

  const handleCopyAsImage = async () => {
    if (!ticketRef.current) return;
    
    setIsGeneratingImage(true);
    try {
      // Pequeno delay para garantir que todos os recursos (como a logo) estejam prontos
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(ticketRef.current, {
        scale: 3, // Alta qualidade
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: 220, // Aproximadamente 58mm em pixels
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
            throw new Error("Failed to generate image blob");
        }
        
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            const item = new ClipboardItem({ "image/png": blob });
            await navigator.clipboard.write([item]);
            toast({
                title: "Copiado para o WhatsApp!",
                description: "Imagem copiada. Agora abra o WhatsApp do cliente e cole (Ctrl+V ou Pressionar e Colar).",
            });
          } else {
            throw new Error("Clipboard API not available");
          }
        } catch (err) {
          // Fallback: Download da imagem
          const dataUrl = canvas.toDataURL("image/png");
          const link = document.createElement('a');
          link.download = `comprovante-${order?.customerName.split(' ')[0]}-${orderId.substring(0, 5)}.png`;
          link.href = dataUrl;
          link.click();
          toast({
            title: "Download Iniciado",
            description: "Seu navegador não permitiu a cópia automática. Baixamos a imagem para você enviar.",
          });
        }
      }, "image/png");
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Erro ao gerar imagem",
        description: "Não foi possível converter o comprovante em imagem.",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

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
            width: 48mm;
            height: auto;
          }
        }
        @page {
          size: 58mm;
          height: auto;
          margin: 5mm;
        }
      `}</style>
      <main className="bg-gray-100 min-h-screen flex flex-col items-center justify-start py-8 px-4">
        <div className="no-print w-full max-w-[58mm] mb-6 space-y-3">
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
            <p className="text-xs text-center text-muted-foreground font-medium">
              Ações de Comprovante
            </p>
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
                {isGeneratingImage ? "Gerando..." : "Copiar para WhatsApp"}
            </Button>
          </div>
        </div>

        <div id="printable-area" className="bg-white shadow-2xl rounded-sm">
          <OrderTicket ref={ticketRef} order={order} customer={customer} />
        </div>
        
        <p className="no-print mt-8 text-[10px] text-muted-foreground text-center max-w-[200px]">
            Dica: Ao copiar para o WhatsApp, a imagem mantém a formatação profissional do seu ateliê.
        </p>
      </main>
    </>
  );
}
