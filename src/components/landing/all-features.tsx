'use client';
import { cn } from '@/lib/utils';

const features = [
  {
    iconPath: '/images/bnbIcons/ShoppingBag.png',
    title: 'Pedidos & Clientes',
    titleFull: 'Gestão de Pedidos & Clientes',
    description: 'Centralize encomendas, prazos e contatos de forma unificada. Acesse o histórico de compras e as preferências de cada cliente em segundos.',
    accentColor: 'orange',
  },
  {
    iconPath: '/images/bnbIcons/DollarSign.png',
    title: 'Financeiro',
    titleFull: 'Fluxo de Caixa',
    description: 'Monitore entradas, saídas e custos. Veja relatórios claros sobre a saúde financeira do seu ateliê.',
    accentColor: 'emerald',
  },
  {
    iconPath: '/images/bnbIcons/CalendarRange.png',
    title: 'Tarefas',
    titleFull: 'Agenda Inteligente',
    description: 'Visualize suas próximas entregas organizadas automaticamente com base na urgência de cada pedido.',
    accentColor: 'amber',
  },
  {
    iconPath: '/images/bnbIcons/Printer.png',
    title: 'Comprovantes',
    titleFull: 'Impressão de Comprovantes',
    description: 'Emita comprovantes profissionais em formato térmico de 58mm ou envie o recibo digital direto para o WhatsApp do cliente.',
    accentColor: 'sky',
  },
  {
    iconPath: '/images/bnbIcons/Calculator.png',
    title: 'Orçamentos',
    titleFull: 'Calculadora de Orçamentos',
    description: 'Calcule preços de serviços com base no tempo gasto, custo de materiais e margem de lucro.',
    accentColor: 'indigo',
  },
  {
    iconPath: '/images/bnbIcons/Mic.png',
    title: 'Voz com IA',
    titleFull: 'Alimentação por Voz com IA',
    description: 'Cadastre novos pedidos ou altere o status de uma encomenda apenas falando. Nossa inteligência artificial interpreta e organiza tudo para você.',
    accentColor: 'violet',
  },
  {
    iconPath: '/images/bnbIcons/Lock.png',
    title: 'Privacidade',
    titleFull: 'Modo Privacidade',
    description: 'Esconda valores de faturamento e lucros na tela com um clique, ideal para usar o sistema na frente dos seus clientes.',
    accentColor: 'rose',
  },
];

const accentMap: Record<string, { text: string; dot: string }> = {
  orange: { text: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500' },
  emerald: { text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  amber: { text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  sky: { text: 'text-sky-600 dark:text-sky-400', dot: 'bg-sky-500' },
  indigo: { text: 'text-indigo-600 dark:text-indigo-400', dot: 'bg-indigo-500' },
  violet: { text: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-500' },
  rose: { text: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500' },
};

export function AllFeatures() {
  return (
    <section className="relative py-28 sm:py-36 overflow-hidden">
      {/* ── MANTIDO: Ambient colour blobs da sua identidade ── */}
      <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-primary/[0.06] rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] bg-orange-400/[0.06] rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* ── MANTIDO: Seu Header original ── */}
        <div className="text-center mb-32">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-[0.15em] mb-5">
            ✦ Recursos Premium
          </span>

          <h2 className="text-3xl font-extrabold font-headline tracking-tight sm:text-5xl lg:text-6xl mb-6 text-zinc-900 dark:text-white leading-[1.1]">
            Otimize <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent italic font-serif">cada segundo</span> <br className="hidden md:block" />
            do seu trabalho...
          </h2>
        </div>

        {/* ── NOVO: Estrutura inspirada na image_a3c2b9.png ── */}
        <div className="max-w-6xl mx-auto space-y-40 md:space-y-64">
          {features.map((feature, index) => {
            const a = accentMap[feature.accentColor];
            const isEven = index % 2 === 0;

            return (
              <div 
                key={feature.titleFull}
                className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center"
              >
                {/* Texto: Alterna ordem baseada no index (Z-Layout) */}
                <div className={cn("space-y-6", isEven ? "md:order-1" : "md:order-2")}>
                  <div className="space-y-2">
                    <h3 className={cn("text-2xl md:text-4xl font-headline font-bold transition-colors duration-300", a.text)}>
                      {feature.title}
                    </h3>
                    <div className={cn("w-12 h-1 rounded-full", a.dot)} />
                  </div>
                  
                  <p className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl leading-relaxed font-light max-w-md">
                    {feature.description}
                  </p>
                </div>

                {/* Área do Vídeo/Imagem: Fundo com sua textura de vidro (backdrop-blur) */}
                <div className={cn("relative group", isEven ? "md:order-2" : "md:order-1")}>
                  <div className="relative rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50 p-3 backdrop-blur-xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                    
                    {/* Espaço para o seu Vídeo */}
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                       {/* Substitua por: <video src={...} autoPlay muted loop /> */}
                       <div className="flex flex-col items-center gap-3">
                          <img src={feature.iconPath} alt="" className="w-16 h-16 opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                          <span className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase">Video Demo Here</span>
                       </div>
                    </div>
                  </div>

                  {/* Decoração sutil de luz atrás do vídeo usando sua cor de acento */}
                  <div className={cn("absolute -inset-4 blur-3xl opacity-10 -z-10 rounded-full", a.dot)} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}