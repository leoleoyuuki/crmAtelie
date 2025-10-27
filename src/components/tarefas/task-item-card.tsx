
'use client';

import { TaskItem } from '@/app/tarefas/page';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Tag, Hash, Package } from 'lucide-react';
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TaskItemCardProps {
  task: TaskItem;
}

const getDueDateLabel = (dueDate: Date): { text: string, className: string } => {
    if (isToday(dueDate)) {
        return { text: 'Hoje', className: 'text-destructive font-bold' };
    }
    if (isTomorrow(dueDate)) {
        return { text: 'Amanhã', className: 'text-orange-600 font-semibold' };
    }
    return { 
        text: `em ${formatDistanceToNow(dueDate, { locale: ptBR })}`,
        className: 'text-muted-foreground'
    };
};

export function TaskItemCard({ task }: TaskItemCardProps) {
  const { text: dueDateText, className: dueDateClassName } = getDueDateLabel(task.dueDate);

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-bold leading-tight">{task.serviceType}</CardTitle>
          <Badge variant={task.orderStatus === 'Novo' ? 'default' : 'secondary'}>
            {task.orderStatus}
          </Badge>
        </div>
        {task.description && <CardDescription className="pt-1">"{task.description}"</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm">
        <div className="flex items-center">
          <Package className="h-4 w-4 mr-2 text-muted-foreground" />
          Pedido{' '}
          <Link href={`/print/${task.orderId}`} passHref target="_blank">
             <span className="font-semibold text-primary hover:underline ml-1">#{task.orderId.substring(0, 5)}</span>
          </Link>
        </div>
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="font-semibold">{task.customerName}</span>
        </div>
        {task.assignedTo && (
          <div className="flex items-center">
            <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
            Atribuído a: <span className="font-semibold ml-1">{task.assignedTo}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/50 px-6 py-3 border-t">
        <div className="flex items-center w-full justify-between">
            <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-semibold">{format(task.dueDate, "dd/MM/yyyy")}</span>
            </div>
            <span className={cn('text-sm', dueDateClassName)}>
                {dueDateText}
            </span>
        </div>
      </CardFooter>
    </Card>
  );
}
