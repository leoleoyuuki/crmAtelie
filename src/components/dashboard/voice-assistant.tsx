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
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        stopListening();
        toast({
          variant: "destructive",
          title: "Erro no microfone",
          description: "Não foi possível escutar o áudio. Tente novamente.",
        });
      };

      recognitionRef.current.onend = async () => {
        // When speech recognition ends naturally or manually
        setIsListening(false);
        // But only process if we had transcript when it stopped naturally
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [toast]);

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
    setIsModalOpen(true);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
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
          title: "Pedido Extraído!",
          description: "Os campos foram preenchidos com o áudio.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao processar o áudio. Preencha manualmente.",
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
        className="h-10 w-10 shrink-0 bg-primary/10 text-primary hover:bg-primary/20 border-primary/30 relative" 
        onClick={startListening}
        title="Ditar pedido com IA"
      >
        <Mic className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
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
            <DialogTitle>Mágica de Voz ✨</DialogTitle>
            <DialogDescription>
              Fale os detalhes do pedido e nossa IA preencherá tudo para você.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center p-6 space-y-6">
            {isProcessing ? (
               <div className="flex flex-col items-center gap-4 text-primary">
                 <Loader2 className="h-12 w-12 animate-spin" />
                 <p className="text-sm font-medium animate-pulse">Lendo seus lábios... ops, áudio!</p>
               </div>
            ) : (
                <>
                  <div className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ${isListening ? 'bg-primary/20 scale-110' : 'bg-muted'}`}>
                    {isListening && (
                      <span className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping"></span>
                    )}
                    <Mic className={`h-10 w-10 ${isListening ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  
                  <div className="w-full min-h-[80px] p-4 rounded-lg bg-muted/50 border text-center flex items-center justify-center">
                     {transcript ? (
                         <p className="text-sm italic">{transcript}</p>
                     ) : (
                         <p className="text-sm text-muted-foreground italic">
                            Diga: "Pedido da Maria, um vestido de cento e cinquenta reais, pra entregar dia 20..."
                         </p>
                     )}
                  </div>
                  
                  <Button 
                    className="w-full h-12 rounded-full" 
                    onClick={handleProcessRecording}
                    disabled={!transcript.trim()}
                  >
                     Processar Texto
                  </Button>
                </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
