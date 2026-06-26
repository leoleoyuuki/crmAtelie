'use client';
import { cn } from '@/lib/utils';

const features = [
  {
    iconPath: '/images/bnbIcons/Mic.png',
    title: 'Voz com IA',
    titleFull: 'Alimentação por Voz com IA',
    description: 'Cadastre novos pedidos, clientes e contas apenas falando. Nossa inteligência artificial interpreta e organiza tudo para você de forma instantânea.',
    videoPath: '/videos/assistente-de-ia.mp4',
    isSpecial: true,
    badge: '✨ Superpoder IA',
    highlights: [
      'Cadastre um pedido completo em menos de 10 segundos falando',
      'Interpretação inteligente de prazos, contatos, valores e descrição',
      'Poupe até 15 minutos por pedido eliminando digitação manual',
    ],
  },
  {
    iconPath: '/images/bnbIcons/ShoppingBag.png',
    title: 'Pedidos & Clientes',
    titleFull: 'Gestão de Pedidos & Clientes',
    description: 'Centralize encomendas, prazos e contatos de forma unificada. Acesse o histórico de compras e as preferências de cada cliente em segundos.',
    videoPath: '/videos/adicionar-e-ver-pedido.mp4',
  },
  {
    iconPath: '/images/bnbIcons/DollarSign.png',
    title: 'Financeiro',
    titleFull: 'Fluxo de Caixa',
    description: 'Monitore entradas, saídas e custos. Veja relatórios claros sobre a saúde financeira do seu ateliê.',
    videoPath: '/videos/registro-de-conta.mp4',
  },
  {
    iconPath: '/images/bnbIcons/CalendarRange.png',
    title: 'Tarefas',
    titleFull: 'Agenda Inteligente',
    description: 'Visualize suas próximas entregas organizadas automaticamente com base na urgência de cada pedido.',
    videoPath: '/videos/agenda.mp4',
  },
  {
    iconPath: '/images/bnbIcons/Calculator.png',
    title: 'Orçamentos',
    titleFull: 'Calculadora de Orçamentos',
    description: 'Calcule preços de serviços com base no tempo gasto, custo de materiais e margem de lucro.',
    videoPath: '/videos/calculadora.mp4',
  },
];

export function AllFeatures() {
  return (
    <section id="recursos" className="relative py-28 sm:py-36 overflow-hidden">
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
        <div className="max-w-6xl mx-auto space-y-40 md:space-y-64 relative">
          
          {/* Linha vertical da timeline decorativa */}
          <div className="absolute left-1/2 top-4 bottom-4 w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-zinc-200/80 dark:via-zinc-800/80 to-transparent hidden md:block pointer-events-none" />

          {features.map((feature, index) => {
            const isEven = index % 2 === 0;

            return (
              <div 
                key={feature.titleFull}
                className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center relative group"
              >
                {/* Indicador/Ponto na linha do tempo */}
                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center z-20 pointer-events-none">
                  {'isSpecial' in feature && feature.isSpecial ? (
                    <div className="w-12 h-12 rounded-full bg-zinc-50 dark:bg-zinc-950 border-2 border-primary/40 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300 relative">
                      <span className="absolute inset-0 rounded-full border border-primary/60 animate-ping opacity-75" />
                      <div className="w-4 h-4 rounded-full shadow-inner bg-primary" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <div className="w-3.5 h-3.5 rounded-full transition-transform duration-300 group-hover:scale-125 shadow-inner bg-primary" />
                    </div>
                  )}
                </div>

                {/* Texto: Alterna ordem baseada no index (Z-Layout) */}
                <div className={cn("space-y-6", isEven ? "md:order-1" : "md:order-2")}>
                  {'badge' in feature && feature.badge && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold select-none">
                      {feature.badge as string}
                    </span>
                  )}
                  
                  <div className="space-y-2">
                    {'isSpecial' in feature && feature.isSpecial ? (
                      <h3 className="text-2xl md:text-5xl font-headline font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent leading-tight">
                        {feature.title}
                      </h3>
                    ) : (
                      <h3 className="text-2xl md:text-4xl font-headline font-bold text-zinc-900 dark:text-white transition-colors duration-300 group-hover:text-primary">
                        {feature.title}
                      </h3>
                    )}
                    <div className="w-12 h-1 rounded-full bg-primary" />
                  </div>
                  
                  <p className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl leading-relaxed font-light max-w-md">
                    {feature.description}
                  </p>

                  {'highlights' in feature && Array.isArray(feature.highlights) && (
                    <ul className="space-y-3 mt-6">
                      {(feature.highlights as string[]).map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-zinc-600 dark:text-zinc-300 text-sm md:text-base leading-relaxed">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-[10px] font-bold mt-0.5">
                            ✓
                          </span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Área do Vídeo/Imagem: Fundo com sua textura de vidro (backdrop-blur) */}
                <div className={cn("relative", isEven ? "md:order-2" : "md:order-1")}>
                  <div className={cn(
                    "relative rounded-3xl p-3 backdrop-blur-xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]",
                    'isSpecial' in feature && feature.isSpecial
                      ? "border-2 border-primary/30 dark:border-primary/50 bg-gradient-to-br from-primary/10 via-white/50 to-orange-500/10 dark:from-primary/10 dark:via-zinc-950/50 dark:to-orange-500/10 p-3.5 shadow-primary/5"
                      : "border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50"
                  )}>
                    
                    {/* Espaço para o seu Vídeo */}
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center relative">
                      <video 
                        src={feature.videoPath} 
                        autoPlay 
                        muted 
                        loop 
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    </div>
                  </div>

                  {/* Decoração sutil de luz atrás do vídeo usando sua cor de acento */}
                  <div className={cn(
                    "absolute -inset-4 blur-3xl opacity-10 -z-10 rounded-full",
                    'isSpecial' in feature && feature.isSpecial
                      ? "bg-gradient-to-r from-primary to-orange-500 opacity-20 animate-pulse duration-[8000ms]"
                      : "bg-primary"
                  )} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}