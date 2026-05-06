"use client";

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
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, UserPlus, ArrowRight, Clock, AlertCircle, Filter, 
  Tags, DollarSign, ChevronLeft, ChevronRight,
  EyeOff, Eye, CheckCircle2, Scissors, Activity, Wallet
} from 'lucide-react';
import { OrderFormDialog } from '@/components/dashboard/order-form-dialog';
import { CustomerFormDialog } from '@/components/dashboard/customer-form-dialog';
import { SaleFormDialog } from '@/components/vendas/sale-form-dialog';
import { PurchaseFormDialog } from '@/components/compras/purchase-form-dialog';
import { FixedCostFormDialog } from '@/components/compras/fixed-cost-form-dialog';
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
import Image from 'next/image';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn, formatCurrency } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────
   PROMO CAROUSEL CARD
   Mimics the branded "sliding feature cards" in the reference
───────────────────────────────────────────────────────────── */
const promoSlides = [

    {
    tag: 'IA de Voz',
    title: 'Assistente Inteligente I.A.',
    subtitle: 'Adicione pedidos, vendas, clientes ou despesas apenas falando.',
    cta: 'Experimentar',
    ctaHref: '/',
    gradient: 'from-[#E8D8C7] via-[#D2A679] to-[#A47148]',
    accent: '#E8D8C7',
    image: '/images/promo/voice-assistant-gpt.png',
    bgImage: '/images/gradientes/verde-laranja-bege.png', 
  },
    {
    tag: 'Financeiro',
    title: 'Veja Seu Lucro Real',
    subtitle: 'Acompanhe receitas, custos e margem em tempo real.',
    cta: 'Ver',
    ctaHref: '/',
    gradient: 'from-[#D9C5B2] via-[#BDA68E] to-[#A1866B]',
    accent: '#BDA68E',
    image: '/images/promo/finance2.png',
  },
   {
    tag: 'Tarefas',
    title: 'Pedidos Prontos a Tempo',
    subtitle: 'Nunca perca um prazo com nossa gestão de pedidos.',
    cta: 'Tarefas',
    ctaHref: '/tarefas',
    gradient: 'from-[#7D8471] via-[#5D6355] to-[#43493E]',
    accent: '#5D6355',
    image: '/images/promo/tasks2.png',
  },

    {
    tag: 'AtelierFlow',
    title: 'Controle Total do Seu Ateliê',
    subtitle: 'Pedidos, clientes e finanças em um só lugar.',
    cta: 'Explorar',
    ctaHref: '/pedidos',
    gradient: 'from-[#4E3422] via-[#A47148] to-[#D2A679]',
    accent: '#D2A679',
    image: '/images/promo/atelier2.png',
    bgImage: '', // Optional: Add a URL here for a full background image
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

  const slide = promoSlides[current] as typeof promoSlides[0] & { bgImage?: string };
  const isTourCard = slide.tag.includes('IA de Voz');

  const handleCtaClick = (e: React.MouseEvent) => {
    if (isTourCard) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('start-voice-tour'));
    }
  };

  return (
    <div className="relative h-full min-h-[220px] sm:min-h-[340px] lg:min-h-0 rounded-2xl overflow-hidden shadow-sm group/carousel">
      {/* Background Layer: Image or Gradient */}
      <div className="absolute inset-0 transition-transform duration-700 group-hover/carousel:scale-105">
        <div
          className={cn('absolute inset-0 bg-gradient-to-br transition-all duration-700', slide.gradient)}
        />
        {slide.bgImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 pointer-events-none" 
            style={{ backgroundImage: `url(${slide.bgImage})` }}
          />
        )}
        {/* Subtle texture for refined look */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] mix-blend-overlay pointer-events-none" />
      </div>
      {/* Decorative circles and blur effects */}
      <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-xl" />
      <div className="absolute top-4 right-8 h-20 w-20 rounded-full bg-white/10 blur-lg" />
      {/* Central-ish blur spots behind text */}
      <div className="absolute top-[40%] left-[20%] h-48 w-48 rounded-full bg-white/10 blur-[80px] pointer-events-none" />
      <div className="absolute top-[60%] left-[45%] h-32 w-32 rounded-full bg-white/5 blur-[50px] pointer-events-none" />

      {/* Content Overlay */}
      <div className="relative z-10 h-full">
        {/* Left Hand: Texts & CTA */}
        <div className="relative z-20 flex flex-col justify-between h-full p-5 sm:p-6 text-white max-w-[100%] sm:max-w-[60%] select-none">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
              {slide.tag}
            </span>
            <div className="flex gap-1.5 lg:hidden">
              <button onClick={prev} className="h-6 w-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button onClick={next} className="h-6 w-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-1.5 relative">
              <div className="absolute -inset-x-8 -inset-y-4 bg-white/5 blur-2xl rounded-full -z-10 pointer-events-none" />
              <h3 className="text-xl sm:text-2xl font-headline font-black leading-tight drop-shadow-md">{slide.title}</h3>
              <p className="text-[13px] sm:text-sm text-white/90 leading-snug drop-shadow-md max-w-[240px]">{slide.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto pt-2">
            <Link href={isTourCard ? '#' : slide.ctaHref} onClick={handleCtaClick}>
              <button className="flex items-center gap-1.5 bg-white text-primary text-[11px] font-black px-4 py-2 rounded-full hover:scale-105 active:scale-95 transition-all shadow-md group/cta">
                {slide.cta}
                <ArrowRight className="h-3 w-3 group-hover/cta:translate-x-0.5 transition-transform" />
              </button>
            </Link>
            {/* Dots */}
            <div className="flex gap-1.5 ml-4">
              {promoSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(i);
                  }}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 3D Illustration - Absolute & Purely Visual */}
        <div className="absolute top-1/2 -translate-y-1/2 -right-4 sm:-right-8 w-[160px] sm:w-[240px] lg:w-[320px] aspect-square flex items-center justify-center pointer-events-none overflow-visible">
          <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl scale-75 animate-pulse" />
          <Image 
            src={slide.image} 
            alt={slide.title}
            width={400}
            height={400}
            className="w-full h-auto object-contain drop-shadow-2xl select-none filter brightness-110 contrast-105"
            priority
          />
        </div>

        {/* Controls - Visible on Tablet/Desktop as overlay */}
        <div className="absolute top-6 right-6 hidden lg:flex gap-1.5 z-30">
          <button onClick={prev} className="h-6 w-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors">
            <ChevronLeft className="h-3 w-3" />
          </button>
          <button onClick={next} className="h-6 w-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors">
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PENDING ORDERS CARD (middle column)
───────────────────────────────────────────────────────────── */
const statusConfig: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  'Novo':               { label: 'Novo',              dot: 'bg-stone-400',        text: 'text-stone-700',       bg: 'bg-stone-100' },
  'Em Processo':        { label: 'Em Processo',       dot: 'bg-[#C26B42]',        text: 'text-[#9B4F2A]',       bg: 'bg-[#FDE8DC]' },
  'Aguardando Retirada':{ label: 'Pronto p/ Retirar', dot: 'bg-[#A67C52]',        text: 'text-[#7A5238]',       bg: 'bg-[#F5ECE0]' },
  'Concluído':          { label: 'Concluído',         dot: 'bg-[#7D8471]',        text: 'text-[#5D6355]',       bg: 'bg-[#EEF0E8]' },
};

function isDueSoon(date: Date): boolean {
  const diff = date.getTime() - Date.now();
  return diff >= 0 && diff < 3 * 24 * 60 * 60 * 1000; // within 3 days
}

function isOverdue(date: Date): boolean {
  return date.getTime() < Date.now();
}

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
      orderBy('dueDate', 'asc'),
      limitFn(4)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const result: Order[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.dueDate instanceof Timestamp) data.dueDate = data.dueDate.toDate();
        if (data.createdAt instanceof Timestamp) data.createdAt = data.createdAt.toDate();
        result.push({ ...data, id: doc.id } as Order);
      });
      setOrders(result);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [db, auth.currentUser]);

  const pending = orders || [];

  return (
    <div className="h-full flex flex-col rounded-2xl border border-muted/40 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <Scissors className="h-3.5 w-3.5 text-[#A67C52]" />
          <h3 className="text-[12px] font-black uppercase tracking-widest text-[#706B57]">Pedidos Pendentes</h3>
        </div>
        <Link href="/pedidos" className="text-[11px] font-bold text-[#A67C52]/80 hover:text-[#A67C52] flex items-center gap-1 transition-colors">
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
        {loading ? (
          <div className="space-y-2 pt-1">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[62px] w-full rounded-xl" />)}
          </div>
        ) : pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center px-4 gap-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-1">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-bold text-muted-foreground">Nenhum pendente</p>
            <p className="text-xs text-muted-foreground">Tudo em dia! 🎉</p>
          </div>
        ) : (
          pending.map(order => {
            const cfg = statusConfig[order.status] || statusConfig['Novo'];
            const overdue = isOverdue(order.dueDate);
            const soon = !overdue && isDueSoon(order.dueDate);
            return (
              <div
                key={order.id}
                className="group flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-muted/30 transition-colors cursor-default"
              >
                {/* Status dot */}
                <div className={cn('h-2 w-2 rounded-full shrink-0 mt-0.5', cfg.dot)} />

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-black text-foreground truncate leading-tight">{order.customerName}</p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {order.items?.[0]?.serviceType}
                    {order.items?.length > 1 && <span className="text-muted-foreground/60"> +{order.items.length - 1}</span>}
                  </p>
                </div>

                {/* Right: value + due date */}
                <div className="shrink-0 text-right flex flex-col items-end gap-0.5">
                  <span className="text-[12px] font-black text-foreground">
                    {order.totalValue?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                  </span>
                  <span className={cn(
                    "text-[10px] font-bold leading-none",
                    overdue ? 'text-[#9B4F2A]' : soon ? 'text-[#C26B42]' : 'text-muted-foreground/70'
                  )}>
                    {overdue ? '⚠ ' : ''}{format(order.dueDate, "dd/MM", { locale: ptBR })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACTIVITY CARD (right column)
───────────────────────────────────────────────────────────── */
function ActivityCard({ summary }: { summary: UserSummary | null }) {
  const { db, auth } = useFirebase();
  const completed = (summary?.totalOrders || 0) - (summary?.pendingOrders || 0);
  const pending = summary?.pendingOrders || 0;
  const effPct = summary?.totalOrders
    ? Math.round((completed / summary.totalOrders) * 100)
    : 0;

  const [recentActivity, setRecentActivity] = useState<Order[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc'),
      limitFn(4)
    );
    const unsub = onSnapshot(q, (snap) => {
      const result: Order[] = [];
      snap.forEach(doc => {
        const data = doc.data();
        if (data.createdAt instanceof Timestamp) data.createdAt = data.createdAt.toDate();
        if (data.dueDate instanceof Timestamp) data.dueDate = data.dueDate.toDate();
        result.push({ ...data, id: doc.id } as Order);
      });
      setRecentActivity(result);
    });
    return () => unsub();
  }, [db, auth.currentUser]);

  return (
    <div className="h-full flex flex-col rounded-2xl border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-[#A67C52]" />
          <h3 className="text-[12px] font-black uppercase tracking-widest text-[#706B57]">Atividade</h3>
        </div>
        <Link href="/tarefas" className="text-[11px] font-bold text-[#A67C52]/80 hover:text-[#A67C52] flex items-center gap-1 transition-colors">
          Ver tarefas <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
        {/* Mini stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center py-2.5 rounded-xl bg-muted/20 border border-muted/40">
            <p className="text-[18px] font-black leading-none">{completed}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mt-0.5">Concluídos</p>
          </div>
          <div className="flex flex-col items-center py-2.5 rounded-xl bg-primary/5 border border-primary/15">
            <p className="text-[18px] font-black leading-none text-primary">{pending}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mt-0.5">Em Aberto</p>
          </div>
          <div className="flex flex-col items-center py-2.5 rounded-xl bg-muted/20 border border-muted/40">
            <p className="text-[18px] font-black leading-none">{summary?.totalOrders || 0}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mt-0.5">Total</p>
          </div>
        </div>

        {/* Efficiency bar */}
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-[10px] font-medium text-muted-foreground">Eficiência de Entrega</span>
              <span className="text-[10px] font-black text-primary">{effPct}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${effPct}%`,
                  background: effPct >= 70 ? '#7D8471' : effPct >= 40 ? '#C26B42' : '#9B4F2A'
                }}
              />
            </div>
          </div>
        </div>

        {/* Recent activity feed */}
        <div className="flex-1 flex flex-col min-h-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-2">Pedidos Recentes</p>
          <div className="space-y-1 overflow-y-auto flex-1">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Sem atividade ainda</p>
            ) : recentActivity.map(order => {
              const cfg = statusConfig[order.status] || statusConfig['Novo'];
              return (
                <div key={order.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-muted/20 transition-colors">
                  <div className={cn('h-1.5 w-1.5 rounded-full shrink-0', cfg.dot)} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold truncate leading-tight">{order.customerName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{order.items?.[0]?.serviceType}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-md', cfg.bg, cfg.text)}>
                      {cfg.label}
                    </span>
                    <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                      {format(order.createdAt, "dd/MM", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   HORIZONTAL STATS STRIP
───────────────────────────────────────────────────────────── */
type StatsStripProps = {
  totalRevenue: number;
  totalProfit: number;
  totalOrders: number;
  pendingOrders: number;
  isPrivacyMode: boolean;
  periodLabel: string;
};

function StatsStrip({ 
  totalRevenue, totalProfit, totalOrders, pendingOrders, isPrivacyMode, periodLabel 
}: StatsStripProps) {
  const { togglePrivacyMode } = useContext(PasswordContext);

  const fmt = (v: number) => isPrivacyMode
    ? '●●●'
    : formatCurrency(v);

  const stats = [
    { label: 'Lucro Real', value: fmt(totalProfit), isPrimary: true },
    { label: 'Faturamento', value: fmt(totalRevenue) },
    { label: 'Pedidos', value: String(totalOrders) },
  ];

  return (
    <div className="bg-card border rounded-2xl shadow-sm px-8 py-4 flex items-center justify-between min-h-[72px]">
      {stats.map((s, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-center relative h-full">
          {/* Vertical Divider */}
          {i > 0 && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-[1px] bg-muted/60" />
          )}
          
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
            {s.label}
          </p>
          <div className="flex items-center gap-1.5 leading-none">
            <p className={cn("text-xl font-black tracking-tight", s.isPrimary ? "text-primary" : "text-foreground")}>
              {s.value}
            </p>
            {s.isPrimary && (
              <button 
                onClick={togglePrivacyMode}
                className="text-muted-foreground/30 hover:text-primary transition-colors"
              >
                {isPrivacyMode ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MOBILE STATS HERO (Image Request)
───────────────────────────────────────────────────────────── */
function StatsHero({ totalRevenue, totalProfit, totalOrders, pendingOrders, isPrivacyMode, periodLabel }: StatsStripProps) {
  const { togglePrivacyMode } = useContext(PasswordContext);

  const fmt = (v: number) => isPrivacyMode 
    ? '●●●' 
    : formatCurrency(v);

  const fmtSmall = (v: number) => isPrivacyMode 
    ? '●●●' 
    : formatCurrency(v);

  const isTotal = periodLabel === 'Total Acumulado';

  return (
    <div className="rounded-3xl shadow-xl shadow-primary/5 overflow-hidden bg-white border border-muted/20 mb-6">
      {/* Orange Grid Header */}
      <div className="relative bg-[#C26B42] p-6 text-white overflow-hidden min-h-[160px] flex flex-col justify-between">
        {/* Subtle Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.12] pointer-events-none" 
          style={{ 
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }} 
        />
        
        <div className="relative z-10 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90">
            {isTotal ? 'Balanço Total' : 'Balanço do Mês'}
          </p>
          <button 
            onClick={togglePrivacyMode}
            className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all active:scale-95"
          >
            {isPrivacyMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="relative z-10 mt-4">
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black tracking-tighter drop-shadow-sm leading-none">{fmt(totalProfit)}</h2>
          </div>
          <p className="text-[10px] font-bold text-white/50 mt-2 uppercase tracking-widest">{periodLabel}</p>
        </div>
      </div>

      {/* Stats Bottom Bar */}
      <div className="grid grid-cols-3 divide-x divide-muted/20 py-5 bg-white">
        <div className="flex flex-col items-center text-center px-1">
          <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1.5">Faturamento</p>
          <p className="text-sm font-black text-[#C26B42] tracking-tight">{fmtSmall(totalRevenue)}</p>
        </div>
        <div className="flex flex-col items-center text-center px-1">
          <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1.5">Pedidos</p>
          <p className="text-sm font-black text-foreground tracking-tight">{totalOrders}</p>
        </div>
        <div className="flex flex-col items-center text-center px-1">
          <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1.5">Pendências</p>
          <p className="text-sm font-black text-[#C26B42] tracking-tight">{pendingOrders}</p>
        </div>
      </div>
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
  const [isFixedCostFormOpen, setIsFixedCostFormOpen] = useState(false);

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
                <DropdownMenuItem onSelect={() => setIsFixedCostFormOpen(true)} className="rounded-xl py-2.5 px-3 cursor-pointer flex flex-col items-start gap-0">
                  <div className="flex items-center gap-2"><Wallet className="h-3.5 w-3.5 text-rose-500" /><span className="font-bold text-sm">Adicionar Conta</span></div>
                  <span className="text-xs text-muted-foreground ml-5.5">Conta fixa ou despesa</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ── MOBILE STATS HERO (Image Request) ──────────────── */}
      <div className="lg:hidden">
        <StatsHero
          totalRevenue={stats.totalRevenue}
          totalProfit={stats.totalProfit}
          totalOrders={stats.totalOrders}
          pendingOrders={stats.pendingOrders}
          isPrivacyMode={isPrivacyMode}
          periodLabel={periodLabel}
        />
      </div>

      {/* ── TOP SECTION: CAROUSEL, PENDING & ACTIVITY ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 flex flex-col gap-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch flex-1">
            {/* Col 1 – Promo Carousel */}
            <div className="h-full">
              <PromoCarousel />
            </div>

            {/* Col 2 – Pending Orders */}
            <div className="h-full min-h-[340px]">
              <PendingOrdersCard />
            </div>
          </div>

          {/* ── HORIZONTAL STATS STRIP ──────────────────────────── */}
          <div className="hidden lg:block">
            <StatsStrip
              totalRevenue={stats.totalRevenue}
              totalProfit={stats.totalProfit}
              totalOrders={stats.totalOrders}
              pendingOrders={stats.pendingOrders}
              isPrivacyMode={isPrivacyMode}
              periodLabel={periodLabel}
            />
          </div>
        </div>

        {/* Col 3 – Activity (Full Height) */}
        <div className="lg:col-span-4 h-full">
          <ActivityCard summary={summary} />
        </div>
      </div>

      {/* ── FINANCIAL CHART ─────────────────────────────────── */}
      <div className="rounded-3xl border bg-card shadow-sm overflow-hidden">
        {/* Gradient accent strip */}
        <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/40" />
        <div className="px-7 py-5 flex items-center justify-between">
          <div>
            <h3 className="font-headline font-bold text-xl tracking-tight">Desempenho Financeiro</h3>
            <p className="text-[11px] font-semibold text-muted-foreground/70 mt-0.5 uppercase tracking-widest">{periodLabel}</p>
          </div>
          <Badge variant="secondary" className="bg-primary/8 text-primary border border-primary/15 font-bold text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-full">
            Receitas &amp; Despesas
          </Badge>
        </div>
        <div className="px-7 pb-7">
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
      <FixedCostFormDialog isOpen={isFixedCostFormOpen} setIsOpen={setIsFixedCostFormOpen} onCostCreated={handleDataMutation} />
    </div>
  );
}
