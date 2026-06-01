import { useState } from 'react';
import { X, Save, Check, Trash2 } from 'lucide-react';
import { useTableStore } from '../../store/tableStore';
import { useShallow } from 'zustand/react/shallow';
import { QuickFilterChips } from './QuickFilterChips';
import { FilterBuilder, summarizeTree } from './FilterBuilder';

type FilterTab = 'quick' | 'builder' | 'saved';

interface Props {
  onClose: () => void;
}

function SavedFiltersTab() {
  const { filterTree, setFilterTree, savedFilters, saveFilter, deleteFilter } = useTableStore(useShallow(s => ({
    filterTree: s.filterTree,
    setFilterTree: s.setFilterTree,
    savedFilters: s.savedFilters,
    saveFilter: s.saveFilter,
    deleteFilter: s.deleteFilter,
  })));

  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState('');

  const isFilterActive = filterTree !== null && filterTree.children.length > 0;

  const commitSave = () => {
    const name = saveName.trim();
    if (!name || !filterTree) return;
    saveFilter(name, filterTree);
    setSaveName('');
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-2">
      {savedFilters.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6 leading-relaxed">
          No saved filters yet.<br />
          Build a filter in the Builder tab and save it.
        </p>
      ) : (
        savedFilters.map(sf => (
          <div key={sf.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800/50">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{sf.name}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFilterTree(sf.tree)}
                  className="btn btn-primary btn-sm"
                >
                  Apply
                </button>
                <button onClick={() => deleteFilter(sf.name)} className="text-gray-400 hover:text-red-500 p-0.5">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono leading-relaxed break-words">
              {summarizeTree(sf.tree)}
            </p>
          </div>
        ))
      )}

      {/* Save current active filter */}
      {isFilterActive && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
          {!saving ? (
            <button className="btn btn-secondary btn-sm" onClick={() => setSaving(true)}>
              <Save size={11} /> Save current filter…
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                className="input-sm flex-1"
                placeholder="Filter name…"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitSave();
                  if (e.key === 'Escape') { setSaving(false); setSaveName(''); }
                }}
              />
              <button onClick={commitSave} disabled={!saveName.trim()} className="btn btn-primary btn-sm">
                <Check size={10} /> Save
              </button>
              <button onClick={() => { setSaving(false); setSaveName(''); }} className="text-gray-400 hover:text-gray-600">
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function FilterPanel({ onClose }: Props) {
  const { filterTree, activePresets, savedFilters } = useTableStore(useShallow(s => ({
    filterTree: s.filterTree,
    activePresets: s.activePresets,
    savedFilters: s.savedFilters,
  })));

  const [tab, setTab] = useState<FilterTab>('quick');

  const hasQuickActive = activePresets.length > 0;
  const hasBuilderActive = filterTree !== null && filterTree.children.length > 0;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 shadow-md p-3 w-full">
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
        <TabBtn active={tab === 'quick'} dot={hasQuickActive} onClick={() => setTab('quick')}>
          Quick Filters
        </TabBtn>
        <TabBtn active={tab === 'builder'} dot={hasBuilderActive} onClick={() => setTab('builder')}>
          Builder
        </TabBtn>
        <TabBtn
          active={tab === 'saved'}
          count={savedFilters.length}
          onClick={() => setTab('saved')}
        >
          Saved
        </TabBtn>
        <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <X size={14} />
        </button>
      </div>

      {/* Tab content */}
      {tab === 'quick'   && <QuickFilterChips />}
      {tab === 'builder' && <FilterBuilder onClose={onClose} embedded />}
      {tab === 'saved'   && <SavedFiltersTab />}
    </div>
  );
}

function TabBtn({
  active, dot, count, onClick, children,
}: {
  active: boolean;
  dot?: boolean;
  count?: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors
        ${active
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
    >
      {children}
      {dot && !count && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
      )}
      {!!count && (
        <span className={`px-1 rounded-full text-[9px] font-semibold flex-shrink-0
          ${active ? 'bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
          {count}
        </span>
      )}
    </button>
  );
}
