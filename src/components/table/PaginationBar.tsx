import { useState } from 'react';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTableStore } from '../../store/tableStore';
import { useShallow } from 'zustand/react/shallow';

interface Props {
  totalRows: number;
}

export function PaginationBar({ totalRows }: Props) {
  const { pageIndex, pageSize, setPageIndex, setPageSize } = useTableStore(useShallow(s => ({
    pageIndex: s.pageIndex,
    pageSize: s.pageSize,
    setPageIndex: s.setPageIndex,
    setPageSize: s.setPageSize,
  })));

  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));
  const [jumpValue, setJumpValue] = useState('');

  const go = (i: number) => setPageIndex(Math.max(0, Math.min(i, pageCount - 1)));

  const handleJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const n = parseInt(jumpValue) - 1;
      if (!isNaN(n)) go(n);
      setJumpValue('');
    }
  };

  const start = pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
      <span className="min-w-[120px]">
        {totalRows > 0 ? `${start}–${end} of ${totalRows.toLocaleString()}` : 'No results'}
      </span>

      <div className="flex items-center gap-1">
        <button onClick={() => go(0)} disabled={pageIndex === 0} className="btn-page" title="First">
          <ChevronFirst size={14} />
        </button>
        <button onClick={() => go(pageIndex - 1)} disabled={pageIndex === 0} className="btn-page" title="Previous">
          <ChevronLeft size={14} />
        </button>
        <span className="px-1">
          Page {pageIndex + 1} / {pageCount}
        </span>
        <button onClick={() => go(pageIndex + 1)} disabled={pageIndex >= pageCount - 1} className="btn-page" title="Next">
          <ChevronRight size={14} />
        </button>
        <button onClick={() => go(pageCount - 1)} disabled={pageIndex >= pageCount - 1} className="btn-page" title="Last">
          <ChevronLast size={14} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span>Jump:</span>
        <input
          className="w-12 px-1 py-0.5 border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-800 dark:text-gray-200"
          placeholder="pg"
          value={jumpValue}
          onChange={e => setJumpValue(e.target.value)}
          onKeyDown={handleJump}
        />
        <select
          value={pageSize}
          onChange={e => setPageSize(Number(e.target.value))}
          className="border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-white dark:bg-gray-800 dark:text-gray-200"
        >
          {[25, 50, 100, 250].map(s => (
            <option key={s} value={s}>{s} / page</option>
          ))}
        </select>
      </div>
    </div>
  );
}
