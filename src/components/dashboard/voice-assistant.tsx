"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { processUniversalVoiceCommand, UniversalVoiceResponse } from "@/app/actions/ai";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Combobox } from "@/components/ui/combobox";
import { addOrder, addSale, addCustomer, addPurchase, addFixedCost, searchCustomers } from "@/lib/data";
import { OrderStatus, Customer } from "@/lib/types";

// Provide type definitions for SpeechRecognition if not recognized by default TS config
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceAssistantProps {
  onResult?: (data: any) => void;
}

export function VoiceAssistant({ onResult }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [aiResponse, setAiResponse] = useState<UniversalVoiceResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("new");
  const [customerSearch, setCustomerSearch] = useState("");
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(customerSearch);
    }, 500);
    return () => clearTimeout(handler);
  }, [customerSearch]);

  useEffect(() => {
    if (isModalOpen && (debouncedSearch.length >= 3 || (aiResponse?.data?.customerName && !debouncedSearch))) {
      const term = debouncedSearch || aiResponse?.data?.customerName || "";
      if (term.length >= 3) {
        setIsLoadingCustomers(true);
        searchCustomers(term)
          .then(setCustomers)
          .catch(console.error)
          .finally(() => setIsLoadingCustomers(false));
      }
    } else if (!isModalOpen) {
      setCustomers([]);
      setCustomerSearch("");
      setDebouncedSearch("");
    }
  }, [isModalOpen, debouncedSearch, aiResponse]);

  useEffect(() => {
    // Pre-select logic if AI identifies a customer name by matching it roughly
    if (aiResponse && (aiResponse.operation === 'ORDER' || aiResponse.operation === 'SALE')) {
      const spokenName = aiResponse.data.customerName;
      if (spokenName && customers.length > 0) {
        const match = customers.find(c =>
          c.name.toLowerCase().includes(spokenName.toLowerCase()) ||
          spokenName.toLowerCase().includes(c.name.toLowerCase())
        );
        if (match) {
          setSelectedCustomerId(match.id);
        } else {
          setSelectedCustomerId("new");
        }
      } else {
        setSelectedCustomerId("new");
      }
    }
  }, [aiResponse, customers]);

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
    setAiResponse(null);
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

  const mapOperationToLabel = (op: string) => {
    const map: Record<string, string> = {
      ORDER: "Novo Pedido",
      SALE: "Nova Venda",
      CUSTOMER: "Novo Cliente",
      PURCHASE: "Registro de Compra",
      FIXED_COST: "Adicionar Conta",
    };
    return map[op] || "Operação Desconhecida";
  };

  const handleConfirmAction = async () => {
    if (!aiResponse) return;

    setIsSaving(true);
    const aiResponseData = aiResponse;
    try {
      if (aiResponseData.operation === "ORDER") {
        const itemsData = aiResponseData.data.items || [];
        const totalValue = itemsData.reduce((sum: number, item: any) => sum + ((Number(item.value) || 0) * (Number(item.quantity) || 1)), 0);

        let parsedDueDate: Date | undefined = undefined;
        if (aiResponseData.data.dueDate) {
          const [year, month, day] = aiResponseData.data.dueDate.split('-');
          if (year && month && day) {
            parsedDueDate = new Date(Number(year), Number(month) - 1, Number(day));
          }
        }

        let customerId = selectedCustomerId;
        let finalCustomerName = "Cliente Avulso";

        if (customerId === "new") {
          finalCustomerName = aiResponseData.data.customerName || "Cliente Avulso";
          const c = await addCustomer({ name: finalCustomerName, phone: "", email: "" });
          customerId = c.id;
        } else {
          const existingCust = customers.find(c => c.id === customerId);
          if (existingCust) finalCustomerName = existingCust.name;
        }

        await addOrder({
          customerId,
          customerName: finalCustomerName,
          items: itemsData.map((it: any) => ({
            serviceType: it.serviceType || 'Serviço',
            description: it.description || '',
            value: Number(it.value || 0),
            quantity: Number(it.quantity || 1),
            assignedTo: ''
          })),
          totalValue: Number(totalValue),
          dueDate: parsedDueDate || new Date(),
          status: 'Novo' as OrderStatus
        });

      } else if (aiResponseData.operation === "SALE") {
        const p = Number(aiResponseData.data.price || 0);
        const c = Number(aiResponseData.data.cost || 0);

        let customerId = selectedCustomerId;
        let finalCustomerName = "Venda Varejo";
        if (customerId === "new") {
          finalCustomerName = aiResponseData.data.customerName || "Venda Varejo";
          if (aiResponseData.data.customerName) {
            const c = await addCustomer({ name: aiResponseData.data.customerName, phone: "", email: "" });
            customerId = c.id;
          } else {
            customerId = "";
          }
        } else {
          const existingCust = customers.find(c => c.id === customerId);
          if (existingCust) finalCustomerName = existingCust.name;
        }

        await addSale({
          productName: aiResponseData.data.productName || "Venda Varejo",
          price: p,
          cost: c,
          profit: p - c,
          date: new Date(),
          customerName: finalCustomerName,
          customerId: customerId || undefined
        });
      } else if (aiResponseData.operation === "CUSTOMER") {
        await addCustomer({
          name: aiResponseData.data.customerName || "Cliente",
          phone: aiResponseData.data.phone || "",
          email: ""
        });
      } else if (aiResponseData.operation === "PURCHASE") {
        await addPurchase({
          materialName: aiResponseData.data.materialName || "Material",
          quantity: Number(aiResponseData.data.quantity || 1),
          cost: Number(aiResponseData.data.cost || 0),
          unit: aiResponseData.data.unit || "unid",
          category: "Material",
        });
      } else if (aiResponseData.operation === "FIXED_COST") {
        await addFixedCost({
          description: aiResponseData.data.description || "Conta",
          cost: Number(aiResponseData.data.cost || 0),
          date: new Date(),
        });
      }

      toast({
        variant: "success",
        title: "Sucesso! 🎉",
        description: "Sua ação foi registrada com sucesso.",
      });
      setIsModalOpen(false);
      setTranscript("");
      setAiResponse(null);
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar",
        description: e.message || "Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleProcessRecording = async () => {
    stopListening();
    if (!transcript.trim()) {
      setIsModalOpen(false);
      return;
    }

    setIsProcessing(true);
    try {
      const response = await processUniversalVoiceCommand(transcript);
      if (response && response.operation) {
        if (onResult) {
          if (response.operation !== "ORDER") {
            toast({
              variant: "destructive",
              title: "Atenção",
              description: "Foi falado " + mapOperationToLabel(response.operation).toLowerCase() + " num form de pedido.",
            });
          }
          onResult(response.data);
          toast({
            variant: "success",
            title: "Detectado!",
            description: "Os campos foram preenchidos.",
          });
          setIsModalOpen(false);
          setTranscript("");
          setAiResponse(null);
        } else {
          // Standalone mode: we show verification view!
          setAiResponse(response);
        }
      } else {
        throw new Error("Não foi possível identificar a operação.");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Falha ao processar o áudio. Tente novamente.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderVerificationData = () => {
    if (!aiResponse) return null;
    const { operation, data } = aiResponse;

    return (
      <div className="text-left w-full space-y-3 text-sm bg-background p-4 rounded-xl border border-muted-foreground/20">
        {operation === 'ORDER' && (
          <>
            <div>
              <label className="text-xs font-semibold mb-1 block text-primary">Vincular a um Cliente:</label>
              <Combobox
                isLoading={isLoadingCustomers}
                options={[
                  { value: 'new', label: `✅ Novo: ${customerSearch || data.customerName || "Avulso"}` },
                  ...customers.map(c => ({ value: c.id, label: c.name }))
                ]}
                value={selectedCustomerId}
                onChange={setSelectedCustomerId}
                placeholder="Pesquisar cliente..."
                searchPlaceholder="Buscar por nome..."
                notFoundText="Nenhum cliente encontrado."
                defaultInputValue={customerSearch || data.customerName || ""}
              />
            </div>
            <p><strong>Devido em:</strong> {data.dueDate ? new Date(data.dueDate + 'T12:00:00').toLocaleDateString('pt-BR') : 'Não informada'}</p>
            <div>
              <strong>Itens do Pedido:</strong>
              <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1 mt-1">
                {data.items?.map((it: any, i: number) => (
                  <li key={i}>{it.quantity}x {it.serviceType} (R$ {Number(it.value || 0).toFixed(2)}) {it.description && `- ${it.description}`}</li>
                ))}
              </ul>
            </div>
          </>
        )}
        {operation === 'SALE' && (
          <>
            <p><strong>Produto:</strong> {data.productName}</p>
            <p><strong>Preço:</strong> R$ {Number(data.price || 0).toFixed(2)}</p>
            <div>
              <label className="text-xs font-semibold mt-2 mb-1 block text-primary">Vincular a um Cliente:</label>
              <Combobox
                isLoading={isLoadingCustomers}
                options={[
                  { value: 'new', label: `✅ Novo: ${customerSearch || data.customerName || 'Venda Avulsa (Nenhum)'}` },
                  ...customers.map(c => ({ value: c.id, label: c.name }))
                ]}
                value={selectedCustomerId}
                onChange={setSelectedCustomerId}
                placeholder="Pesquisar cliente..."
                searchPlaceholder="Buscar por nome..."
                notFoundText="Nenhum cliente encontrado."
                defaultInputValue={customerSearch || data.customerName || ""}
              />
            </div>
          </>
        )}
        {operation === 'CUSTOMER' && (
          <>
            <p><strong>Nome:</strong> {data.customerName}</p>
            <p><strong>Telefone:</strong> {data.phone || 'Não identificado'}</p>
          </>
        )}
        {operation === 'PURCHASE' && (
          <>
            <p><strong>Material:</strong> {data.materialName}</p>
            <p><strong>Custo:</strong> R$ {Number(data.cost || 0).toFixed(2)}</p>
            <p><strong>Quantidade:</strong> {data.quantity} {data.unit}</p>
          </>
        )}
        {operation === 'FIXED_COST' && (
          <>
            <p><strong>Descrição:</strong> {data.description}</p>
            <p><strong>Valor:</strong> R$ {Number(data.cost || 0).toFixed(2)}</p>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10 shrink-0 bg-primary/10 text-primary hover:bg-primary/20 border-primary/30 relative select-none"
        style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
        onClick={() => setIsModalOpen(true)}
        title="Assistente Inteligente 🎙️"
      >
        <Mic className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3 pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
        </span>
      </Button>

      <Dialog open={isModalOpen} onOpenChange={(open) => {
        if (!open && isListening) stopListening();
        // Don't allow closing while processing or saving
        if (!isProcessing && !isSaving) setIsModalOpen(open);
        if (!open) {
          setTranscript("");
          setAiResponse(null);
        }
      }}>
        <DialogContent 
          className="sm:max-w-md"
          onPointerDownOutside={(e) => {
            // Prevent closing if clicking on a portalled element (like the Combobox popover)
            if (e.target instanceof Element && e.target.closest('[data-radix-popper-content-wrapper]')) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            // Prevent closing if interacting with a portalled element
            if (e.target instanceof Element && e.target.closest('[data-radix-popper-content-wrapper]')) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {aiResponse ? 'Ação Identificada ✨' : 'Assistente Inteligente 🎙️'}
            </DialogTitle>
            <DialogDescription>
              {aiResponse
                ? `Detectamos: ${mapOperationToLabel(aiResponse.operation)}.`
                : "Diga um pedido, uma venda, um novo cliente ou despesa."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-4 sm:p-6 space-y-6">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-4 text-primary select-none">
                <Loader2 className="h-12 w-12 animate-spin" />
                <p className="text-sm font-medium animate-pulse">
                  {onResult ? "Preenchendo..." : "Analisando voz..."}
                </p>
              </div>
            ) : isSaving ? (
              <div className="flex flex-col items-center gap-4 text-primary select-none">
                <Loader2 className="h-12 w-12 animate-spin" />
                <p className="text-sm font-medium animate-pulse">Registrando no sistema...</p>
              </div>
            ) : aiResponse ? (
              // VERIFICATION VIEW (Standalone only)
              <>
                {renderVerificationData()}
                <div className="flex gap-2 w-full pt-2">
                  <Button
                    variant="ghost"
                    className="flex-1 border"
                    onClick={() => { setAiResponse(null); setTranscript(""); }}
                  >
                    Voltar
                  </Button>
                  <Button
                    className="flex-[2] h-11 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-lg"
                    onClick={handleConfirmAction}
                  >
                    Confirmar e Salvar
                  </Button>
                </div>
              </>
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
                    <p className="text-[11px] sm:text-xs text-muted-foreground italic sm:px-4">
                      Ex: "Vendi uma saia por 50"<br />
                      "Bolo para a Ana, 150 pra amanhã"<br />
                      "Comprei linha por 15 reais"
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
                    Analisar
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
