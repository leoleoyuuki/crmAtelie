'use client';

import { useState } from 'react';
import { TaskItem } from '@/app/tarefas/page';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Package, ArrowRight, Tag, ExternalLink } from 'lucide-react';
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { OrderFormDialog } from '@/components/dashboard/order-form-dialog';
import { Order } from '@/lib/types';

interface TaskItemCardProps {
  task: TaskItem;
}

const getDueDateLabel = (dueDate: Date): { text: string, className: string, bg: string } => {
    if (isToday(dueDate)) {
        return { text: 'Entrega Hoje', className: 'text-destructive', bg: 'bg-red-500/10 border-red-200' };
    }
    if (isTomorrow(dueDate)) {
        return { text: 'Entrega Amanhã', className: 'text-orange-600', bg: 'bg-orange-500/10 border-orange-200' };
    }
    if (isPast(dueDate)) {
        return { 
            text: `Atrasado: ${formatDistanceToNow(dueDate, { locale: ptBR })}`,
            className: 'text-destructive font-black uppercase tracking-tighter',
            bg: 'bg-red-500/20 border-red-300 animate-pulse'
        };
    }
    return { 
        text: `Prazo: ${format(dueDate, "dd/MM/yy")}`,
        className: 'text-muted-foreground',
        bg: 'bg-muted/50 border-border'
    };
};

export function TaskItemCard({ task }: TaskItemCardProps) {
  const { text: dueDateText, className: dueDateClassName, bg: dueDateBg } = getDueDateLabel(task.dueDate);

  return (
    <Card className="flex flex-col h-full hover:shadow-xl transition-all duration-300 rounded-3xl border-none shadow-sm overflow-hidden group bg-card">
      <CardHeader className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-headline font-bold leading-tight group-hover:text-primary transition-colors">
                {task.serviceType}
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <Package className="h-3 w-3" />
                <span>#{task.orderId.substring(0, 7).toUpperCase()}</span>
            </div>
          </div>
          <Badge variant={task.orderStatus === 'Novo' ? 'default' : 'secondary'} className="rounded-lg text-[10px] font-bold uppercase py-1">
            {task.orderStatus}
          </Badge>
        </div>
        {task.description && (
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-3">
                "{task.description}"
            </p>
        )}
      </CardHeader>

      <CardContent className="px-6 py-4 flex-grow space-y-4">
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
                <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Cliente</span>
                <span className="text-sm font-bold text-foreground">{task.customerName}</span>
            </div>
        </div>

        {task.assignedTo && (
          <div className="flex items-center gap-3">
            <div className="bg-secondary/10 p-2 rounded-xl">
                <Tag className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Responsável</span>
                <span className="text-sm font-bold text-foreground">{task.assignedTo}</span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-0 border-t mt-auto">
        <div className={cn('flex items-center justify-between w-full px-6 py-4', dueDateBg)}>
            <div className="flex flex-col">
                <span className={cn('text-xs font-black uppercase tracking-tight', dueDateClassName)}>
                    {dueDateText}
                </span>
            </div>
            <div className="bg-background/50 p-1.5 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <ArrowRight className="h-4 w-4" />
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}


interface EditableTaskItemCardProps {
    task: TaskItem;
    order: Order;
}

export function EditableTaskItemCard({ task, order }: EditableTaskItemCardProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    return (
        <>
            <div className="cursor-pointer h-full" onClick={() => setIsEditDialogOpen(true)}>
                <TaskItemCard task={task} />
            </div>
            <OrderFormDialog
                order={order}
                isOpen={isEditDialogOpen}
                setIsOpen={setIsEditDialogOpen}
            />
        </>
    );
}
