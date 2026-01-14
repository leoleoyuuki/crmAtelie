
'use client';

import { useFirebase } from '@/firebase';
import { Order, OrderItem } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';
import { addDays, compareAsc, compareDesc, startOfDay, endOfDay, subDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ListChecks, Search } from 'lucide-react';
import { EditableTaskItemCard } from '@/components/tarefas/task-item-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  
  const [upcomingDays, setUpcomingDays] = useState(3);
  const [overdueDays, setOverdueDays] = useState(7);


  useEffect(() => {
    const fetchTasks = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const now = new Date();
      const todayStart = startOfDay(now);
      const endOfUpcomingRange = endOfDay(addDays(now, upcomingDays));
      const startOfOverdueRange = startOfDay(subDays(now, overdueDays));

      try {
        // Query for upcoming tasks
        const upcomingQuery = query(
          collection(db, 'orders'),
          where('userId', '==', auth.currentUser.uid),
          where('status', 'in', ['Novo', 'Em Processo']),
          where('dueDate', '>=', todayStart),
          where('dueDate', '<=', endOfUpcomingRange),
          orderBy('dueDate', 'asc')
        );

        // Query for overdue tasks
        const overdueQuery = query(
          collection(db, 'orders'),
          where('userId', '==', auth.currentUser.uid),
          where('status', 'in', ['Novo', 'Em Processo']),
          where('dueDate', '<', todayStart),
          where('dueDate', '>=', startOfOverdueRange),
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
  }, [db, auth.currentUser, upcomingDays, overdueDays]);


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
    
    const handleLoadMore = () => {
        setLoading(true); // Show loading skeleton while fetching
        if (type === 'upcoming') {
            setUpcomingDays(prev => prev + 5);
        } else {
            setOverdueDays(prev => prev + 5);
        }
    }

    if (tasks.length === 0) {
      return (
        <div className="flex flex-col justify-center items-center h-full py-16 gap-6">
          {type === 'upcoming' ? (
             <Alert className="max-w-md">
                <ListChecks className="h-4 w-4" />
                <AlertTitle>Tudo em dia!</AlertTitle>
                <AlertDescription>
                  Não há nenhuma tarefa com data de entrega para os próximos {upcomingDays} dias.
                </AlertDescription>
              </Alert>
          ) : (
             <Alert className="max-w-md border-green-500/50 text-green-700">
                <ListChecks className="h-4 w-4 text-green-700" />
                <AlertTitle>Nenhuma pendência!</AlertTitle>
                <AlertDescription>
                  Não há nenhuma tarefa atrasada nos últimos {overdueDays} dias.
                </AlertDescription>
              </Alert>
          )}
          <Button variant="outline" onClick={handleLoadMore}>
            <Search className="mr-2 h-4 w-4" />
             {type === 'upcoming' ? 'Buscar nos próximos 5 dias' : 'Buscar 5 dias antes'}
          </Button>
        </div>
      );
    }

    return (
     <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tasks.map((task, index) => {
            const order = findOrderForTask(task.orderId);
            return order ? (
                <EditableTaskItemCard key={`${task.orderId}-${index}`} task={task} order={order} />
            ) : null;
            })}
        </div>
        <div className="flex justify-center py-6">
            <Button variant="outline" onClick={handleLoadMore}>
                <Search className="mr-2 h-4 w-4" />
                {type === 'upcoming' ? 'Buscar mais 5 dias' : 'Buscar mais 5 dias de atraso'}
            </Button>
        </div>
     </>
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
