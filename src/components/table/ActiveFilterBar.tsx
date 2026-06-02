import { X } from 'lucide-react';
import { useTableStore } from '../../store/tableStore';
import { useShallow } from 'zustand/react/shallow';
import { QUICK_PRESETS } from '../../data/presets';
import { summarizeTree } from './FilterBuilder';

export function ActiveFilterBar() {
  const {
    filterTree, setFilterTree,
    activePresets, togglePreset, clearPresets,
    setAdvancedFilterOpen,
  } = useTableStore(useShallow(s => ({
    filterTree: s.filterTree,
    setFilterTree: s.setFilterTree,
    activePresets: s.activePresets,
    togglePreset: s.togglePreset,
    clearPresets: s.clearPresets,
    setAdvancedFilterOpen: s.setAdvancedFilterOpen,
  })));

  const hasPresets = activePresets.length > 0;
  const hasTree = filterTree !== null && filterTree.children.length > 0;

  if (!hasPresets && !hasTree) return null;

  const clearAll = () => {
    clearPresets();
    setFilterTree(null);
  };

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800 flex-shrink-0 flex-wrap">
      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex-shrink-0">Filter:</span>

      {/* Active preset chips */}
      {hasPresets && (
        <div className="flex items-center gap-1 flex-wrap">
          {activePresets.map(pid => {
            const preset = QUICK_PRESETS.find(p => p.id === pid);
            if (!preset) return null;
            return (
              <span
                key={pid}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white"
              >
                {preset.label}
                <button
                  onClick={() => togglePreset(pid)}
                  className="hover:opacity-75 ml-0.5"
                  title={`Remove ${preset.label}`}
                >
                  <X size={10} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Separator when both active */}
      {hasPresets && hasTree && (
        <span className="text-[10px] font-semibold text-blue-400 dark:text-blue-500 uppercase tracking-wide flex-shrink-0">AND</span>
      )}

      {/* Builder filter formula */}
      {hasTree && (
        <button
          onClick={() => setAdvancedFilterOpen(true)}
          className="text-xs text-blue-600 dark:text-blue-400 font-mono truncate text-left hover:underline flex-1 min-w-0"
          title="Click to edit filter"
        >
          {summarizeTree(filterTree!)}
        </button>
      )}

      {/* Clear all */}
      <button
        onClick={clearAll}
        className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 flex-shrink-0 ml-auto px-2 py-0.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
      >
        Clear All
      </button>
    </div>
  );
}
