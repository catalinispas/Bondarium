import { useState, useEffect } from 'react';
import { X, Plus, Check, Trash2 } from 'lucide-react';
import { useTableStore } from '../store/tableStore';
import { useShallow } from 'zustand/react/shallow';
import { FilterBuilder, summarizeTree } from '../components/table/FilterBuilder';
import type { FilterGroup } from '../types/bond';

const EMPTY_TREE: FilterGroup = { id: 'root', type: 'group', logic: 'AND', children: [] };
const UID = () => Math.random().toString(36).slice(2, 9);
const freshTree = (): FilterGroup => ({ id: UID(), type: 'group', logic: 'AND', children: [] });

export function FiltersPage() {
  const { savedFilters, saveFilter, deleteFilter, setFilterTree, filterTree } = useTableStore(useShallow(s => ({
    savedFilters: s.savedFilters,
    saveFilter: s.saveFilter,
    deleteFilter: s.deleteFilter,
    setFilterTree: s.setFilterTree,
    filterTree: s.filterTree,
  })));

  // null = nothing selected, 'new' = creating, string = editing existing by name
  const [selectedName, setSelectedName] = useState<string | 'new' | null>(null);
  const [editorName, setEditorName] = useState('');
  const [editorTree, setEditorTree] = useState<FilterGroup>(EMPTY_TREE);
  const [nameError, setNameError] = useState('');

  const selectedFilter = selectedName && selectedName !== 'new'
    ? savedFilters.find(f => f.name === selectedName) ?? null
    : null;

  const appliedName = filterTree
    ? savedFilters.find(f => JSON.stringify(f.tree) === JSON.stringify(filterTree))?.name ?? null
    : null;

  const loadFilter = (name: string) => {
    const sf = savedFilters.find(f => f.name === name);
    if (!sf) return;
    setSelectedName(name);
    setEditorName(name);
    setEditorTree(sf.tree);
    setNameError('');
  };

  const startNew = () => {
    setSelectedName('new');
    setEditorName('');
    setEditorTree(freshTree());
    setNameError('');
  };

  const handleSave = () => {
    const name = editorName.trim();
    if (!name) { setNameError('Name is required'); return; }
    const isDuplicate = selectedName !== name && savedFilters.some(f => f.name === name);
    if (isDuplicate) { setNameError('A filter with this name already exists'); return; }
    if (selectedName && selectedName !== 'new' && selectedName !== name) {
      deleteFilter(selectedName);
    }
    saveFilter(name, editorTree);
    setSelectedName(name);
    setNameError('');
  };

  const handleDelete = () => {
    if (!selectedName || selectedName === 'new') return;
    deleteFilter(selectedName);
    setSelectedName(null);
  };

  const handleApply = () => {
    if (editorTree.children.length > 0) setFilterTree(editorTree);
  };

  const handleClearApplied = () => setFilterTree(null);

  const isNew = selectedName === 'new';
  const hasChanges = selectedFilter
    ? editorName !== selectedFilter.name || JSON.stringify(editorTree) !== JSON.stringify(selectedFilter.tree)
    : isNew;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 dark:border-gray-700">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Saved Filters</span>
          <button onClick={startNew} className="btn btn-primary btn-sm">+ New</button>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {savedFilters.length === 0 && !isNew ? (
            <p className="px-3 py-6 text-[10px] text-gray-400 dark:text-gray-500 text-center leading-relaxed">
              No saved filters yet.<br />Click "+ New" to create one.
            </p>
          ) : (
            <>
              {savedFilters.map(sf => {
                const isSelected = selectedName === sf.name;
                const isApplied = appliedName === sf.name;
                return (
                  <div
                    key={sf.name}
                    onClick={() => loadFilter(sf.name)}
                    className={`flex flex-col px-3 py-2 cursor-pointer transition-colors
                      ${isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/50'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`text-xs truncate flex-1 ${isSelected ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-700 dark:text-gray-200'}`}>
                        {sf.name}
                      </span>
                      {isApplied && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-medium flex-shrink-0">
                          active
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                      {summarizeTree(sf.tree)}
                    </span>
                  </div>
                );
              })}
              {isNew && (
                <div className="flex flex-col px-3 py-2 bg-blue-50 dark:bg-blue-950/50">
                  <span className="text-xs text-blue-700 dark:text-blue-300 font-medium italic">New filter…</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Applied filter status */}
        {filterTree && filterTree.children.length > 0 && (
          <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-950/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-blue-700 dark:text-blue-300 font-medium">
                {appliedName ? `"${appliedName}" applied` : 'Custom filter active'}
              </span>
              <button onClick={handleClearApplied} className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300">
                <X size={11} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main editor area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-gray-950">
        {selectedName === null ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
              Select a filter from the list<br />or click <strong>+ New</strong> to create one.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-2xl">
              {/* Filter name */}
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Filter name</label>
                <input
                  className={`input-sm w-full max-w-xs ${nameError ? 'border-red-400' : ''}`}
                  placeholder="e.g. IG Agency Short Duration"
                  value={editorName}
                  onChange={e => { setEditorName(e.target.value); setNameError(''); }}
                />
                {nameError && <p className="text-[10px] text-red-500 mt-0.5">{nameError}</p>}
              </div>

              {/* Filter builder (embedded, no outer card) */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 p-3 mb-4">
                <FilterBuilder
                  onClose={() => setSelectedName(null)}
                  embedded
                  externalTree={editorTree}
                  onTreeChange={setEditorTree}
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={!editorName.trim()}
                >
                  <Check size={12} /> {isNew ? 'Create Filter' : hasChanges ? 'Save Changes' : 'Saved'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleApply}
                  disabled={editorTree.children.length === 0}
                  title="Apply this filter to the Offerings / Portfolio table"
                >
                  Apply to Table
                </button>
                {!isNew && (
                  <button className="btn btn-danger" onClick={handleDelete}>
                    <Trash2 size={12} /> Delete
                  </button>
                )}
                <button
                  className="btn btn-ghost ml-auto text-gray-500"
                  onClick={() => setSelectedName(null)}
                >
                  <X size={12} /> Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
