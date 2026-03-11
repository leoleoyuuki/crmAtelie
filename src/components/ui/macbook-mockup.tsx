
'use client';

import { cn } from "@/lib/utils";
import Image from "next/image";

export function MacbookMockUp({
  className,
  children,
  src,
}: Readonly<{
  className?: string;
  children?: React.ReactNode;
  src?: string;
}>) {
  return (
    <div
      className={cn(
        "relative z-10 mx-0 my-4 max-h-[434px] w-full max-w-[740px] flex flex-col items-center transform-gpu",
        className,
      )}
    >
      {/* Screen Container */}
      <div className="relative z-10 mx-auto my-0 h-[280px] w-[420px] sm:h-[418px] sm:w-[618px] overflow-hidden rounded-[20px] border-2 border-[#c8cacb] px-[9px] pt-[9px] pb-[23px] bg-[#0d0d0d] shadow-2xl">
        {children || (
          <div className="relative h-full w-full overflow-hidden rounded-t-[10px] border-2 border-[#121212]">
            <Image
                alt="AtelierFlow Desktop Preview"
                fill
                className="object-cover object-top"
                src={src || "/images/dashboard1.png"}
                priority
            />
          </div>
        )}
        {/* Bottom Screen Bar */}
        <div className="absolute right-0 bottom-0 left-0 h-6 bg-gradient-to-b from-[#272727] to-[#0d0d0d]" />
      </div>

      {/* Camera/Notch area */}
      <div className="-ml-8 absolute top-[11px] left-1/2 z-20 h-3 w-16 rounded-br rounded-bl bg-[#0d0d0d]" />
      
      {/* Base/Keyboard Part */}
      <div className="-mt-2.5 relative z-10 h-6 w-[480px] sm:w-[740px] rounded-[2px_2px_12px_12px] border-[1px_2px_0px] border-[#a0a3a7] border-solid shadow-[inset_0px_-2px_8px_0px_#6c7074] bg-[radial-gradient(circle,#e2e3e4_85%,#c8cacb_100%)] max-w-full">
        <div className="absolute top-0 left-1/2 -ml-[60px] h-2.5 w-[120px] rounded-b-[10px] shadow-[inset_0_0_4px_2px_#babdbf]" />
      </div>
      
      {/* Rubber Feet */}
      <div className="-bottom-0.5 absolute left-[15%] h-0.5 w-10 rounded-b-full bg-neutral-600/50" />
      <div className="-bottom-0.5 absolute right-[15%] h-0.5 w-10 rounded-b-full bg-neutral-600/50" />
    </div>
  );
}
