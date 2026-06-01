import { useEffect, useRef } from 'react';
import { useTableStore } from '../store/tableStore';
import { useShallow } from 'zustand/react/shallow';

function rnd(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function useLiveData() {
  const { liveMode, data, updateRows } = useTableStore(useShallow(s => ({
    liveMode: s.liveMode,
    data: s.data,
    updateRows: s.updateRows,
  })));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!liveMode) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      const count = 5 + Math.floor(Math.random() * 11);
      const indices = new Set<number>();
      while (indices.size < count && indices.size < data.length) {
        indices.add(Math.floor(Math.random() * data.length));
      }
      const updates: Record<string, Partial<{ price: number; spread: number; priceChange1d: number; spreadChange1d: number }>> = {};
      for (const idx of indices) {
        const bond = data[idx];
        const dp = rnd(-0.5, 0.5);
        const ds = rnd(-10, 10);
        updates[bond.id] = {
          price: Math.max(10, parseFloat((bond.price + dp).toFixed(3))),
          spread: Math.max(0, parseFloat((bond.spread + ds).toFixed(1))),
          priceChange1d: parseFloat((bond.priceChange1d + dp).toFixed(3)),
          spreadChange1d: parseFloat((bond.spreadChange1d + ds).toFixed(1)),
        };
      }
      updateRows(updates);
    }, 2000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [liveMode, data, updateRows]);
}
