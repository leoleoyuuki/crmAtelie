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

  const confirmationMessage = `Hello ${order.customerName}, this is a confirmation for your order #${order.id} at AtelierFlow. Details: ${order.serviceType} - ${order.description}. Total: $${order.totalValue.toFixed(2)}. Due by: ${format(order.dueDate, "PPP")}. Thank you!`;
  const readyMessage = `Hello ${order.customerName}, your order #${order.id} at AtelierFlow is ready for pickup! We are excited for you to see it.`;

  const handleDelete = async () => {
    try {
      await deleteOrder(order.id);
      onDelete(order.id);
      toast({
        title: "Order Deleted",
        description: `Order #${order.id} has been successfully deleted.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the order.",
      });
    }
  };
  
  return (
    <>
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Communication</DropdownMenuLabel>
             <DropdownMenuItem asChild>
              <a href={generateWaLink(confirmationMessage)} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Confirmation
              </a>
            </DropdownMenuItem>
            {order.status === "Awaiting Pickup" && (
              <DropdownMenuItem asChild>
                 <a href={generateWaLink(readyMessage)} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="mr-2 h-4 w-4 text-green-600" />
                    Notify Ready for Pickup
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
             <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the order
                for {order.customerName}.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
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
