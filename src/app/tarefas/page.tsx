
'use client';

import { useCollection } from '@/firebase';
import { Order, OrderItem } from '@/lib/types';
import { useMemo, useState } from 'react';
import { isAfter, isBefore, addDays, compareAsc, compareDesc } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ListChecks } from 'lucide-react';
import { EditableTaskItemCard } from '@/components/tarefas/task-item-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';


// Define a new type that combines OrderItem with parent Order info
export type TaskItem = OrderItem & {
  orderId: string;
  customerName: string;
  dueDate: Date;
  orderStatus: Order['status'];
};

export default function TarefasPage() {
  const { data: orders, loading } = useCollection<Order>('orders');
  const [activeTab, setActiveTab] = useState('upcoming');

  const upcomingTasks = useMemo(() => {
    if (!orders) return [];
    const now = new Date();
    // Set time to 00:00:00 to include all of today
    now.setHours(0, 0, 0, 0); 
    const threeDaysFromNow = addDays(now, 4); // To include tasks up to 3 days from now

    const tasks: TaskItem[] = orders
      .filter(order =>
        order.status !== 'Concluído' &&
        order.dueDate &&
        isAfter(order.dueDate, now) &&
        isBefore(order.dueDate, threeDaysFromNow)
      )
      .flatMap(order =>
        (order.items || []).map(item => ({
          ...item,
          orderId: order.id,
          customerName: order.customerName,
          dueDate: order.dueDate,
          orderStatus: order.status,
        }))
      );
    tasks.sort((a, b) => compareAsc(a.dueDate, b.dueDate));
    return tasks;
  }, [orders]);

  const overdueTasks = useMemo(() => {
    if (!orders) return [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const tasks: TaskItem[] = orders
      .filter(order =>
        order.status !== 'Concluído' &&
        order.dueDate &&
        isBefore(order.dueDate, now)
      )
      .flatMap(order =>
        (order.items || []).map(item => ({
          ...item,
          orderId: order.id,
          customerName: order.customerName,
          dueDate: order.dueDate,
          orderStatus: order.status,
        }))
      );
    tasks.sort((a, b) => compareDesc(a.dueDate, b.dueDate)); // Show most recent overdue first
    return tasks;
  }, [orders]);

  const findOrderForTask = (taskId: string) => {
    return orders?.find(o => o.id === taskId);
  }
  
  const renderTaskList = (tasks: TaskItem[], type: 'upcoming' | 'overdue') => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      );
    }

    if (tasks.length === 0) {
      return (
        <div className="flex justify-center items-center h-full py-16">
          {type === 'upcoming' ? (
             <Alert className="max-w-md">
                <ListChecks className="h-4 w-4" />
                <AlertTitle>Tudo em dia!</AlertTitle>
                <AlertDescription>
                  Não há nenhuma tarefa com data de entrega para os próximos 3 dias.
                </AlertDescription>
              </Alert>
          ) : (
             <Alert className="max-w-md border-green-500/50 text-green-700">
                <ListChecks className="h-4 w-4 text-green-700" />
                <AlertTitle>Nenhuma pendência!</AlertTitle>
                <AlertDescription>
                  Não há nenhuma tarefa atrasada no momento.
                </AlertDescription>
              </Alert>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tasks.map((task, index) => {
          const order = findOrderForTask(task.orderId);
          return order ? (
            <EditableTaskItemCard key={`${task.orderId}-${index}`} task={task} order={order} />
          ) : null;
        })}
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 flex flex-col">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Painel de Tarefas
        </h2>
        <p className="text-muted-foreground">
          Acompanhe os itens de pedidos que estão próximos da entrega ou em atraso.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 flex flex-col flex-1">
        <TabsList className="self-start">
          <TabsTrigger value="upcoming">
            Tarefas Próximas
            <Badge variant={upcomingTasks.length > 0 ? "default" : "secondary"} className="ml-2">
              {loading ? '...' : upcomingTasks.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Atrasadas
             <Badge variant={overdueTasks.length > 0 ? "destructive" : "secondary"} className="ml-2">
              {loading ? '...' : overdueTasks.length}
            </Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="flex-1 overflow-y-auto -mx-4 px-4">
          {renderTaskList(upcomingTasks, 'upcoming')}
        </TabsContent>
        <TabsContent value="overdue" className="flex-1 overflow-y-auto -mx-4 px-4">
          {renderTaskList(overdueTasks, 'overdue')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
