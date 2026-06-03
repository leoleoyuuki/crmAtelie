'use client';

import { useState, useRef, useEffect } from 'react';
import { TicketSettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Printer, Share2, Loader2, HelpCircle, Download, MessageCircle, Ticket, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';
import { QuoteTicket } from './quote-ticket';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface QuotePrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  description?: string;
  materials?: Array<{ name: string; quantity: number }>;
  finalPrice: number;
  ticketSettings?: TicketSettings;
}

export function QuotePrintDialog({
  open,
  onOpenChange,
  name,
  description,
  materials,
  finalPrice,
  ticketSettings,
}: QuotePrintDialogProps) {
  const { toast } = useToast();
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm' | '110mm' | 'A4' | '1/2 A4' | '1/4 A4'>('58mm');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showWhatsAppConfirm, setShowWhatsAppConfirm] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  // Load preferred paper width
  useEffect(() => {
    const savedWidth = localStorage.getItem('crmAtelie-preferredPaperWidth');
    if (savedWidth) {
      setPaperWidth(savedWidth as any);
    }
  }, []);

  const handlePaperWidthChange = (width: '58mm' | '80mm' | '110mm' | 'A4' | '1/2 A4' | '1/4 A4') => {
    setPaperWidth(width);
    localStorage.setItem('crmAtelie-preferredPaperWidth', width);
  };

  const handlePrint = () => {
    const printableArea = document.getElementById('printable-quote-area');
    if (!printableArea) return;

    // Create temporary print style
    const style = document.createElement('style');
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
        .no-print, body > *:not(#print-quote-root-temp) {
          display: none !important;
        }
        #print-quote-root-temp {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          box-shadow: none !important;
          visibility: visible !important;
        }
        #print-quote-root-temp * {
          visibility: visible !important;
        }
      }
    `;
    
    // Create print wrapper container
    const tempContainer = document.createElement('div');
    tempContainer.id = 'print-quote-root-temp';
    tempContainer.innerHTML = printableArea.innerHTML;
    document.body.appendChild(tempContainer);
    document.head.appendChild(style);

    window.print();

    // Clean up
    document.body.removeChild(tempContainer);
    document.head.removeChild(style);
  };

  const handleWhatsAppShare = async () => {
    if (!ticketRef.current) return;
    
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
    window.open("https://web.whatsapp.com/", '_blank');
    setShowWhatsAppConfirm(false);
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
      link.download = `orcamento-${name.toLowerCase().replace(/\s+/g, '-') || 'ticket'}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "Sucesso!",
        description: "Imagem do orçamento baixada com sucesso.",
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[700px] w-[95vw] rounded-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <DialogHeader>
            <DialogTitle>Imprimir / Compartilhar Orçamento</DialogTitle>
            <DialogDescription>
              Configure o tamanho e gere o arquivo do orçamento para enviar ao seu cliente.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col md:flex-row gap-6 mt-4 items-stretch">
            {/* Control Panel */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
              <div className="p-4 bg-muted/30 rounded-xl border space-y-4">
                <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Impressora Térmica</p>
                    <div className="flex bg-muted/50 p-0.5 rounded-lg border gap-0.5">
                        {[
                            { id: '58mm', icon: Ticket, size: 12 },
                            { id: '80mm', icon: Ticket, size: 14 },
                            { id: '110mm', icon: Ticket, size: 16 }
                        ].map((size) => (
                            <button 
                                type="button"
                                key={size.id}
                                onClick={() => handlePaperWidthChange(size.id as any)}
                                className={cn(
                                  "flex-1 flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-md transition-all",
                                  paperWidth === size.id ? 'bg-background shadow-sm text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <size.icon className={cn(paperWidth === size.id ? "text-primary" : "text-muted-foreground/60")} style={{ width: size.size, height: size.size }} />
                                <span className="text-[9px]">{size.id}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Folha Comum</p>
                    <div className="flex bg-muted/50 p-0.5 rounded-lg border gap-0.5">
                        {[
                            { id: 'A4', label: 'A4', icon: FileText, size: 16 },
                            { id: '1/2 A4', label: 'A5', icon: FileText, size: 14 },
                            { id: '1/4 A4', label: 'A6', icon: FileText, size: 12 }
                        ].map((size) => (
                            <button 
                                type="button"
                                key={size.id}
                                onClick={() => handlePaperWidthChange(size.id as any)}
                                className={cn(
                                  "flex-1 flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-md transition-all",
                                  paperWidth === size.id ? 'bg-background shadow-sm text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <size.icon className={cn(paperWidth === size.id ? "text-primary" : "text-muted-foreground/60")} style={{ width: size.size, height: size.size }} />
                                <span className="text-[9px] leading-tight">{size.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-muted/50">
                    <Button type="button" className="w-full shadow-md h-10" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir
                    </Button>
                </div>
                
                <Button 
                    type="button"
                    variant="ghost" 
                    className="w-full text-[10px] h-6 text-muted-foreground" 
                    onClick={() => setShowGuide(!showGuide)}
                >
                    {showGuide ? "Ocultar dicas" : "Problemas com margem? Clique aqui"}
                </Button>

                {showGuide && (
                    <Alert className="bg-blue-50/50 border-blue-200/50 p-3">
                        <HelpCircle className="h-3 w-3 text-blue-600" />
                        <AlertTitle className="text-blue-900 text-[10px] font-bold leading-tight">Configurações Recomendadas</AlertTitle>
                        <AlertDescription className="text-blue-800 text-[9px] space-y-1">
                            <p>Na janela de impressão:</p>
                            <ul className="list-disc pl-3 space-y-0.5">
                                <li>Layout: <span className="font-bold">Retrato</span></li>
                                <li>Margens: <span className="font-bold">Mínima</span></li>
                                <li>Escala: <span className="font-bold">100%</span></li>
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="pt-2 border-t mt-2 space-y-2">
                    <Button 
                        type="button"
                        className="w-full shadow-sm bg-green-600 hover:bg-green-700 text-white h-9 text-xs" 
                        onClick={handleWhatsAppShare}
                        disabled={isGeneratingImage}
                    >
                        {isGeneratingImage ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        {isGeneratingImage ? "Gerando..." : "Copiar p/ WhatsApp"}
                    </Button>

                    <Button 
                        type="button"
                        variant="secondary" 
                        className="w-full shadow-sm h-9 text-xs" 
                        onClick={handleDownloadImage}
                        disabled={isGeneratingImage}
                    >
                        {isGeneratingImage ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Download className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        {isGeneratingImage ? "Gerando..." : "Baixar Imagem"}
                    </Button>
                </div>
              </div>
            </div>

            {/* Ticket Preview Panel */}
            <div className="flex-1 flex items-center justify-center bg-muted/20 border rounded-2xl p-4 min-h-[300px] overflow-hidden">
              <div 
                  id="printable-quote-area" 
                  className="bg-white shadow-lg rounded-sm transition-all duration-300 overflow-hidden border border-black/5"
                  style={{ 
                      width: paperWidth === '58mm' ? '220px' : 
                             paperWidth === '80mm' ? '302px' : 
                             paperWidth === '110mm' ? '416px' :
                             paperWidth === '1/4 A4' ? '397px' :
                             paperWidth === '1/2 A4' ? '560px' : '650px',
                      transform: paperWidth === 'A4' ? 'scale(0.85)' : 'none',
                      transformOrigin: 'center top'
                  }}
              >
                <QuoteTicket 
                  ref={ticketRef} 
                  name={name}
                  description={description}
                  materials={materials}
                  finalPrice={finalPrice}
                  ticketSettings={ticketSettings} 
                  paperWidth={paperWidth}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showWhatsAppConfirm} onOpenChange={setShowWhatsAppConfirm}>
          <AlertDialogContent className="max-w-[400px] rounded-2xl">
              <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-green-600">
                      <MessageCircle className="h-5 w-5" />
                      Imagem Copiada!
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-foreground pt-2">
                      A imagem do orçamento já está na sua área de transferência. 
                      <br /><br />
                      Abra o WhatsApp Web, selecione a conversa do cliente e cole (Ctrl+V ou Cmd+V) para enviar.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
                  <AlertDialogCancel className="sm:flex-1 rounded-xl">Fechar</AlertDialogCancel>
                  <AlertDialogAction 
                      className="sm:flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
                      onClick={openWhatsApp}
                  >
                      Abrir WhatsApp
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
