import { X } from 'lucide-react';
import type { Bond } from '../../types/bond';
import { COLUMN_DEFS } from '../../data/columns';
import type { ColumnMeta } from '../../data/columns';
import { useTableStore } from '../../store/tableStore';
import { useShallow } from 'zustand/react/shallow';

interface Props {
  onClose: () => void;
}

export function CompareModal({ onClose }: Props) {
  const { data, selected } = useTableStore(useShallow(s => ({ data: s.data, selected: s.selected })));
  const bonds = data.filter(b => selected[b.id]);

  const displayCols = COLUMN_DEFS.filter(c => {
    const key = (c as { accessorKey?: string }).accessorKey;
    return key && key !== 'id';
  });

  if (bonds.length < 2) return null;

  const getVal = (bond: Bond, col: typeof COLUMN_DEFS[0]): string => {
    const key = (col as { accessorKey?: keyof Bond }).accessorKey;
    if (!key) return '';
    const raw = bond[key];
    const meta = col.meta as ColumnMeta | undefined;
    if (meta?.format && raw !== null && raw !== undefined) return meta.format(raw);
    return raw == null ? '—' : String(raw);
  };

  const isDiff = (col: typeof COLUMN_DEFS[0]): boolean => {
    const vals = bonds.map(b => getVal(b, col));
    return new Set(vals).size > 1;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            Bond Comparison ({bonds.length} bonds)
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-3 py-2 text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700 w-36">Field</th>
                {bonds.map(b => (
                  <th key={b.id} className="text-left px-3 py-2 text-gray-900 dark:text-gray-100 font-medium border-b border-gray-200 dark:border-gray-700 min-w-[150px]">
                    <div className="font-semibold truncate">{b.ticker}</div>
                    <div className="text-gray-500 font-normal truncate">{b.cusip}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayCols.map(col => {
                const key = (col as { accessorKey?: string }).accessorKey;
                if (!key) return null;
                const meta = col.meta as ColumnMeta | undefined;
                const label = meta?.label ?? key;
                const diff = isDiff(col);
                return (
                  <tr key={key} className={`border-b border-gray-100 dark:border-gray-800 ${diff ? 'bg-amber-50 dark:bg-amber-950/20' : ''}`}>
                    <td className="px-3 py-1.5 text-gray-500 dark:text-gray-400 font-medium">{label}</td>
                    {bonds.map(b => (
                      <td key={b.id} className={`px-3 py-1.5 dark:text-gray-200 ${diff ? 'font-semibold text-amber-800 dark:text-amber-300' : 'text-gray-700'}`}>
                        {getVal(b, col)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
