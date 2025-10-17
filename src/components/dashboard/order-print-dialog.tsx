
"use client";

import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Order, Customer } from '@/lib/types';
import { OrderTicket } from './order-ticket';

interface OrderPrintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  customer: Customer | null;
}

export function OrderPrintDialog({ isOpen, onClose, order, customer }: OrderPrintDialogProps) {
  const ticketRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => ticketRef.current,
    documentTitle: `Pedido_${order.id.substring(0, 5)}`,
    bodyClass: 'bg-white',
    onAfterPrint: onClose,
    onPrintError: onClose,
  });

  // Call print directly when the component is open and rendered
  if (isOpen) {
    // We call handlePrint in a timeout of 0 to push it to the end of the event loop.
    // This ensures the ref is set before the print dialog is triggered.
    setTimeout(handlePrint, 0);
  }

  if (!isOpen) {
    return null;
  }

  // Render the component to be printed, but keep it off-screen
  return (
    <div style={{ position: 'absolute', left: '-9999px' }}>
      <OrderTicket ref={ticketRef} order={order} customer={customer} />
    </div>
  );
}
