
'use client';

import { useEffect, useState, useContext, useMemo, useRef } from 'react';
import { useCollection, useDocument, useFirebase } from '@/firebase';
import { query, collection, where, orderBy, limit as limitFn, onSnapshot, Timestamp } from 'firebase/firestore';
import { Order, UserSummary } from '@/lib/types';
import { getServiceDistributionData, getRevenueChartDataFromSummary, getProfitChartDataFromSummary, getMonths, getOrCreateUserSummary } from '@/lib/data';
import OrderTableShell from '@/components/dashboard/order-table-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { PasswordContext } from '@/contexts/password-context';
import { useUser } from '@/firebase/auth/use-user';
import { ProfitChart } from '@/components/dashboard/profit-chart';
import { WelcomeGuide } from '@/components/dashboard/welcome-guide';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, UserPlus, Sparkles, ArrowRight, Clock, AlertCircle, Filter, 
  Tags, DollarSign, TrendingUp, Package, ClipboardList, ChevronLeft, ChevronRight,
  EyeOff, Eye
} from 'lucide-react';
import { OrderFormDialog } from '@/components/dashboard/order-form-dialog';
import { CustomerFormDialog } from '@/components/dashboard/customer-form-dialog';
import { SaleFormDialog } from '@/components/vendas/sale-form-dialog';
import { PurchaseFormDialog } from '@/components/compras/purchase-form-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────
   PROMO CAROUSEL CARD
   Mimics the branded "sliding feature cards" in the reference
───────────────────────────────────────────────────────────── */
const promoSlides = [
  {
    tag: 'AtelierFlow',
    title: 'Controle Total do Seu Ateliê',
    subtitle: 'Pedidos, clientes e finanças em um só lugar.',
    cta: 'Explorar',
    ctaHref: '/pedidos',
    gradient: 'from-primary/90 via-primary/70 to-primary/40',
    accent: 'hsl(var(--primary))',
  },
  {
    tag: 'Financeiro',
    title: 'Veja Seu Lucro Real',
    subtitle: 'Acompanhe receitas, custos e margem em tempo real.',
    cta: 'Ver gráficos',
    ctaHref: '/',
    gradient: 'from-violet-600/90 via-violet-500/70 to-violet-400/40',
    accent: '#7c3aed',
  },
  {
    tag: 'Tarefas',
    title: 'Pedidos Prontos a Tempo',
    subtitle: 'Nunca perca um prazo com nossa gestão de pedidos.',
    cta: 'Abrir Tarefas',
    ctaHref: '/tarefas',
    gradient: 'from-rose-500/90 via-rose-400/70 to-orange-300/40',
    accent: '#e11d48',
  },
];

function PromoCarousel() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const restart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent(p => (p + 1) % promoSlides.length), 5000);
  };

  useEffect(() => {
    restart();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const goTo = (idx: number) => { setCurrent(idx); restart(); };
  const prev = () => { goTo((current - 1 + promoSlides.length) % promoSlides.length); };
  const next = () => { goTo((current + 1) % promoSlides.length); };

  const slide = promoSlides[current];

  return (
    <div className="relative h-full min-h-[220px] lg:min-h-0 rounded-2xl overflow-hidden select-none">
      {/* Gradient background */}
      <div
        className={cn('absolute inset-0 bg-gradient-to-br transition-all duration-700', slide.gradient)}
      />
      {/* Decorative circles */}
      <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-xl" />
      <div className="absolute top-4 right-8 h-20 w-20 rounded-full bg-white/10 blur-lg" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full p-6 text-white">
        <div className="flex items-start justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
            {slide.tag}
          </span>
          <div className="flex gap-1.5">
            <button onClick={prev} className="h-6 w-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button onClick={next} className="h-6 w-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <h3 className="text-xl font-headline font-black leading-tight">{slide.title}</h3>
          <p className="text-sm text-white/80 leading-relaxed">{slide.subtitle}</p>
        </div>

        <div className="flex items-center justify-between mt-5">
          <Link href={slide.ctaHref}>
            <button className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-full transition-all group">
              {slide.cta}
              <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </Link>
          {/* Dots */}
          <div className="flex gap-1.5">
            {promoSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PENDING ORDERS CARD (middle column)
───────────────────────────────────────────────────────────── */
function PendingOrdersCard() {
  const { db, auth } = useFirebase();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    setLoading(true);
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', auth.currentUser.uid),
      where('status', 'in', ['Novo', 'Em Processo', 'Aguardando Retirada']),
      orderBy('createdAt', 'desc'),
      limitFn(4)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const result: Order[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.dueDate instanceof Timestamp) data.dueDate = data.dueDate.toDate();
        if (data.createdAt instanceof Timestamp) data.createdAt = data.createdAt.toDate();
        if (data.updatedAt instanceof Timestamp) data.updatedAt = data.updatedAt.toDate();
        result.push({ ...data, id: doc.id } as Order);
      });
      setOrders(result);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [db, auth.currentUser]);

  const pending = orders || [];
  
  return (
    <div className="h-full flex flex-col rounded-2xl border border-muted/60 bg-[#FBFAEE] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b bg-transparent">
        <h3 className="text-[13px] font-bold uppercase tracking-widest text-[#706B57]">Pedidos Pendentes</h3>
        <Link href="/pedidos" className="text-xs font-semibold text-[#A67C52] hover:underline flex items-center gap-1">
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto divide-y bg-white">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
          </div>
        ) : pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center px-4 gap-2">
            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-1">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-bold text-muted-foreground">Nenhum pendente</p>
            <p className="text-xs text-muted-foreground">Tudo em dia! 🎉</p>
          </div>
        ) : (
          pending.map(order => (
            <div key={order.id} className="px-5 py-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-extrabold text-slate-800 truncate leading-none">{order.customerName}</p>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {order.items?.[0]?.serviceType} - {format(order.dueDate, "dd/MM", { locale: ptBR })}
                </p>
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px] h-6 px-3 ml-2 shrink-0 font-bold rounded-full border",
                  order.status === 'Novo' && "border-blue-200 bg-blue-50/50 text-blue-700",
                  order.status === 'Em Processo' && "border-yellow-200 bg-yellow-50 text-yellow-700",
                  order.status === 'Aguardando Retirada' && "border-orange-200 bg-orange-50 text-orange-700",
                )}
              >
                {order.status}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACTIVITY CARD (right column)
───────────────────────────────────────────────────────────── */
function ActivityCard({ summary }: { summary: UserSummary | null }) {
  const completed = (summary?.totalOrders || 0) - (summary?.pendingOrders || 0);
  const pending = summary?.pendingOrders || 0;
  const effPct = summary?.totalOrders
    ? Math.round((completed / summary.totalOrders) * 100)
    : 0;

  return (
    <div className="h-full flex flex-col rounded-2xl border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/20">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Atividade</h3>
        <Badge variant="outline" className="text-[9px] h-5 px-2">Geral</Badge>
      </div>

      <div className="flex-1 flex flex-col justify-between p-5 gap-4">
        {/* Quick link */}
        <Link href="/tarefas" className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors group">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/20 p-1.5 rounded-lg shrink-0">
              <AlertCircle className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-bold">Tarefas Críticas</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-black text-primary">{pending}</span>
            <ArrowRight className="h-2.5 w-3 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Mini stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl border bg-muted/20 text-center">
            <p className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5">Concluídos</p>
            <p className="text-2xl font-black leading-tight">{completed}</p>
          </div>
          <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 text-center">
            <p className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5">Em Aberto</p>
            <p className="text-2xl font-black text-primary leading-tight">{pending}</p>
          </div>
        </div>

        {/* Efficiency bar */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">Eficiência de Entrega</span>
            <span className="text-[10px] font-black text-primary ml-auto">{effPct}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-1000" 
              style={{ width: `${effPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   HORIZONTAL STATS STRIP
───────────────────────────────────────────────────────────── */
function StatsStrip({ 
  totalRevenue, totalProfit, totalOrders, pendingOrders, isPrivacyMode, periodLabel 
}: { 
  totalRevenue: number; totalProfit: number; totalOrders: number; pendingOrders: number;
  isPrivacyMode: boolean; periodLabel: string;
}) {
  const { togglePrivacyMode } = useContext(PasswordContext);

  const fmt = (v: number) => isPrivacyMode
    ? '●●●'
    : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(v);

  const stats = [
    { 
      label: 'Lucro Real', value: fmt(totalProfit), icon: TrendingUp, 
      iconBg: 'bg-primary/10', iconColor: 'text-primary', valueColor: 'text-primary',
      highlight: true
    },
    { 
      label: 'Faturamento', value: fmt(totalRevenue), icon: DollarSign, 
      iconBg: 'bg-green-500/10', iconColor: 'text-green-600', valueColor: ''
    },
    { 
      label: 'Pedidos', value: String(totalOrders), icon: Package, 
      iconBg: 'bg-blue-500/10', iconColor: 'text-blue-600', valueColor: ''
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {stats.map((s, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center gap-4 p-4 rounded-2xl border bg-card shadow-sm hover:border-primary/30 transition-colors',
            s.highlight && 'border-primary/20 bg-primary/5'
          )}
        >
          <div className={cn('p-2.5 rounded-xl shrink-0', s.iconBg)}>
            <s.icon className={cn('h-4 w-4', s.iconColor)} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground truncate">{s.label}</p>
            <div className="flex items-center gap-1.5">
              <p className={cn('text-xl font-black tracking-tight leading-tight', s.valueColor)}>
                {s.value}
              </p>
              {i === 0 && (
                <button 
                  onClick={togglePrivacyMode}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isPrivacyMode 
                    ? <EyeOff className="h-3 w-3" /> 
                    : <Eye className="h-3 w-3 opacity-40 hover:opacity-100" />}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useUser();
  const { data: summary, loading: summaryLoading } = useDocument<UserSummary>(user ? `summaries/${user.uid}` : null);
  const { data: recentOrders, loading: ordersLoading, refresh } = useCollection<Order>('orders', {
    limit: 15,
    orderBy: ['createdAt', 'desc']
  });

  const { isPrivacyMode } = useContext(PasswordContext);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [profitData, setProfitData] = useState<{ month: string; revenue: number; cost: number; profit: number }[]>([]);

  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isSaleFormOpen, setIsSaleFormOpen] = useState(false);
  const [isPurchaseFormOpen, setIsPurchaseFormOpen] = useState(false);

  const monthsOptions = useMemo(() => getMonths(), []);

  useEffect(() => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    setSelectedPeriod(currentMonth);
  }, []);

  const stats = useMemo(() => {
    if (!summary) return { totalRevenue: 0, totalProfit: 0, totalOrders: 0, pendingOrders: 0 };
    if (selectedPeriod === 'all') {
      const totalCosts = Object.values(summary.monthlyCosts || {}).reduce((a, c) => a + c, 0);
      return { totalRevenue: summary.totalRevenue, totalProfit: summary.totalRevenue - totalCosts, totalOrders: summary.totalOrders, pendingOrders: summary.pendingOrders };
    }
    const rev = summary.monthlyRevenue?.[selectedPeriod] || 0;
    const cost = summary.monthlyCosts?.[selectedPeriod] || 0;
    return { totalRevenue: rev, totalProfit: rev - cost, totalOrders: summary.monthlyOrders?.[selectedPeriod] || 0, pendingOrders: summary.monthlyPending?.[selectedPeriod] || 0 };
  }, [summary, selectedPeriod]);

  useEffect(() => {
    if (user && !summary && !summaryLoading) getOrCreateUserSummary(user.uid);
  }, [user, summary, summaryLoading]);

  useEffect(() => {
    if (summary) setProfitData(getProfitChartDataFromSummary(summary));
  }, [summary]);

  const loading = summaryLoading || ordersLoading;
  const handleDataMutation = () => refresh();

  const periodLabel = selectedPeriod === 'all'
    ? 'Total Acumulado'
    : monthsOptions.find(m => m.value === selectedPeriod)?.label || 'Mensal';

  return (
    <div className="flex-1 space-y-6 px-4 pt-6 md:px-8 pb-10 max-w-[1600px] mx-auto">

      {/* ── HEADER BAR ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 md:hidden">Página Inicial</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight font-headline leading-tight">
            Olá, {user?.displayName?.split(' ')[0]}.
          </h2>
          <p className="text-muted-foreground text-sm font-medium capitalize">
            {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[170px] h-9 rounded-xl border-dashed bg-primary/5 text-primary font-bold text-xs">
              <Filter className="h-3 w-3 mr-1.5" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Vitalício (Máximo)</SelectItem>
              {monthsOptions.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="hidden md:block">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button className="rounded-xl font-bold shadow-lg shadow-primary/20 h-9">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 rounded-xl p-2">
                <DropdownMenuItem onSelect={() => setIsOrderFormOpen(true)} className="rounded-xl py-2.5 px-3 cursor-pointer flex flex-col items-start gap-0">
                  <div className="flex items-center gap-2"><PlusCircle className="h-3.5 w-3.5 text-primary" /><span className="font-bold text-sm">Novo Pedido</span></div>
                  <span className="text-xs text-muted-foreground ml-5.5">Registre uma nova encomenda</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsSaleFormOpen(true)} className="rounded-xl py-2.5 px-3 cursor-pointer flex flex-col items-start gap-0">
                  <div className="flex items-center gap-2"><Tags className="h-3.5 w-3.5 text-green-600" /><span className="font-bold text-sm">Registrar Venda</span></div>
                  <span className="text-xs text-muted-foreground ml-5.5">Venda direta pronta-entrega</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsCustomerFormOpen(true)} className="rounded-xl py-2.5 px-3 cursor-pointer flex flex-col items-start gap-0">
                  <div className="flex items-center gap-2"><UserPlus className="h-3.5 w-3.5 text-primary" /><span className="font-bold text-sm">Novo Cliente</span></div>
                  <span className="text-xs text-muted-foreground ml-5.5">Cadastre um novo cliente</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsPurchaseFormOpen(true)} className="rounded-xl py-2.5 px-3 cursor-pointer flex flex-col items-start gap-0">
                  <div className="flex items-center gap-2"><DollarSign className="h-3.5 w-3.5 text-secondary" /><span className="font-bold text-sm">Registrar Compra</span></div>
                  <span className="text-xs text-muted-foreground ml-5.5">Compra de material ou insumo</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ── WELCOME GUIDE (only for new users) ─────────────── */}
      <WelcomeGuide />

      {/* ── TOP SECTION: CAROUSEL, PENDING & ACTIVITY ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 flex flex-col gap-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            {/* Col 1 – Promo Carousel */}
            <div className="h-full">
              <PromoCarousel />
            </div>

            {/* Col 2 – Pending Orders */}
            <div className="h-full min-h-[260px]">
              <PendingOrdersCard />
            </div>
          </div>

          {/* ── HORIZONTAL STATS STRIP ──────────────────────────── */}
          <StatsStrip
            totalRevenue={stats.totalRevenue}
            totalProfit={stats.totalProfit}
            totalOrders={stats.totalOrders}
            pendingOrders={stats.pendingOrders}
            isPrivacyMode={isPrivacyMode}
            periodLabel={periodLabel}
          />
        </div>

        {/* Col 3 – Activity (Full Height) */}
        <div className="lg:col-span-4 h-full">
          <ActivityCard summary={summary} />
        </div>
      </div>

      {/* ── FINANCIAL CHART ─────────────────────────────────── */}
      <div className="rounded-3xl border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b bg-muted/5 flex items-center justify-between">
          <div>
            <h3 className="font-headline font-bold text-xl">Desempenho Financeiro</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{periodLabel}</p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
            Faturamento &amp; Lucro
          </Badge>
        </div>
        <div className="p-6">
          <ProfitChart data={profitData} isPrivacyMode={isPrivacyMode} />
        </div>
      </div>

      {/* ── RECENT ORDERS TABLE ─────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-bold text-2xl">Pedidos Recentes</h3>
          <Button asChild variant="link" className="text-primary font-bold p-0 h-auto">
            <Link href="/pedidos">Ver todos <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
          </Button>
        </div>
        <OrderTableShell data={(recentOrders || []).slice(0, 5)} onDataMutated={handleDataMutation} isPrivacyMode={isPrivacyMode} />
      </div>

      {/* ── DIALOGS ─────────────────────────────────────────── */}
      <OrderFormDialog isOpen={isOrderFormOpen} setIsOpen={setIsOrderFormOpen} onOrderCreated={handleDataMutation} />
      <CustomerFormDialog isOpen={isCustomerFormOpen} setIsOpen={setIsCustomerFormOpen} onCustomerCreated={handleDataMutation} onCustomerUpdated={handleDataMutation} />
      <SaleFormDialog isOpen={isSaleFormOpen} setIsOpen={setIsSaleFormOpen} onSaleCreated={handleDataMutation} />
      <PurchaseFormDialog isOpen={isPurchaseFormOpen} setIsOpen={setIsPurchaseFormOpen} onPurchaseCreated={handleDataMutation} />
    </div>
  );
}
