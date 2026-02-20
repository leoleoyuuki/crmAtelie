
'use client';

import { Card } from "@/components/ui/card";
import { Sparkles, ArrowUpRight, Printer, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

const newsItems = [
    {
        title: "Comprovantes 58mm",
        icon: Printer,
        link: "/ajuda",
        color: "text-blue-600",
        bg: "bg-blue-500/10"
    },
    {
        title: "Controle de Custos",
        icon: Zap,
        link: "/compras",
        color: "text-orange-600",
        bg: "bg-orange-500/10"
    },
    {
        title: "Modo Privacidade",
        icon: ShieldCheck,
        link: "/ajuda",
        color: "text-green-600",
        bg: "bg-green-500/10"
    }
];

export function WhatsNew() {
    return (
        <Card className="p-6 border-primary/20 bg-primary/5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Novidades</h3>
            </div>
            
            <div className="space-y-3">
                {newsItems.map((item, index) => (
                    <Link 
                        key={index} 
                        href={item.link}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-background/50 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className={item.bg + " p-1.5 rounded-md"}>
                                <item.icon className={item.color + " h-3.5 w-3.5"} />
                            </div>
                            <span className="text-xs font-medium">{item.title}</span>
                        </div>
                        <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                ))}
            </div>
        </Card>
    );
}
