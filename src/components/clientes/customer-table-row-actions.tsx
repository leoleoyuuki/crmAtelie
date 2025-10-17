
"use client"

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Customer } from "@/lib/types";
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
import { deleteCustomer } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { CustomerFormDialog } from "../dashboard/customer-form-dialog";

interface CustomerTableRowActionsProps {
  customer: Customer;
  onUpdate: (customerId: string, updatedCustomer: Partial<Customer>) => void;
  onDelete: (customerId: string) => void;
}

export function CustomerTableRowActions({ customer, onUpdate, onDelete }: CustomerTableRowActionsProps) {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const handleDelete = async () => {
    try {
      await deleteCustomer(customer.id);
      onDelete(customer.id);
      toast({
        title: "Cliente Excluído",
        description: `O cliente ${customer.name} foi excluído com sucesso.`,
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao excluir o cliente. Verifique se ele não possui pedidos associados.",
      });
    }
  };

  const handleUpdate = (updatedCustomer: Customer) => {
    onUpdate(customer.id, updatedCustomer);
    // The dialog will show its own toast
  };
  
  return (
    <>
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
                Essa ação não pode ser desfeita. Isso excluirá permanentemente o cliente {customer.name}.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CustomerFormDialog
        customer={customer}
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        onCustomerCreated={() => {}} // Not used here, for update
        onCustomerUpdated={handleUpdate}
      />
    </>
  );
}
