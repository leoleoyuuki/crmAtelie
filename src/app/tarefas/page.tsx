
'use client';

import { useFirebase } from '@/firebase';
import { Order, OrderItem } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { Timestamp, getDocs, query, collection, where, orderBy, limit, startAfter, type QuerySnapshot } from 'firebase/firestore';
import { startOfDay } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ListChecks, Search } from 'lucide-react';
import { EditableTaskItemCard } from '@/components/tarefas/task-item-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';


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

const ITEMS_PER_PAGE = 5;

export default function TarefasPage() {
  const { db, auth } = useFirebase();
  const [allTaskOrders, setAllTaskOrders] = useState<Order[]>([]);
  
  // State for Upcoming Tasks
  const [upcomingTasks, setUpcomingTasks] = useState<TaskItem[]>([]);
  const [lastUpcomingDoc, setLastUpcomingDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [hasMoreUpcoming, setHasMoreUpcoming] = useState(true);

  // State for Overdue Tasks
  const [overdueTasks, setOverdueTasks] = useState<TaskItem[]>([]);
  const [lastOverdueDoc, setLastOverdueDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingOverdue, setLoadingOverdue] = useState(true);
  const [hasMoreOverdue, setHasMoreOverdue] = useState(true);

  const [activeTab, setActiveTab] = useState('upcoming');

  const processAndSetTasks = (
    snapshot: QuerySnapshot<DocumentData, DocumentData>,
    type: 'upcoming' | 'overdue'
  ) => {
      const newOrders: Order[] = snapshot.docs.map(doc => convertTimestamps({ ...doc.data(), id: doc.id }) as Order);
      const newTasks = newOrders.flatMap(order =>
          (order.items || []).map(item => ({
              ...item,
              orderId: order.id,
              customerName: order.customerName,
              dueDate: order.dueDate,
              orderStatus: order.status,
          }))
      );
      
      setAllTaskOrders(prev => {
        const existingIds = new Set(prev.map(o => o.id));
        const uniqueNewOrders = newOrders.filter(o => !existingIds.has(o.id));
        return [...prev, ...uniqueNewOrders];
      });

      if (type === 'upcoming') {
          setUpcomingTasks(prev => [...prev, ...newTasks]);
          setHasMoreUpcoming(snapshot.docs.length === ITEMS_PER_PAGE);
      } else {
          setOverdueTasks(prev => [...prev, ...newTasks]);
          setHasMoreOverdue(snapshot.docs.length === ITEMS_PER_PAGE);
      }

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      if (type === 'upcoming') setLastUpcomingDoc(lastDoc || null);
      else setLastOverdueDoc(lastDoc || null);
  };


  const fetchUpcomingTasks = useCallback(async (initial = false) => {
    if (!auth.currentUser || (!initial && !hasMoreUpcoming)) {
      setLoadingUpcoming(false);
      return;
    }
    setLoadingUpcoming(true);

    const todayStart = startOfDay(new Date());
    let q = query(
      collection(db, 'orders'),
      where('userId', '==', auth.currentUser.uid),
      where('status', 'in', ['Novo', 'Em Processo']),
      where('dueDate', '>=', todayStart),
      orderBy('dueDate', 'asc'),
      limit(ITEMS_PER_PAGE)
    );

    if (!initial && lastUpcomingDoc) {
      q = query(q, startAfter(lastUpcomingDoc));
    }
    
    try {
        const snapshot = await getDocs(q);
        processAndSetTasks(snapshot, 'upcoming');
    } catch (error) {
        console.error("Error fetching upcoming tasks:", error);
    } finally {
        setLoadingUpcoming(false);
    }
  }, [auth.currentUser, db, lastUpcomingDoc, hasMoreUpcoming]);

   const fetchOverdueTasks = useCallback(async (initial = false) => {
    if (!auth.currentUser || (!initial && !hasMoreOverdue)) {
      setLoadingOverdue(false);
      return;
    }
    setLoadingOverdue(true);

    const todayStart = startOfDay(new Date());
    let q = query(
      collection(db, 'orders'),
      where('userId', '==', auth.currentUser.uid),
      where('status', 'in', ['Novo', 'Em Processo']),
      where('dueDate', '<', todayStart),
      orderBy('dueDate', 'asc'),
      limit(ITEMS_PER_PAGE)
    );
     if (!initial && lastOverdueDoc) {
      q = query(q, startAfter(lastOverdueDoc));
    }

    try {
        const snapshot = await getDocs(q);
        processAndSetTasks(snapshot, 'overdue');
    } catch (error) {
        console.error("Error fetching overdue tasks:", error);
    } finally {
        setLoadingOverdue(false);
    }
  }, [auth.currentUser, db, lastOverdueDoc, hasMoreOverdue]);


  useEffect(() => {
    if (auth.currentUser) {
      fetchUpcomingTasks(true);
      fetchOverdueTasks(true);
    } else {
      setLoadingUpcoming(false);
      setLoadingOverdue(false);
    }
  }, [auth.currentUser]);


  const findOrderForTask = (taskId: string) => {
    return allTaskOrders?.find(o => o.id === taskId);
  }
  
  const renderTaskList = (tasks: TaskItem[], type: 'upcoming' | 'overdue') => {
    const isLoading = type === 'upcoming' ? loadingUpcoming : loadingOverdue;
    const hasMore = type === 'upcoming' ? hasMoreUpcoming : hasMoreOverdue;
    const handleLoadMore = type === 'upcoming' ? fetchUpcomingTasks : fetchOverdueTasks;
    const noTasksMessage = type === 'upcoming' 
        ? { title: "Tudo em dia!", description: "Não há nenhuma tarefa com data de entrega futura." }
        : { title: "Nenhuma pendência!", description: "Não há nenhuma tarefa atrasada." };

    if (isLoading && tasks.length === 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      );
    }

    if (tasks.length === 0) {
      return (
        <div className="flex flex-col justify-center items-center h-full py-16 gap-6">
          <Alert className={`max-w-md ${type === 'overdue' ? 'border-green-500/50 text-green-700' : ''}`}>
             <ListChecks className={`h-4 w-4 ${type === 'overdue' ? 'text-green-700' : ''}`} />
             <AlertTitle>{noTasksMessage.title}</AlertTitle>
             <AlertDescription>
                {noTasksMessage.description}
             </AlertDescription>
           </Alert>
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
            {hasMore ? (
                <Button variant="outline" onClick={() => handleLoadMore(false)} disabled={isLoading}>
                    <Search className="mr-2 h-4 w-4" />
                    {isLoading ? 'Buscando...' : 'Buscar mais'}
                </Button>
            ) : (
                <p className="text-sm text-muted-foreground">Não há mais tarefas para mostrar.</p>
            )}
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
              {loadingUpcoming && upcomingTasks.length === 0 ? '...' : upcomingTasks.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Atrasadas
             <Badge variant={overdueTasks.length > 0 ? "destructive" : "secondary"} className="ml-2">
              {loadingOverdue && overdueTasks.length === 0 ? '...' : overdueTasks.length}
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
