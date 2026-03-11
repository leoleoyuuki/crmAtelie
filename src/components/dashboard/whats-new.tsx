'use client';

import { Sparkles, ArrowUpRight, Printer, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { useMousePosition } from "@/hooks/use-mouse-position";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import { cn } from "@/lib/utils";

const newsItems = [
    {
        title: "Tickets 58mm",
        icon: Printer,
        link: "/ajuda",
        color: "text-blue-600",
        bg: "bg-blue-500/10"
    },
    {
        title: "Custos Reais",
        icon: Zap,
        link: "/compras",
        color: "text-orange-600",
        bg: "bg-orange-500/10"
    },
    {
        title: "Privacidade",
        icon: ShieldCheck,
        link: "/ajuda",
        color: "text-green-600",
        bg: "bg-green-500/10"
    }
];

export function WhatsNew() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 400 };
    const spotlightX = useSpring(mouseX, springConfig);
    const spotlightY = useSpring(mouseY, springConfig);

    useMousePosition(containerRef, ({ x, y }) => {
        mouseX.set(x);
        mouseY.set(y);
    });

    return (
        <div 
            ref={containerRef} 
            className="relative group overflow-hidden rounded-[2rem] border bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md"
        >
            {/* Spotlight Effect Layer */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            250px circle at ${spotlightX}px ${spotlightY}px,
                            hsl(var(--primary) / 0.12),
                            transparent 80%
                        )
                    `,
                }}
            />
            
            <div className="p-5 space-y-4 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-1.5 rounded-lg">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Novidades</h3>
                </div>
                
                <div className="space-y-1.5">
                    {newsItems.map((item, index) => (
                        <Link 
                            key={index} 
                            href={item.link}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-background transition-all group/item"
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(item.bg, "p-2 rounded-lg shrink-0 transition-transform group-hover/item:scale-110")}>
                                    <item.icon className={cn(item.color, "h-3.5 w-3.5")} />
                                </div>
                                <span className="text-xs font-bold text-foreground/70 group-hover/item:text-foreground transition-colors">{item.title}</span>
                            </div>
                            <div className="bg-muted/50 p-1 rounded-full opacity-0 group-hover/item:opacity-100 transition-all group-hover/item:translate-x-0 -translate-x-2">
                                <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
