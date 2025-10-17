
"use client";

import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the component is rendered and ref is set
      const timer = setTimeout(() => {
        handlePrint();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, handlePrint]);

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
