import type { Bond } from '../../types/bond';
import { COLUMN_DEFS, colId } from '../../data/columns';
import type { ColumnMeta } from '../../data/columns';

interface Props {
  bonds: Bond[];
  visibleColIds: string[];
  colWidths: Record<string, number>;
  pinLeft: string[];
  pinRight: string[];
}

function aggregate(bonds: Bond[], key: keyof Bond, aggType: string): string {
  const nums = bonds.map(b => b[key] as number).filter(n => typeof n === 'number' && !isNaN(n));
  if (nums.length === 0) return '';
  switch (aggType) {
    case 'sum': {
      const s = nums.reduce((a, b) => a + b, 0);
      return s >= 1_000_000 ? (s / 1_000_000).toFixed(1) + 'M' : s.toFixed(0);
    }
    case 'avg': return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);
    case 'min': return Math.min(...nums).toFixed(2);
    case 'max': return Math.max(...nums).toFixed(2);
    case 'count': return String(bonds.length);
    default: return '';
  }
}

export function SummaryFooter({ bonds, visibleColIds, colWidths, pinLeft, pinRight }: Props) {
  if (bonds.length === 0) return null;

  // Use colId() so accessor-key-only columns are found correctly
  const orderedCols = visibleColIds
    .map(id => COLUMN_DEFS.find(c => colId(c) === id))
    .filter((c): c is typeof COLUMN_DEFS[0] => c != null);

  let leftOffset = 0;

  return (
    <tfoot className="sticky bottom-0 z-10">
      <tr className="bg-slate-100 dark:bg-slate-800 border-t-2 border-slate-300 dark:border-slate-600 font-semibold">
        {orderedCols.map((col, i) => {
          const id = colId(col);
          const meta = col.meta as ColumnMeta | undefined;
          const width = colWidths[id] ?? meta?.defaultWidth ?? 100;
          const isLeftPin = pinLeft.includes(id);
          const isRightPin = pinRight.includes(id);
          const stickyStyle: React.CSSProperties = {};
          if (isLeftPin) { stickyStyle.position = 'sticky'; stickyStyle.left = leftOffset; stickyStyle.zIndex = 11; }
          if (isRightPin) { stickyStyle.position = 'sticky'; stickyStyle.right = 0; stickyStyle.zIndex = 11; }

          const key = (col as { accessorKey?: keyof Bond }).accessorKey;
          const agg = meta?.aggregate;
          const val = key && agg ? aggregate(bonds, key, agg) : i === 0 ? `${bonds.length.toLocaleString()} rows` : '';

          if (isLeftPin) leftOffset += width;

          return (
            <td key={id}
              style={{ width, minWidth: width, maxWidth: width, ...stickyStyle }}
              className={`px-2 py-1.5 text-xs border-r border-slate-200 dark:border-slate-700
                bg-slate-100 dark:bg-slate-800
                ${meta?.align === 'right' ? 'text-right' : meta?.align === 'center' ? 'text-center' : 'text-left'}
                text-slate-600 dark:text-slate-300`}
            >
              {val}
            </td>
          );
        })}
      </tr>
    </tfoot>
  );
}
