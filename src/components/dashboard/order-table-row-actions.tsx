
"use client"

import { useState, useEffect, useRef } from "react";
import { MoreHorizontal, MessageSquare, Pencil, Trash2, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Order, Customer } from "@/lib/types";
import { OrderFormDialog } from "./order-form-dialog";
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
import { deleteOrder } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { OrderTicket } from "./order-ticket";

interface OrderTableRowActionsProps {
  order: Order;
  onUpdate: (orderId: string, updatedOrder: Partial<Order>) => void;
  onDelete: (orderId: string) => void;
}

export function OrderTableRowActions({ order, onUpdate, onDelete }: OrderTableRowActionsProps) {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);

  const ticketRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => ticketRef.current,
    documentTitle: `Pedido_${order.id.substring(0, 5)}`,
    bodyClass: "bg-white",
    onAfterPrint: () => setIsPrinting(false), 
  });

  useEffect(() => {
    if (isPrinting) {
      handlePrint();
    }
  }, [isPrinting, handlePrint]);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (order.customerId) {
        const customerRef = doc(db, "customers", order.customerId);
        const customerSnap = await getDoc(customerRef);
        if (customerSnap.exists()) {
          setCustomer(customerSnap.data() as Customer);
        }
      }
    };
    fetchCustomer();
  }, [order.customerId]);

  const generateWaLink = (message: string) => {
    if (!customer?.phone) return "";
    const phone = customer.phone.replace(/\D/g, ""); // remove non-digits
    return `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
  };

  const confirmationMessage = `Olá ${order.customerName}, esta é uma confirmação para seu pedido #${order.id.substring(0, 5)} no AtelierFlow. Detalhes: ${order.serviceType} - ${order.description}. Total: R$${order.totalValue.toFixed(2)}. Prazo: ${format(order.dueDate, "PPP", { locale: ptBR })}. Obrigado!`;
  const readyMessage = `Olá ${order.customerName}, seu pedido #${order.id.substring(0, 5)} no AtelierFlow está pronto para retirada! Estamos ansiosos para que você veja.`;

  const handleDelete = async () => {
    try {
      await deleteOrder(order.id);
      onDelete(order.id);
      toast({
        title: "Pedido Excluído",
        description: `O pedido #${order.id.substring(0, 5)} foi excluído com sucesso.`,
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao excluir o pedido.",
      });
    }
  };
  
  return (
    <>
      <div className="hidden">
        <OrderTicket ref={ticketRef} order={order} customer={customer} />
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => setIsPrinting(true)}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Comprovante
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Comunicação</DropdownMenuLabel>
             <DropdownMenuItem asChild disabled={!customer}>
              <a href={generateWaLink(confirmationMessage)} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="mr-2 h-4 w-4" />
                Enviar Confirmação
              </a>
            </DropdownMenuItem>
            {order.status === "Aguardando Retirada" && (
              <DropdownMenuItem asChild disabled={!customer}>
                 <a href={generateWaLink(readyMessage)} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="mr-2 h-4 w-4 text-green-600" />
                    Notificar Pronto para Retirada
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
             <DropdownMenuItem className="text-red-600" onSelect={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                Essa ação não pode ser desfeita. Isso excluirá permanentemente o pedido
                de {order.customerName}.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <OrderFormDialog
        order={order}
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        onOrderUpdated={onUpdate}
      />
    </>
  );
}
