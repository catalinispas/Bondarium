import { useTableStore } from '../../store/tableStore';
import { summarizeTree } from './FilterBuilder';

interface Props {
  onEdit: () => void;
}

export function ActiveFilterBar({ onEdit }: Props) {
  const filterTree = useTableStore(s => s.filterTree);
  const setFilterTree = useTableStore(s => s.setFilterTree);
  if (!filterTree || filterTree.children.length === 0) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800 flex-shrink-0">
      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex-shrink-0">Filter:</span>
      <button
        onClick={onEdit}
        className="text-xs text-blue-600 dark:text-blue-400 flex-1 truncate font-mono text-left hover:underline"
        title="Click to edit filter"
      >
        {summarizeTree(filterTree)}
      </button>
      <button
        onClick={() => setFilterTree(null)}
        className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 flex-shrink-0 ml-1 px-2 py-0.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
      >
        Clear Filter
      </button>
    </div>
  );
}
