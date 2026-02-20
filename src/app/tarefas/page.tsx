'use client';

import { useFirebase } from '@/firebase';
import { Order, OrderItem } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { Timestamp, getDocs, query, collection, where, orderBy, limit, startAfter, type QuerySnapshot } from 'firebase/firestore';
import { startOfDay } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ListChecks, Search, Sparkles, Clock, AlertCircle } from 'lucide-react';
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

const ITEMS_PER_PAGE = 8;

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-3xl" />
          ))}
        </div>
      );
    }

    if (tasks.length === 0) {
      return (
        <div className="flex flex-col justify-center items-center h-full py-24 gap-6">
          <Alert className={`max-w-md rounded-3xl border-dashed py-10 flex flex-col items-center text-center ${type === 'overdue' ? 'border-green-500/50 bg-green-50/30' : 'border-primary/20 bg-primary/5'}`}>
             <ListChecks className={`h-10 w-10 mb-4 ${type === 'overdue' ? 'text-green-600' : 'text-primary'}`} />
             <div className="space-y-1">
                <AlertTitle className="text-xl font-headline font-bold">{noTasksMessage.title}</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                    {noTasksMessage.description}
                </AlertDescription>
             </div>
           </Alert>
        </div>
      );
    }

    return (
     <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tasks.map((task, index) => {
            const order = findOrderForTask(task.orderId);
            return order ? (
                <EditableTaskItemCard key={`${task.orderId}-${index}`} task={task} order={order} />
            ) : null;
            })}
        </div>
        <div className="flex justify-center py-12">
            {hasMore ? (
                <Button variant="outline" onClick={() => handleLoadMore(false)} disabled={isLoading} className="rounded-xl h-12 px-8 font-bold border-primary text-primary hover:bg-primary/5">
                    <Search className="mr-2 h-4 w-4" />
                    {isLoading ? 'Buscando...' : 'Carregar mais tarefas'}
                </Button>
            ) : (
                <p className="text-sm text-muted-foreground font-medium italic">Você chegou ao fim da lista.</p>
            )}
        </div>
     </>
    );
  }

  return (
    <div className="flex-1 space-y-8 px-4 pt-8 md:px-10 pb-10 flex flex-col">
      <div className="space-y-4">
        <h2 className="text-4xl font-black tracking-tight font-headline text-foreground">
          Painel de Tarefas
        </h2>
        
        <div className="flex items-center gap-6 border-b pb-1 overflow-x-auto no-scrollbar">
            <button 
                onClick={() => setActiveTab('upcoming')}
                className={`text-sm pb-3 whitespace-nowrap transition-all ${activeTab === 'upcoming' ? 'font-bold text-primary border-b-2 border-primary' : 'font-medium text-muted-foreground hover:text-foreground'}`}
            >
                Entregas Próximas
            </button>
            <button 
                onClick={() => setActiveTab('overdue')}
                className={`text-sm pb-3 whitespace-nowrap transition-all ${activeTab === 'overdue' ? 'font-bold text-destructive border-b-2 border-destructive' : 'font-medium text-muted-foreground hover:text-foreground'}`}
            >
                Pendências Atrasadas
            </button>
        </div>
      </div>

      {/* Banner de Status Estilo Patreon */}
      <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-4 flex items-start gap-4">
        <div className="bg-secondary/20 p-2 rounded-xl mt-0.5">
            <AlertCircle className="h-4 w-4 text-secondary-foreground" />
        </div>
        <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">Foco na Produção</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
                Este painel decompõe seus pedidos em itens individuais para que você possa focar em cada etapa da confecção.
            </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8 flex flex-col flex-1">
        <TabsContent value="upcoming" className="flex-1 mt-0 outline-none">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Cronograma de Entrega</h3>
          </div>
          {renderTaskList(upcomingTasks, 'upcoming')}
        </TabsContent>
        <TabsContent value="overdue" className="flex-1 mt-0 outline-none">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-destructive">Itens Prioritários</h3>
          </div>
          {renderTaskList(overdueTasks, 'overdue')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
