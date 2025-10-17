"use client"

import { useState } from "react";
import { MoreHorizontal, MessageSquare, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Order } from "@/lib/types";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteOrder } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrderTableRowActionsProps {
  order: Order;
  onUpdate: (orderId: string, updatedOrder: Partial<Order>) => void;
  onDelete: (orderId: string) => void;
}

export function OrderTableRowActions({ order, onUpdate, onDelete }: OrderTableRowActionsProps) {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const generateWaLink = (message: string) => {
    const phone = order.customerPhone.replace(/\D/g, ""); // remove non-digits
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const confirmationMessage = `Olá ${order.customerName}, esta é uma confirmação para seu pedido #${order.id} no AtelierFlow. Detalhes: ${order.serviceType} - ${order.description}. Total: R$${order.totalValue.toFixed(2)}. Prazo: ${format(order.dueDate, "PPP", { locale: ptBR })}. Obrigado!`;
  const readyMessage = `Olá ${order.customerName}, seu pedido #${order.id} no AtelierFlow está pronto para retirada! Estamos ansiosos para que você veja.`;

  const handleDelete = async () => {
    try {
      await deleteOrder(order.id);
      onDelete(order.id);
      toast({
        title: "Pedido Excluído",
        description: `O pedido #${order.id} foi excluído com sucesso.`,
      });
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
      <AlertDialog>
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
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Comunicação</DropdownMenuLabel>
             <DropdownMenuItem asChild>
              <a href={generateWaLink(confirmationMessage)} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="mr-2 h-4 w-4" />
                Enviar Confirmação
              </a>
            </DropdownMenuItem>
            {order.status === "Aguardando Retirada" && (
              <DropdownMenuItem asChild>
                 <a href={generateWaLink(readyMessage)} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="mr-2 h-4 w-4 text-green-600" />
                    Notificar Pronto para Retirada
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
             <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                </DropdownMenuItem>
            </AlertDialogTrigger>
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
        onOrderUpdated={(updatedOrder) => onUpdate(order.id, updatedOrder)}
      />
    </>
  );
}
