'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFirebase, useDocument } from '@/firebase';
import { collection, query, where, orderBy, limit as limitFn, getDocs, getDocsFromCache, getDocsFromServer, Timestamp } from 'firebase/firestore';
import { useUser } from '@/firebase/auth/use-user';
import { UserSummary } from '@/lib/types';
import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn, formatCurrency } from '@/lib/utils';
import { 
  Filter, 
  Search, 
  AlertCircle,
  Calendar,
  ArrowRightLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMonths } from '@/lib/data';

interface CashFlowItem {
  id: string;
  type: 'entrada' | 'saida';
  source: 'pedido' | 'venda' | 'compra' | 'custo_fixo';
  title: string;
  description: string;
  amount: number;
  date: Date;
  rawDate: any;
}

export default function CashFlowPage() {
  const { user } = useUser();
  const { db } = useFirebase();

  // Filter state
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'entrada' | 'saida'>('all');

  // Pagination limit state
  const [limitPerCollection, setLimitPerCollection] = useState(40);
  const [visibleCount, setVisibleCount] = useState(15);
  const [loading, setLoading] = useState(true);

  // Raw fetched items
  const [orders, setOrders] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [fixedCosts, setFixedCosts] = useState<any[]>([]);

  // Get user summary
  const { data: summary, loading: summaryLoading } = useDocument<UserSummary>(
    user ? `summaries/${user.uid}` : null
  );

  const monthsOptions = useMemo(() => getMonths(), []);

  useEffect(() => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    setSelectedPeriod(currentMonth);
  }, []);

  // Fetch all collections with local cache support
  const fetchAllData = useCallback(async (forceServer = false) => {
    if (!user) return;
    setLoading(true);

    const uid = user.uid;

    // Queries
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', uid),
      where('status', '==', 'Concluído'),
      orderBy('createdAt', 'desc'),
      limitFn(limitPerCollection)
    );

    const salesQuery = query(
      collection(db, 'sales'),
      where('userId', '==', uid),
      orderBy('date', 'desc'),
      limitFn(limitPerCollection)
    );

    const purchasesQuery = query(
      collection(db, 'purchases'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limitFn(limitPerCollection)
    );

    const fixedCostsQuery = query(
      collection(db, 'fixedCosts'),
      where('userId', '==', uid),
      orderBy('date', 'desc'),
      limitFn(limitPerCollection)
    );

    const getSnapshots = async (q: any) => {
      if (forceServer) {
        return getDocsFromServer(q);
      }
      try {
        const snap = await getDocsFromCache(q);
        if (snap.empty) {
          return getDocsFromServer(q);
        }
        return snap;
      } catch {
        return getDocsFromServer(q);
      }
    };

    try {
      const [ordersSnap, salesSnap, purchasesSnap, fixedCostsSnap] = await Promise.all([
        getSnapshots(ordersQuery),
        getSnapshots(salesQuery),
        getSnapshots(purchasesQuery),
        getSnapshots(fixedCostsQuery)
      ]);

      const mapDocDate = (doc: any, dateField: string) => {
        const data = doc.data();
        let dateVal = data[dateField];
        if (dateVal instanceof Timestamp) {
          dateVal = dateVal.toDate();
        } else if (typeof dateVal === 'string') {
          dateVal = new Date(dateVal);
        } else if (!dateVal) {
          dateVal = new Date();
        }
        return { ...data, id: doc.id, [dateField]: dateVal };
      };

      setOrders(ordersSnap.docs.map(doc => mapDocDate(doc, 'createdAt')));
      setSales(salesSnap.docs.map(doc => mapDocDate(doc, 'date')));
      setPurchases(purchasesSnap.docs.map(doc => mapDocDate(doc, 'createdAt')));
      setFixedCosts(fixedCostsSnap.docs.map(doc => mapDocDate(doc, 'date')));

    } catch (error) {
      console.error("Erro ao carregar fluxo de caixa:", error);
    } finally {
      setLoading(false);
    }
  }, [db, user, limitPerCollection]);

  // Handle Mount and global sync force event
  useEffect(() => {
    fetchAllData(false);
  }, [fetchAllData]);

  useEffect(() => {
    const handleForceSync = () => {
      fetchAllData(true);
    };
    window.addEventListener('firebase-sync-force', handleForceSync);
    return () => {
      window.removeEventListener('firebase-sync-force', handleForceSync);
    };
  }, [fetchAllData]);

  // Combine and normalize items
  const normalizedItems = useMemo(() => {
    const list: CashFlowItem[] = [];

    // 1. Orders
    orders.forEach(o => {
      list.push({
        id: o.id,
        type: 'entrada',
        source: 'pedido',
        title: 'Pedido Concluído',
        description: `Cliente: ${o.customerName || 'Não informado'}`,
        amount: o.totalValue || 0,
        date: o.createdAt,
        rawDate: o.createdAt
      });
    });

    // 2. Sales
    sales.forEach(s => {
      list.push({
        id: s.id,
        type: 'entrada',
        source: 'venda',
        title: 'Venda Direta',
        description: s.description || 'Venda de produto pronta-entrega',
        amount: s.price || 0,
        date: s.date,
        rawDate: s.date
      });
    });

    // 3. Purchases
    purchases.forEach(p => {
      list.push({
        id: p.id,
        type: 'saida',
        source: 'compra',
        title: 'Compra de Material',
        description: `${p.quantity || 1}x ${p.materialName || 'Material'}`,
        amount: p.cost || 0,
        date: p.createdAt,
        rawDate: p.createdAt
      });
    });

    // 4. Fixed Costs
    fixedCosts.forEach(fc => {
      list.push({
        id: fc.id,
        type: 'saida',
        source: 'custo_fixo',
        title: fc.description || 'Custo Fixo',
        description: 'Despesa ou conta fixa paga',
        amount: fc.cost || 0,
        date: fc.date,
        rawDate: fc.date
      });
    });

    // Sort all descending by date
    return list.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [orders, sales, purchases, fixedCosts]);

  // Filter items by search, type and selectedPeriod
  const filteredItems = useMemo(() => {
    return normalizedItems.filter(item => {
      // 1. Type Filter
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;

      // 2. Period Filter
      if (selectedPeriod !== 'all') {
        const itemMonthKey = format(item.date, 'yyyy-MM');
        if (itemMonthKey !== selectedPeriod) return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(queryLower);
        const matchesDesc = item.description.toLowerCase().includes(queryLower);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });
  }, [normalizedItems, typeFilter, selectedPeriod, searchQuery]);

  // Calculate current visible list
  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  // Group items by day for a beautiful timeline layout
  const groupedItemsByDay = useMemo(() => {
    const groups: { [key: string]: CashFlowItem[] } = {};
    visibleItems.forEach(item => {
      let groupKey = '';
      if (isToday(item.date)) {
        groupKey = 'Hoje';
      } else if (isYesterday(item.date)) {
        groupKey = 'Ontem';
      } else {
        groupKey = format(item.date, "dd 'de' MMMM", { locale: ptBR });
      }
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });
    return Object.entries(groups);
  }, [visibleItems]);

  // Handle Load More
  const handleLoadMore = () => {
    if (visibleCount + 15 > filteredItems.length && normalizedItems.length >= limitPerCollection) {
      setLimitPerCollection(prev => prev + 40);
    }
    setVisibleCount(prev => prev + 15);
  };

  // Summary Metrics based on selected period
  const stats = useMemo(() => {
    if (!summary) return { revenue: 0, cost: 0, profit: 0 };
    if (selectedPeriod === 'all') {
      const totalCosts = Object.values(summary.monthlyCosts || {}).reduce((a, c) => a + c, 0);
      return {
        revenue: summary.totalRevenue || 0,
        cost: totalCosts,
        profit: (summary.totalRevenue || 0) - totalCosts
      };
    }
    const rev = summary.monthlyRevenue?.[selectedPeriod] || 0;
    const cost = summary.monthlyCosts?.[selectedPeriod] || 0;
    return {
      revenue: rev,
      cost: cost,
      profit: rev - cost
    };
  }, [summary, selectedPeriod]);

  const periodLabel = selectedPeriod === 'all'
    ? 'Total Acumulado'
    : monthsOptions.find(m => m.value === selectedPeriod)?.label || 'Mensal';

  return (
    <div className="flex-1 space-y-6 px-4 pt-6 md:px-8 pb-10 max-w-[1600px] mx-auto">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">Controle Financeiro</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight font-headline leading-tight text-foreground">
            Balanço e Fluxo
          </h2>
          <p className="text-muted-foreground text-sm font-medium">
            Linha do tempo consolidada de suas entradas e saídas de caixa.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={(val) => {
            setSelectedPeriod(val);
            setVisibleCount(15);
          }}>
            <SelectTrigger className="w-[175px] h-9 rounded-xl border-dashed bg-primary/5 text-primary font-bold text-xs">
              <Filter className="h-3.5 w-3.5 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Todo o Histórico</SelectItem>
              {monthsOptions.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* BNB / AIRBNB ICON STYLE WHITE SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Lucro Real Card */}
        <div className="group bg-white border border-muted/40 rounded-2xl py-8 px-6 shadow-sm flex items-center justify-between min-h-[140px] hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Lucro Líquido</p>
            {summaryLoading ? (
              <Skeleton className="h-7 w-32 rounded-lg" />
            ) : (
              <h3 className={cn("text-2xl font-black tracking-tight font-headline", stats.profit >= 0 ? "text-primary" : "text-rose-600")}>
                {formatCurrency(stats.profit)}
              </h3>
            )}
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">{periodLabel}</p>
          </div>
          <div className="h-20 w-20 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
            <img src="/images/bnbIcons/Wallet.png" alt="Lucro" className="h-full w-full object-contain" onError={(e) => {
              e.currentTarget.style.display = 'none';
            }} />
          </div>
        </div>

        {/* Faturamento Card */}
        <div className="group bg-white border border-muted/40 rounded-2xl py-8 px-6 shadow-sm flex items-center justify-between min-h-[140px] hover:border-emerald-500/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Entradas (Faturamento)</p>
            {summaryLoading ? (
              <Skeleton className="h-7 w-32 rounded-lg" />
            ) : (
              <h3 className="text-2xl font-black tracking-tight font-headline text-emerald-600">
                {formatCurrency(stats.revenue)}
              </h3>
            )}
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Pedidos + Vendas</p>
          </div>
          <div className="h-20 w-20 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
            <img src="/images/bnbIcons/DollarSign.png" alt="Entradas" className="h-full w-full object-contain" onError={(e) => {
              e.currentTarget.style.display = 'none';
            }} />
          </div>
        </div>

        {/* Despesas Card */}
        <div className="group bg-white border border-muted/40 rounded-2xl py-8 px-6 shadow-sm flex items-center justify-between min-h-[140px] hover:border-rose-500/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Saídas (Custo Real)</p>
            {summaryLoading ? (
              <Skeleton className="h-7 w-32 rounded-lg" />
            ) : (
              <h3 className="text-2xl font-black tracking-tight font-headline text-rose-600">
                {formatCurrency(stats.cost)}
              </h3>
            )}
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Despesas + Compras</p>
          </div>
          <div className="h-20 w-20 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
            <img src="/images/bnbIcons/Calculator.png" alt="Saídas" className="h-full w-full object-contain" onError={(e) => {
              e.currentTarget.style.display = 'none';
            }} />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-card border rounded-2xl p-4 shadow-sm">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar lançamentos..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 rounded-xl bg-muted/20 text-xs font-semibold"
          />
        </div>

        <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar">
          <button 
            onClick={() => { setTypeFilter('all'); setVisibleCount(15); }}
            className={cn(
              "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap",
              typeFilter === 'all' 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            Todos
          </button>
          <button 
            onClick={() => { setTypeFilter('entrada'); setVisibleCount(15); }}
            className={cn(
              "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap",
              typeFilter === 'entrada' 
                ? "bg-emerald-500/10 text-emerald-700 border border-emerald-200/20" 
                : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50"
            )}
          >
            Entradas
          </button>
          <button 
            onClick={() => { setTypeFilter('saida'); setVisibleCount(15); }}
            className={cn(
              "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap",
              typeFilter === 'saida' 
                ? "bg-rose-500/10 text-rose-700 border border-rose-200/20" 
                : "text-rose-600 hover:text-rose-700 hover:bg-rose-50/50"
            )}
          >
            Saídas
          </button>
        </div>
      </div>

      {/* TIMELINE TRANSACTION LIST */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <ArrowRightLeft className="h-3 w-3" /> Lançamentos Recentes
          </h3>
          <span className="text-[10px] font-bold text-muted-foreground/80">
            {visibleItems.length} de {filteredItems.length} registros
          </span>
        </div>

        {loading && visibleItems.length === 0 ? (
          <div className="space-y-4">
            {[1, 2].map(grp => (
              <div key={grp} className="space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <div className="bg-white border rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-muted/40 rounded-2xl shadow-sm">
            <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-bold text-foreground">Nenhum lançamento no período</p>
            <p className="text-xs text-muted-foreground/75 mt-1 max-w-[280px]">
              Insira registros de vendas, pedidos concluídos ou despesas para visualizar o fluxo de caixa.
            </p>
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[1px] before:bg-muted/50">
            {groupedItemsByDay.map(([day, dayItems]) => (
              <div key={day} className="space-y-2 relative">
                {/* Timeline Header Label */}
                <div className="flex items-center gap-2 relative z-10">
                  <div className="h-3 w-3 rounded-full bg-white border-2 border-primary shrink-0 ml-[18px]" />
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80 bg-background px-1.5 rounded">
                    {day}
                  </h4>
                </div>

                {/* Timeline Items Group */}
                <div className="pl-12 space-y-2">
                  {dayItems.map(item => {
                    const isEntrada = item.type === 'entrada';
                    // Determine which BNB PNG icon to use
                    let iconName = 'DollarSign.png';
                    if (item.source === 'pedido') iconName = 'ShoppingBag.png';
                    else if (item.source === 'venda') iconName = 'Tags.png';
                    else if (item.source === 'compra') iconName = 'DollarSign.png';
                    else if (item.source === 'custo_fixo') iconName = 'Wallet.png';

                    return (
                      <div 
                        key={item.id} 
                        className="group bg-white border border-muted/40 rounded-2xl p-4 shadow-sm hover:border-primary/20 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* BNB Icon container */}
                          <div className="h-10 w-10 rounded-full bg-muted/20 flex items-center justify-center p-2 shrink-0">
                            <img 
                              src={`/images/bnbIcons/${iconName}`} 
                              alt={item.source} 
                              className="h-full w-full object-contain"
                              onError={(e) => {
                                // fallback to default
                                e.currentTarget.src = '/images/bnbIcons/DollarSign.png';
                              }}
                            />
                          </div>

                          {/* Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[13px] font-bold text-foreground truncate">{item.title}</span>
                              {/* Source Badges with cohesive styles */}
                              {item.source === 'pedido' && (
                                <Badge variant="secondary" className="bg-orange-500/5 text-orange-700 border border-orange-200/20 text-[8px] font-bold px-1 py-0.2 rounded-md">
                                  Pedido
                                </Badge>
                              )}
                              {item.source === 'venda' && (
                                <Badge variant="secondary" className="bg-emerald-500/5 text-emerald-700 border border-emerald-200/20 text-[8px] font-bold px-1 py-0.2 rounded-md">
                                  Venda
                                </Badge>
                              )}
                              {item.source === 'compra' && (
                                <Badge variant="secondary" className="bg-amber-500/5 text-amber-700 border border-amber-200/20 text-[8px] font-bold px-1 py-0.2 rounded-md">
                                  Compra
                                </Badge>
                              )}
                              {item.source === 'custo_fixo' && (
                                <Badge variant="secondary" className="bg-rose-500/5 text-rose-700 border border-rose-200/20 text-[8px] font-bold px-1 py-0.2 rounded-md">
                                  Fixo
                                </Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5 max-w-[240px] sm:max-w-md">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Value and indicator */}
                        <div className="text-right shrink-0 ml-2">
                          <span className={cn(
                            "text-sm font-black tracking-tight font-headline",
                            isEntrada ? "text-emerald-600" : "text-rose-600"
                          )}>
                            {isEntrada ? '+' : '-'} {formatCurrency(item.amount)}
                          </span>
                          <div className="flex items-center justify-end gap-1 mt-0.5 text-[9px] text-muted-foreground/60 font-bold uppercase tracking-wider">
                            <Calendar className="h-2.5 w-2.5" />
                            {format(item.date, "HH:mm")}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredItems.length > visibleItems.length && (
          <div className="flex justify-center pt-2">
            <Button 
              variant="outline" 
              onClick={handleLoadMore}
              className="rounded-xl border-muted-foreground/20 font-bold h-9 px-6 text-xs hover:bg-[#A67C52]/5 hover:text-[#A67C52] transition-all"
            >
              Carregar Mais Lançamentos
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}
