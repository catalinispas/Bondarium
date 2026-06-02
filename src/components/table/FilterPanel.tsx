import { useState } from 'react';
import { Filter, BookOpen, X, Save, Check, Trash2 } from 'lucide-react';
import { useTableStore } from '../../store/tableStore';
import { useShallow } from 'zustand/react/shallow';
import { QuickFilterChips } from './QuickFilterChips';
import { summarizeTree } from './FilterBuilder';

function Backdrop({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function SavedFiltersModal({ onClose }: { onClose: () => void }) {
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
    <Backdrop onClose={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-[480px] max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Saved Filters</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={14} /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-3 flex flex-col gap-2">
          {savedFilters.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6 leading-relaxed">
              No saved filters yet.<br />Use Advanced Filter to build and save one.
            </p>
          ) : (
            savedFilters.map(sf => (
              <div key={sf.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800/50">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{sf.name}</span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => { setFilterTree(sf.tree); onClose(); }} className="btn btn-primary btn-sm">Apply</button>
                    <button onClick={() => deleteFilter(sf.name)} className="text-gray-400 hover:text-red-500 p-0.5"><Trash2 size={12} /></button>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono leading-relaxed break-words">{summarizeTree(sf.tree)}</p>
              </div>
            ))
          )}
        </div>
        {isFilterActive && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2 flex-shrink-0">
            {!saving ? (
              <button className="btn btn-secondary btn-sm" onClick={() => setSaving(true)}>
                <Save size={11} /> Save current filter…
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <input autoFocus className="input-sm flex-1" placeholder="Filter name…" value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') commitSave(); if (e.key === 'Escape') { setSaving(false); setSaveName(''); } }}
                />
                <button onClick={commitSave} disabled={!saveName.trim()} className="btn btn-primary btn-sm"><Check size={10} /> Save</button>
                <button onClick={() => { setSaving(false); setSaveName(''); }} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>
              </div>
            )}
          </div>
        )}
      </div>
    </Backdrop>
  );
}

interface Props {
  onClose: () => void;
}

export function FilterPanel({ onClose }: Props) {
  const { filterTree, activePresets, savedFilters, setAdvancedFilterOpen } = useTableStore(useShallow(s => ({
    filterTree: s.filterTree,
    activePresets: s.activePresets,
    savedFilters: s.savedFilters,
    setAdvancedFilterOpen: s.setAdvancedFilterOpen,
  })));

  const [showSaved, setShowSaved] = useState(false);

  const hasBuilderActive = filterTree !== null && filterTree.children.length > 0;

  return (
    <>
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 shadow-md p-3 w-full">
        <div className="flex items-center gap-1.5 mb-3">
          <button
            onClick={() => setAdvancedFilterOpen(true)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition-colors
              ${hasBuilderActive
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
          >
            <Filter size={11} />
            Advanced Filter
            {hasBuilderActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
          </button>
          <button
            onClick={() => setShowSaved(true)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors"
          >
            <BookOpen size={11} />
            Saved Filters
            {savedFilters.length > 0 && (
              <span className="px-1 rounded-full text-[9px] font-semibold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {savedFilters.length}
              </span>
            )}
          </button>
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide ml-3">Quick Filters</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-auto">
            <X size={14} />
          </button>
        </div>
        <QuickFilterChips />
      </div>

      {showSaved && <SavedFiltersModal onClose={() => setShowSaved(false)} />}
    </>
  );
}
