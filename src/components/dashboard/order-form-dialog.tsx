"use client";

import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Order, OrderStatus, ServiceType } from "@/lib/types";
import { addOrder, updateOrder } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";

const orderFormSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters."),
  customerPhone: z.string().min(10, "Phone number seems too short."),
  serviceType: z.enum(["Alteration", "Custom Design", "Repair", "Dry Cleaning"]),
  description: z.string().max(200, "Description is too long.").optional(),
  totalValue: z.coerce.number().min(0, "Value must be positive."),
  dueDate: z.date({ required_error: "A due date is required." }),
  status: z.enum(['Pending', 'In Process', 'Awaiting Pickup', 'Completed', 'Delivered']),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

const serviceTypes: ServiceType[] = ["Alteration", "Custom Design", "Repair", "Dry Cleaning"];
const statuses: OrderStatus[] = ['Pending', 'In Process', 'Awaiting Pickup', 'Completed', 'Delivered'];

interface OrderFormDialogProps {
  order?: Order;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  onOrderCreated?: (order: Order) => void;
  onOrderUpdated?: (updatedOrder: Partial<Order>) => void;
}

export function OrderFormDialog({
  order,
  isOpen: controlledIsOpen,
  setIsOpen: setControlledIsOpen,
  onOrderCreated,
  onOrderUpdated,
}: OrderFormDialogProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = React.useState(false);
  const isEditing = !!order;
  const { toast } = useToast();

  const isOpen = controlledIsOpen ?? uncontrolledIsOpen;
  const setIsOpen = setControlledIsOpen ?? setUncontrolledIsOpen;

  const defaultValues: Partial<OrderFormValues> = order ? {
    ...order,
    totalValue: order.totalValue,
  } : {
    status: 'Pending',
  };

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues,
  });
  
  useEffect(() => {
    if (order) {
        form.reset(order);
    } else {
        form.reset({
            customerName: '',
            customerPhone: '',
            description: '',
            status: 'Pending',
        });
    }
  }, [order, form, isOpen]);


  const onSubmit = async (data: OrderFormValues) => {
    try {
      if (isEditing && order) {
        const updated = await updateOrder(order.id, data);
        onOrderUpdated?.(updated);
        toast({ title: "Order Updated", description: `Order #${order.id} has been updated.` });
      } else {
        const newOrder = await addOrder(data as Omit<Order, 'id' | 'createdAt'>);
        onOrderCreated?.(newOrder);
        toast({ title: "Order Created", description: `New order #${newOrder.id} has been created.` });
      }
      setIsOpen(false);
      form.reset();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Something went wrong." });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isEditing && (
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{isEditing ? "Edit Order" : "Create New Order"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details for this order." : "Fill in the details for the new customer order."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Customer Phone</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., 123-456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {serviceTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the service details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="totalValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Value ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 50.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1.5">Due Date</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select order status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">
                        Cancel
                    </Button>
                </DialogClose>
                <Button type="submit">{isEditing ? 'Save Changes' : 'Create Order'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
