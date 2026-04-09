"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { processVoiceOrder } from "@/app/actions/ai";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Provide type definitions for SpeechRecognition if not recognized by default TS config
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceAssistantProps {
  onResult: (data: any) => void;
}

export function VoiceAssistant({ onResult }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
          const result = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            // Android duplication fix: 
            // Some Android browsers (Chrome) include previous segments in the latest result.
            // We check if the new segment starts with what we already have to avoid duplication.
            const currentFinalTrimmed = finalTranscript.trim().toLowerCase();
            const newSegmentTrimmed = result.trim().toLowerCase();
            
            if (currentFinalTrimmed && newSegmentTrimmed.startsWith(currentFinalTrimmed)) {
              finalTranscript = result;
            } else {
              finalTranscript += (finalTranscript ? ' ' : '') + result;
            }
          } else {
            interimTranscript += result;
          }
        }
        setTranscript((finalTranscript + interimTranscript).trim());
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'no-speech') return;
        console.error("Speech recognition error", event.error);
        stopListening();
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      toast({
        variant: "destructive",
        title: "Navegador não suportado",
        description: "Seu navegador não suporta dictation nativo.",
      });
      return;
    }
    setTranscript("");
    setIsListening(true);
    setIsHolding(true);
    setIsModalOpen(true);
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("Recognition start error:", e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setIsHolding(false);
  };
  
  const handleProcessRecording = async () => {
    stopListening();
    if (!transcript.trim()) {
       setIsModalOpen(false);
       return;
    }
    
    setIsProcessing(true);
    try {
      const data = await processVoiceOrder(transcript);
      if (data) {
        onResult(data);
        toast({
          variant: "success",
          title: "Pedido Extraído! ✨",
          description: "Os campos foram preenchidos.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao processar o áudio. Tente novamente.",
      });
    } finally {
      setIsProcessing(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <Button 
        type="button" 
        variant="outline" 
        size="icon" 
        className="h-10 w-10 shrink-0 bg-primary/10 text-primary hover:bg-primary/20 border-primary/30 relative select-none" 
        style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
        onClick={() => setIsModalOpen(true)}
        title="Ditar pedido com IA"
      >
        <Mic className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3 pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
        </span>
      </Button>

      <Dialog open={isModalOpen} onOpenChange={(open) => {
          if (!open && isListening) stopListening();
          // Don't allow closing while processing
          if (!isProcessing) setIsModalOpen(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Voz para Pedido 🎙️</DialogTitle>
            <DialogDescription>
              Segure o botão para falar detalhes do pedido (cliente, serviço, valor, etc).
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center p-6 space-y-6">
            {isProcessing ? (
               <div className="flex flex-col items-center gap-4 text-primary select-none">
                 <Loader2 className="h-12 w-12 animate-spin" />
                 <p className="text-sm font-medium animate-pulse">Processando áudio...</p>
               </div>
            ) : (
                <>
                  <div 
                    className={`relative flex items-center justify-center w-28 h-28 rounded-full transition-all duration-300 cursor-pointer select-none touch-none
                      ${isListening ? 'bg-primary scale-110 shadow-lg shadow-primary/40' : 'bg-muted hover:bg-muted/80'}`}
                    style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
                    onMouseDown={startListening}
                    onMouseUp={stopListening}
                    onMouseLeave={stopListening}
                    onTouchStart={startListening}
                    onTouchEnd={stopListening}
                  >
                    {isListening && (
                      <span className="absolute inset-0 rounded-full border-8 border-primary/30 animate-ping"></span>
                    )}
                    <Mic className={`h-12 w-12 select-none ${isListening ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>

                  <p 
                    className="text-xs font-semibold uppercase tracking-widest text-muted-foreground animate-pulse select-none"
                    style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                  >
                    {isListening ? "Gravando... solte para parar" : "Segure para falar"}
                  </p>
                  
                  <div className="w-full min-h-[100px] p-4 rounded-xl bg-muted/60 border border-dashed text-center flex items-center justify-center">
                     {transcript ? (
                         <p className="text-sm italic leading-relaxed">"{transcript}"</p>
                     ) : (
                         <p className="text-xs text-muted-foreground italic px-4">
                            Ex: "Pedido da Maria, ajuste de vestido, apertar 2cm na cintura, vou cobrar 40 reais, pra entregar dia 5 de abril"
                         </p>
                     )}
                  </div>
                  
                  <div className="flex gap-2 w-full">
                    <Button 
                        variant="ghost"
                        className="flex-1"
                        onClick={() => { setTranscript(""); setIsModalOpen(false); }}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        className="flex-[2] h-11 rounded-lg" 
                        onClick={handleProcessRecording}
                        disabled={!transcript.trim() || isListening}
                    >
                        Confirmar e Preencher
                    </Button>
                  </div>
                </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
