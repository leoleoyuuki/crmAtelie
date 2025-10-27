
'use client';

import { useCollection } from '@/firebase';
import { Order, OrderItem } from '@/lib/types';
import { useMemo } from 'react';
import { isAfter, isBefore, addDays, compareAsc } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ListChecks } from 'lucide-react';
import { TaskItemCard } from '@/components/tarefas/task-item-card';

// Define a new type that combines OrderItem with parent Order info
export type TaskItem = OrderItem & {
  orderId: string;
  customerName: string;
  dueDate: Date;
  orderStatus: Order['status'];
};

export default function TarefasPage() {
  const { data: orders, loading } = useCollection<Order>('orders');

  const upcomingTasks = useMemo(() => {
    if (!orders) {
      return [];
    }

    const now = new Date();
    const threeDaysFromNow = addDays(now, 3);

    const tasks: TaskItem[] = orders
      .filter(order =>
        // Filter orders that are not completed, have a due date in the future but within the next 3 days
        order.status !== 'Concluído' &&
        order.dueDate &&
        isAfter(order.dueDate, now) &&
        isBefore(order.dueDate, threeDaysFromNow)
      )
      .flatMap(order =>
        // Map each item in the order to a TaskItem
        (order.items || []).map(item => ({
          ...item,
          orderId: order.id,
          customerName: order.customerName,
          dueDate: order.dueDate,
          orderStatus: order.status,
        }))
      );

    // Sort tasks by due date, ascending (sooner tasks first)
    tasks.sort((a, b) => compareAsc(a.dueDate, b.dueDate));

    return tasks;
  }, [orders]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      );
    }

    if (upcomingTasks.length === 0) {
      return (
        <div className="flex justify-center items-center h-full">
          <Alert className="max-w-md">
            <ListChecks className="h-4 w-4" />
            <AlertTitle>Tudo em dia!</AlertTitle>
            <AlertDescription>
              Não há nenhuma tarefa com data de entrega para os próximos 3 dias.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {upcomingTasks.map((task, index) => (
          <TaskItemCard key={`${task.orderId}-${index}`} task={task} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Tarefas do Dia
        </h2>
      </div>
      <p className="text-muted-foreground">
        Itens de pedidos com data de entrega para os próximos 3 dias, priorizados por urgência.
      </p>
      <div className="mt-6 h-[calc(100vh-220px)] overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}
