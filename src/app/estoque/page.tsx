'use client';

import { useCollection } from '@/firebase';
import { Material } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { MaterialTableShell } from '@/components/estoque/material-table-shell';
import { Archive, Info, Sparkles } from 'lucide-react';

export default function EstoquePage() {
  const { data: materials, loading: loadingMaterials } = useCollection<Material>('materials');

  return (
    <div className="flex-1 space-y-8 px-4 pt-8 md:px-10 pb-10">
      <div className="space-y-4">
        <h2 className="text-4xl font-black tracking-tight font-headline text-foreground">
          Inventário de Materiais
        </h2>
        
        <div className="flex items-center gap-6 border-b pb-1 overflow-x-auto no-scrollbar">
            <button className="text-sm font-bold text-primary border-b-2 border-primary pb-3 whitespace-nowrap">
                Lista de Insumos
            </button>
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground pb-3 whitespace-nowrap transition-colors">
                Alertas de Reposição
            </button>
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground pb-3 whitespace-nowrap transition-colors">
                Relatórios de Consumo
            </button>
        </div>
      </div>

      {/* Banner Informativo Estilo Patreon */}
      <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-4 flex items-start gap-4">
        <div className="bg-secondary/20 p-2 rounded-xl mt-0.5">
            <Archive className="h-4 w-4 text-secondary-foreground" />
        </div>
        <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">Gestão Inteligente</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
                Seu estoque é atualizado automaticamente: as entradas são feitas via <strong>Registro de Compras</strong> e as saídas ao <strong>Concluir um Pedido</strong>.
            </p>
        </div>
      </div>

       {loadingMaterials && !materials?.length ? (
        <Skeleton className="h-[600px] w-full rounded-3xl" />
      ) : (
        <MaterialTableShell 
          data={materials || []}
        />
      )}
    </div>
  );
}
