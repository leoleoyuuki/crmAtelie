'use client';

import { useEffect } from "react";

/**
 * Hook para rastrear a posição do mouse ou toque dentro de um elemento específico.
 * Útil para efeitos de spotlight, gradientes interativos, etc.
 */
export function useMousePosition(
  ref: React.RefObject<HTMLElement | null>,
  callback?: ({ x, y }: { x: number; y: number }) => void,
) {
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const { top, left } = ref.current?.getBoundingClientRect() || {
        top: 0,
        left: 0,
      };

      callback?.({ x: clientX - left, y: clientY - top });
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 0) return;
      const { clientX, clientY } = event.touches[0];
      const { top, left } = ref.current?.getBoundingClientRect() || {
        top: 0,
        left: 0,
      };

      callback?.({ x: clientX - left, y: clientY - top });
    };

    const nodeRef = ref.current;
    if (nodeRef) {
      nodeRef.addEventListener("mousemove", handleMouseMove);
      nodeRef.addEventListener("touchmove", handleTouchMove);
    }

    return () => {
      if (nodeRef) {
        nodeRef.removeEventListener("mousemove", handleMouseMove);
        nodeRef.removeEventListener("touchmove", handleTouchMove);
      }
    };
  }, [ref, callback]);
}
