
'use client';

import { useCollection, useFirebase } from '@/firebase';
import { Order, OrderItem } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';
import { addDays, compareAsc, compareDesc, startOfDay, endOfDay, subDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ListChecks } from 'lucide-react';
import { EditableTaskItemCard } from '@/components/tarefas/task-item-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';

// Define a new type that combines OrderItem with parent Order info
export type TaskItem = OrderItem & {
  orderId: string;
  customerName: string;
  dueDate: Date;
  orderStatus: Order['status'];
};

// Helper to convert Firestore Timestamps in nested objects
const convertTimestamps = (data: any) => {
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate();
        } else if (typeof data[key] === 'object' && data[key] !== null) {
            convertTimestamps(data[key]);
        }
    }
    return data;
}


export default function TarefasPage() {
  const { db, auth } = useFirebase();
  const [upcomingTasks, setUpcomingTasks] = useState<TaskItem[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [allTaskOrders, setAllTaskOrders] = useState<Order[]>([]);


  useEffect(() => {
    const fetchTasks = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const now = new Date();
      const todayStart = startOfDay(now);
      const threeDaysFromNow = endOfDay(addDays(now, 3));
      const sevenDaysAgo = startOfDay(subDays(now, 7));

      try {
        // Query for upcoming tasks
        const upcomingQuery = query(
          collection(db, 'orders'),
          where('userId', '==', auth.currentUser.uid),
          where('status', 'in', ['Novo', 'Em Processo']),
          where('dueDate', '>=', todayStart),
          where('dueDate', '<=', threeDaysFromNow),
          orderBy('dueDate', 'asc')
        );

        // Query for overdue tasks
        const overdueQuery = query(
          collection(db, 'orders'),
          where('userId', '==', auth.currentUser.uid),
          where('status', 'in', ['Novo', 'Em Processo']),
          where('dueDate', '<', todayStart),
          where('dueDate', '>=', sevenDaysAgo),
          orderBy('dueDate', 'desc')
        );

        const [upcomingSnapshot, overdueSnapshot] = await Promise.all([
          getDocs(upcomingQuery),
          getDocs(overdueQuery)
        ]);
        
        const upcomingOrders: Order[] = upcomingSnapshot.docs.map(doc => convertTimestamps({ ...doc.data(), id: doc.id }) as Order);
        const overdueOrders: Order[] = overdueSnapshot.docs.map(doc => convertTimestamps({ ...doc.data(), id: doc.id }) as Order);

        const allOrders = [...upcomingOrders, ...overdueOrders];
        setAllTaskOrders(allOrders);

        const upcoming = upcomingOrders.flatMap(order =>
          (order.items || []).map(item => ({
            ...item,
            orderId: order.id,
            customerName: order.customerName,
            dueDate: order.dueDate,
            orderStatus: order.status,
          }))
        );

        const overdue = overdueOrders.flatMap(order =>
          (order.items || []).map(item => ({
            ...item,
            orderId: order.id,
            customerName: order.customerName,
            dueDate: order.dueDate,
            orderStatus: order.status,
          }))
        );

        setUpcomingTasks(upcoming);
        setOverdueTasks(overdue);

      } catch (error) {
        console.error("Error fetching tasks:", error);
        // Handle error display to the user if necessary
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [db, auth.currentUser]);


  const findOrderForTask = (taskId: string) => {
    return allTaskOrders?.find(o => o.id === taskId);
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
                 <AlertDescription className="mt-2 text-xs text-green-600">
                    Obs: Apenas tarefas com até 1 semana de atraso são exibidas aqui.
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
    <div className="flex-1 space-y-4 px-4 pt-6 md:px-8 flex flex-col">
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
