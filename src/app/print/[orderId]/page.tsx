"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Order, Customer, TicketSettings } from '@/lib/types';
import { getOrderById, getCustomerById, getUserProfile } from '@/lib/data';
import { OrderTicket } from '@/components/dashboard/order-ticket';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Printer, Share2, ArrowLeft, Loader2, Info, HelpCircle, ChevronRight, Download, MessageCircle, Phone, Ticket, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PrintPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [ticketSettings, setTicketSettings] = useState<TicketSettings | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm' | '110mm' | 'A4' | '1/2 A4' | '1/4 A4'>('58mm');
  const [hasLoadedPreference, setHasLoadedPreference] = useState(false);
  
  // Persistência da preferência de largura do papel
  useEffect(() => {
    const savedWidth = localStorage.getItem('crmAtelie-preferredPaperWidth');
    if (savedWidth) {
      setPaperWidth(savedWidth as any);
    }
    setHasLoadedPreference(true);
  }, []);

  useEffect(() => {
    if (hasLoadedPreference) {
      localStorage.setItem('crmAtelie-preferredPaperWidth', paperWidth);
    }
  }, [paperWidth, hasLoadedPreference]);

  const [showGuide, setShowGuide] = useState(false);
  const [showWhatsAppConfirm, setShowWhatsAppConfirm] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [isSavingPhone, setIsSavingPhone] = useState(false);
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

            // Fetch User Profile for ticket personalization
            const userProfile = await getUserProfile(fetchedOrder.userId);
            if (userProfile?.ticketSettings) {
                setTicketSettings(userProfile.ticketSettings);
            }
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

  // Escuta os eventos de impressão para fazer a clonagem perfeita do ticket (isolando-o de toda a tela)
  useEffect(() => {
    let tempContainer: HTMLDivElement | null = null;
    let style: HTMLStyleElement | null = null;

    const handleBeforePrint = () => {
      const printableArea = document.getElementById('printable-area');
      if (!printableArea) return;

      style = document.createElement('style');
      style.innerHTML = `
        @media print {
          @page {
            size: portrait;
            margin: 0;
          }
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            width: ${paperWidth} !important;
            height: auto !important;
            overflow: visible !important;
          }
          .no-print, body > *:not(#print-order-root-temp) {
            display: none !important;
          }
          #print-order-root-temp {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            visibility: visible !important;
          }
          #print-order-root-temp * {
            visibility: visible !important;
          }
        }
      `;
      
      tempContainer = document.createElement('div');
      tempContainer.id = 'print-order-root-temp';
      tempContainer.innerHTML = printableArea.innerHTML;
      document.body.appendChild(tempContainer);
      document.head.appendChild(style);
    };

    const handleAfterPrint = () => {
      if (tempContainer && document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
      if (style && document.head.contains(style)) {
        document.head.removeChild(style);
      }
      tempContainer = null;
      style = null;
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      if (tempContainer && document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
      if (style && document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [paperWidth]);

  const handlePrint = () => {
    try {
      // Força o método de execução direta do Safari
      document.execCommand('print', false, undefined);
    } catch (e) {
      // Caso falhe, usa o padrão (Chrome / Android / Firefox)
      window.print();
    }
  };

  const handleWhatsAppShare = async (forcePhone?: string) => {
    if (!ticketRef.current) return;

    const phoneToUse = forcePhone || customer?.phone;
    if (!phoneToUse) {
        setShowPhoneModal(true);
        return;
    }
    
    setIsGeneratingImage(true);
    try {
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
            
            // Em vez de abrir direto, mostramos a confirmação com instrução
            setShowWhatsAppConfirm(true);
            
          } else {
            throw new Error("Clipboard API não suportada.");
          }
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Erro ao copiar",
                description: "Tente baixar a imagem ao invés de copiar.",
            });
        }
      }, "image/png");
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Erro ao processar",
        description: "Tente novamente em alguns instantes.",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const openWhatsApp = () => {
    if (!customer?.phone) return;
    const cleanPhone = customer.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${cleanPhone}`;
    window.open(whatsappUrl, '_blank');
    setShowWhatsAppConfirm(false);
  };

  const handleSavePhoneAndContinue = async () => {
    if (!customer?.id || !newPhone.trim()) return;
    
    setIsSavingPhone(true);
    try {
        const customerRef = doc(db, 'customers', customer.id);
        const cleanPhone = newPhone.trim();
        
        await updateDoc(customerRef, {
            phone: cleanPhone
        });

        // Atualiza estado local
        setCustomer({ ...customer, phone: cleanPhone });
        setShowPhoneModal(false);
        
        toast({
            title: "Contato salvo!",
            description: "O número do cliente foi atualizado com sucesso.",
        });

        // Continua o fluxo passando o telefone diretamente para evitar que o modal reabra
        setTimeout(() => handleWhatsAppShare(cleanPhone), 500);
    } catch (e: any) {
        console.error(e);
        toast({
            variant: "destructive",
            title: "Erro ao salvar",
            description: "Não foi possível atualizar o contato.",
        });
    } finally {
        setIsSavingPhone(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!ticketRef.current) return;
    
    setIsGeneratingImage(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.download = `pedido-${order?.id.substring(0, 5) || 'ticket'}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "Sucesso!",
        description: "Imagem baixada com sucesso.",
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Erro no download",
        description: "Não foi possível gerar a imagem.",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '48px 48px' }}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col gap-4 justify-center items-center h-screen bg-background text-red-700 p-4 text-center" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '48px 48px' }}>
            <p className="font-bold">{error}</p>
            <Button onClick={() => router.back()} variant="outline">Voltar</Button>
        </div>
    );
  }

  if (!order) return null;

  return (
    <>
      <main className="bg-background min-h-screen flex flex-col items-center justify-start py-8 px-4 lg:flex-row lg:items-start lg:justify-center lg:gap-8 lg:py-12" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '48px 48px' }}>
        
        {/* Ticket — fica à esquerda no desktop */}
        <div id="printable-container" className="flex flex-col items-center gap-4 order-2 lg:order-1">
          <div 
              id="printable-area" 
              className="bg-white shadow-2xl rounded-sm transition-all duration-500 overflow-hidden"
              style={{ 
                  width: paperWidth === '58mm' ? '220px' : 
                         paperWidth === '80mm' ? '302px' : 
                         paperWidth === '110mm' ? '416px' :
                         paperWidth === '1/4 A4' ? '397px' :
                         paperWidth === '1/2 A4' ? '560px' : '794px'
              }}
          >
            <OrderTicket 
              ref={ticketRef} 
              order={order} 
              customer={customer} 
              ticketSettings={ticketSettings} 
              paperWidth={paperWidth}
            />
          </div>
          <p className="no-print text-[10px] text-muted-foreground text-center max-w-[200px]">
              Dica: Ao copiar para o WhatsApp, a imagem mantém a logo e formatação profissional.
          </p>
        </div>

        {/* Painel de controle — fica à direita no desktop, sticky */}
        <div className="no-print w-full max-w-[220px] space-y-3 order-1 lg:order-2 mb-6 lg:mb-0 lg:sticky lg:top-8 lg:self-start">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground w-full justify-start"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <div className="p-4 bg-card rounded-xl shadow-sm border space-y-4">
            <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Impressora Térmica</p>
                <div className="flex bg-muted/50 p-1 rounded-lg border gap-1">
                    {[
                        { id: '58mm', icon: Ticket, size: 12 },
                        { id: '80mm', icon: Ticket, size: 14 },
                        { id: '110mm', icon: Ticket, size: 16 }
                    ].map((size) => (
                        <button 
                            key={size.id}
                            onClick={() => setPaperWidth(size.id as any)}
                            className={`flex-1 flex flex-col items-center gap-1 py-1.5 px-1 rounded-md transition-all ${paperWidth === size.id ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <size.icon className={cn(paperWidth === size.id ? "text-primary" : "text-muted-foreground/60")} style={{ width: size.size, height: size.size }} />
                            <span className="text-[9px] font-bold">{size.id}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Folha Comum</p>
                <div className="flex bg-muted/50 p-1 rounded-lg border gap-1">
                    {[
                        { id: 'A4', label: 'Inteira (A4)', icon: FileText, size: 16 },
                        { id: '1/2 A4', label: '1/2 (A5)', icon: FileText, size: 14 },
                        { id: '1/4 A4', label: '1/4 (A6)', icon: FileText, size: 12 }
                    ].map((size) => (
                        <button 
                            key={size.id}
                            onClick={() => setPaperWidth(size.id as any)}
                            className={`flex-1 flex flex-col items-center gap-1 py-1.5 px-1 rounded-md transition-all ${paperWidth === size.id ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <size.icon className={cn(paperWidth === size.id ? "text-primary" : "text-muted-foreground/60")} style={{ width: size.size, height: size.size }} />
                            <span className="text-[9px] font-bold leading-tight">{size.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <Button className="w-full shadow-md h-11" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir Ticket
                </Button>
            </div>
            
            <Button 
                variant="ghost" 
                className="w-full text-[10px] h-6 text-muted-foreground" 
                onClick={() => setShowGuide(!showGuide)}
            >
                {showGuide ? "Ocultar dicas de configuração" : "Problemas com o tamanho? Clique aqui"}
            </Button>

            {showGuide && (
                <Alert className="bg-blue-50/50 border-blue-200/50">
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-900 text-xs font-bold">Dica de Impressão</AlertTitle>
                    <AlertDescription className="text-blue-800 text-[11px] space-y-1">
                        <p>Para o tamanho perfeito, na tela de impressão selecione:</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                            <li>Layout: <span className="font-bold">Retrato</span></li>
                            <li>Margens: <span className="font-bold">Mínima</span></li>
                            <li>Escala: <span className="font-bold">100%</span></li>
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            <div className="pt-2 border-t mt-2 space-y-2">
                <Button 
                    className="w-full shadow-sm bg-green-600 hover:bg-green-700 text-white" 
                    onClick={() => handleWhatsAppShare()}
                    disabled={isGeneratingImage}
                >
                    {isGeneratingImage ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <MessageCircle className="mr-2 h-4 w-4" />
                    )}
                    {isGeneratingImage ? "Gerando..." : "Copiar p/ WhatsApp"}
                </Button>

                <Button 
                    variant="secondary" 
                    className="w-full shadow-sm" 
                    onClick={handleDownloadImage}
                    disabled={isGeneratingImage}
                >
                    {isGeneratingImage ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="mr-2 h-4 w-4" />
                    )}
                    {isGeneratingImage ? "Gerando..." : "Baixar Imagem"}
                </Button>
            </div>
          </div>
        </div>

        <AlertDialog open={showWhatsAppConfirm} onOpenChange={setShowWhatsAppConfirm}>
            <AlertDialogContent className="max-w-[400px] rounded-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-green-600">
                        <MessageCircle className="h-5 w-5" />
                        Imagem Copiada!
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-foreground pt-2">
                        A imagem do ticket já está na sua área de transferência. 
                        <br /><br />
                        Clique em <strong>"Ir para o WhatsApp"</strong> e, na conversa que abrir, basta <strong>colar (Ctrl+V)</strong> para enviar.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
                    <AlertDialogCancel className="sm:flex-1 rounded-xl">Fechar</AlertDialogCancel>
                    <AlertDialogAction 
                        className="sm:flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
                        onClick={openWhatsApp}
                    >
                        Ir para o WhatsApp
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <Dialog open={showPhoneModal} onOpenChange={setShowPhoneModal}>
            <DialogContent className="max-w-[400px] rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-primary" />
                        Contato não cadastrado
                    </DialogTitle>
                    <DialogDescription>
                        Este cliente não possui um WhatsApp cadastrado. Digite o número abaixo para salvar e continuar:
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-phone">Número de Telefone</Label>
                        <Input 
                            id="new-phone" 
                            placeholder="(00) 00000-0000" 
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            autoFocus
                        />
                        <p className="text-[10px] text-muted-foreground italic">
                            * O número será salvo permanentemente no cadastro do cliente.
                        </p>
                    </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button variant="ghost" onClick={() => setShowPhoneModal(false)} className="sm:flex-1 rounded-xl">
                        Cancelar
                    </Button>
                    <Button 
                        className="sm:flex-1 rounded-xl font-bold"
                        onClick={handleSavePhoneAndContinue}
                        disabled={isSavingPhone || !newPhone.trim()}
                    >
                        {isSavingPhone ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Salvar e Abrir WhatsApp
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </main>
    </>
  );
}
