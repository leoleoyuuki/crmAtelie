
import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface SafariProps extends React.HTMLAttributes<HTMLDivElement> {
  url?: string;
  src?: string;
  imageSrc?: string;
}

export function Safari({ 
  url = "atelierflow.com.br", 
  imageSrc, 
  src, 
  className, 
  ...props 
}: SafariProps) {
  const finalSrc = imageSrc || src;
  
  return (
    <div 
      className={cn(
        "relative rounded-2xl overflow-hidden border border-white/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] bg-zinc-900/5 backdrop-blur-3xl transform-gpu", 
        className
      )} 
      {...props}
    >
      {/* Browser Header */}
      <div className="h-10 w-full bg-white/10 border-b border-white/10 flex items-center px-4 gap-4">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] shadow-inner" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] shadow-inner" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28C840] shadow-inner" />
        </div>
        <div className="flex-1 max-w-md mx-auto h-6 bg-black/10 rounded-md flex items-center justify-center px-3">
          <div className="flex items-center gap-1.5 opacity-40">
            <div className="w-2.5 h-2.5 rounded-sm border border-current" />
            <span className="text-[10px] font-medium tracking-tight text-foreground truncate">{url}</span>
          </div>
        </div>
        <div className="flex gap-3 opacity-20 hidden sm:flex">
            <div className="w-3 h-3 rounded-full border border-current" />
            <div className="w-3 h-3 rounded-sm border border-current" />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative aspect-[16/10] w-full bg-muted/5">
        {finalSrc && (
          <Image
            src={finalSrc}
            alt="AtelierFlow Dashboard Interface"
            fill
            className="object-cover object-top"
            priority
          />
        )}
      </div>
    </div>
  );
}
