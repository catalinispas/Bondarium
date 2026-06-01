import { useState } from 'react';
import { X, Plus, GitBranch, Check, Trash2, Save, BookOpen } from 'lucide-react';
import { useTableStore } from '../../store/tableStore';
import { useShallow } from 'zustand/react/shallow';
import type { FilterGroup, FilterCondition, FilterNode, FilterOperator, SavedFilter } from '../../types/bond';
import { COLUMN_DEFS, colId } from '../../data/columns';
import type { ColumnMeta } from '../../data/columns';

const UID = () => Math.random().toString(36).slice(2, 9);

const OPERATORS_BY_TYPE: Record<string, { value: FilterOperator; label: string }[]> = {
  string: [
    { value: '=', label: '=' },
    { value: '!=', label: '≠' },
    { value: 'contains', label: 'contains' },
    { value: 'starts-with', label: 'starts with' },
    { value: 'in', label: 'in (comma-sep)' },
  ],
  number: [
    { value: '=', label: '=' },
    { value: '!=', label: '≠' },
    { value: '>', label: '>' },
    { value: '>=', label: '≥' },
    { value: '<', label: '<' },
    { value: '<=', label: '≤' },
    { value: 'between', label: 'between' },
  ],
  boolean: [
    { value: 'is-true', label: 'is true' },
    { value: 'is-false', label: 'is false' },
  ],
  date: [
    { value: '=', label: '=' },
    { value: 'before', label: 'before' },
    { value: 'after', label: 'after' },
    { value: 'between', label: 'between' },
  ],
};

const colOptions = COLUMN_DEFS.filter(c => colId(c) !== 'select').map(c => ({
  id: colId(c),
  label: (c.meta as ColumnMeta | undefined)?.label ?? colId(c),
  type: (c.meta as ColumnMeta | undefined)?.type ?? 'string',
}));

function getColType(fieldId: string): string {
  return colOptions.find(c => c.id === fieldId)?.type ?? 'string';
}

// Produce a readable one-line summary of a filter tree
function summarizeTree(group: FilterGroup, depth = 0): string {
  if (group.children.length === 0) return '(empty)';
  const parts = group.children.map(child => {
    if (child.type === 'condition') {
      const c = child as FilterCondition;
      const colLabel = colOptions.find(o => o.id === String(c.field))?.label ?? String(c.field);
      if (c.operator === 'is-true') return `${colLabel} is true`;
      if (c.operator === 'is-false') return `${colLabel} is false`;
      if (c.operator === 'between') return `${colLabel} ${c.value} – ${c.value2 ?? '?'}`;
      return `${colLabel} ${c.operator} ${c.value}`;
    }
    const sub = summarizeTree(child as FilterGroup, depth + 1);
    return depth >= 1 ? `(${sub})` : sub;
  });
  return parts.join(` ${group.logic} `);
}

function ConditionRow({
  condition, onUpdate, onDelete,
}: {
  condition: FilterCondition;
  onUpdate: (updated: FilterCondition) => void;
  onDelete: () => void;
}) {
  const colType = getColType(condition.field as string);
  const ops = OPERATORS_BY_TYPE[colType] ?? OPERATORS_BY_TYPE.string;
  const showBetween = condition.operator === 'between';
  const hideValue = condition.operator === 'is-true' || condition.operator === 'is-false';

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <select
        value={condition.field as string}
        onChange={e => onUpdate({ ...condition, field: e.target.value as keyof import('../../types/bond').Bond, operator: ops[0].value, value: '' })}
        className="select-sm"
      >
        {colOptions.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
      </select>
      <select
        value={condition.operator}
        onChange={e => onUpdate({ ...condition, operator: e.target.value as FilterOperator })}
        className="select-sm"
      >
        {ops.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
      </select>
      {!hideValue && (
        <input
          className="input-sm w-28"
          placeholder="value"
          value={condition.value}
          onChange={e => onUpdate({ ...condition, value: e.target.value })}
        />
      )}
      {showBetween && (
        <>
          <span className="text-xs text-gray-500">and</span>
          <input
            className="input-sm w-28"
            placeholder="value 2"
            value={condition.value2 ?? ''}
            onChange={e => onUpdate({ ...condition, value2: e.target.value })}
          />
        </>
      )}
      <button onClick={onDelete} className="text-gray-400 hover:text-red-500 ml-1">
        <X size={12} />
      </button>
    </div>
  );
}

function GroupNode({
  group, depth, onUpdate, onDelete,
}: {
  group: FilterGroup;
  depth: number;
  onUpdate: (g: FilterGroup) => void;
  onDelete?: () => void;
}) {
  const updateChild = (idx: number, node: FilterNode) => {
    const children = [...group.children];
    children[idx] = node;
    onUpdate({ ...group, children });
  };

  const deleteChild = (idx: number) => {
    onUpdate({ ...group, children: group.children.filter((_, i) => i !== idx) });
  };

  const addCondition = () => {
    const cond: FilterCondition = { id: UID(), type: 'condition', field: 'spread', operator: '>', value: '' };
    onUpdate({ ...group, children: [...group.children, cond] });
  };

  const addGroup = () => {
    const child: FilterGroup = { id: UID(), type: 'group', logic: 'OR', children: [] };
    onUpdate({ ...group, children: [...group.children, child] });
  };

  const borderColors = ['border-blue-300', 'border-purple-300', 'border-amber-300'];

  return (
    <div className={`border-l-2 ${borderColors[depth % borderColors.length]} pl-3 mt-1`}>
      <div className="flex items-center gap-2 mb-1">
        <select
          value={group.logic}
          onChange={e => onUpdate({ ...group, logic: e.target.value as 'AND' | 'OR' })}
          className="select-sm w-16 font-semibold"
        >
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
        <button onClick={addCondition} className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-800">
          <Plus size={11} /> condition
        </button>
        {depth < 2 && (
          <button onClick={addGroup} className="flex items-center gap-0.5 text-xs text-purple-600 hover:text-purple-800">
            <GitBranch size={11} /> group
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="text-gray-400 hover:text-red-500 ml-auto">
            <X size={12} />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {group.children.map((child, i) =>
          child.type === 'condition' ? (
            <ConditionRow
              key={child.id}
              condition={child as FilterCondition}
              onUpdate={updated => updateChild(i, updated)}
              onDelete={() => deleteChild(i)}
            />
          ) : (
            <GroupNode
              key={child.id}
              group={child as FilterGroup}
              depth={depth + 1}
              onUpdate={updated => updateChild(i, updated)}
              onDelete={() => deleteChild(i)}
            />
          )
        )}
      </div>
    </div>
  );
}

// ── Saved Filters Dialog ────────────────────────────────────────────────────

function SavedFiltersDialog({
  savedFilters,
  onApply,
  onDelete,
  onClose,
}: {
  savedFilters: SavedFilter[];
  onApply: (tree: FilterGroup) => void;
  onDelete: (name: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-28"
      onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg mx-4 flex flex-col overflow-hidden"
        style={{ maxHeight: '60vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Saved Filters</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {savedFilters.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">
              No saved filters yet.<br />
              Build a filter and click <strong>Save filter…</strong>
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {savedFilters.map(sf => (
                <div
                  key={sf.name}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800/50"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{sf.name}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { onApply(sf.tree); onClose(); }}
                        className="btn btn-sm btn-primary"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => onDelete(sf.name)}
                        className="text-gray-400 hover:text-red-500 p-0.5"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono leading-relaxed break-words">
                    {summarizeTree(sf.tree)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main FilterBuilder ──────────────────────────────────────────────────────

const EMPTY_TREE: FilterGroup = { id: 'root', type: 'group', logic: 'AND', children: [] };

interface Props {
  onClose: () => void;
}

export function FilterBuilder({ onClose }: Props) {
  const { filterTree, setFilterTree, savedFilters, saveFilter, deleteFilter } = useTableStore(useShallow(s => ({
    filterTree: s.filterTree,
    setFilterTree: s.setFilterTree,
    savedFilters: s.savedFilters,
    saveFilter: s.saveFilter,
    deleteFilter: s.deleteFilter,
  })));

  const [pending, setPending] = useState<FilterGroup>(filterTree ?? EMPTY_TREE);
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState('');

  const isApplied = filterTree !== null && filterTree.children.length > 0;
  const hasPending = pending.children.length > 0;

  const apply = () => setFilterTree(hasPending ? pending : null);

  const remove = () => {
    setPending(EMPTY_TREE);
    setFilterTree(null);
  };

  const commitSave = () => {
    const name = saveName.trim();
    if (!name || !hasPending) return;
    saveFilter(name, pending);
    setSaveName('');
    setSaving(false);
  };

  return (
    <>
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 shadow-md p-3 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
            Filter Formula
            {isApplied && (
              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 normal-case font-normal text-[10px]">
                active
              </span>
            )}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        </div>

        {/* Tree */}
        <GroupNode group={pending} depth={0} onUpdate={g => setPending(g)} />

        {/* Bottom bar */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 flex-wrap">
          <button onClick={apply} disabled={!hasPending} className="btn btn-primary">
            <Check size={11} /> Apply
          </button>

          {isApplied && (
            <button onClick={remove} className="btn btn-danger">
              <Trash2 size={11} /> Remove
            </button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setShowDialog(true)} className="btn btn-secondary">
              <BookOpen size={11} />
              Saved Filters
              {savedFilters.length > 0 && (
                <span className="ml-0.5 px-1 rounded-full bg-gray-200 dark:bg-gray-700 text-[9px] font-semibold">
                  {savedFilters.length}
                </span>
              )}
            </button>

            {!saving ? (
              <button onClick={() => setSaving(true)} disabled={!hasPending} className="btn btn-secondary">
                <Save size={11} /> Save filter…
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  className="input-sm w-32"
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
        </div>
      </div>

      {/* Saved Filters Dialog */}
      {showDialog && (
        <SavedFiltersDialog
          savedFilters={savedFilters}
          onApply={tree => { setPending(tree); setFilterTree(tree); }}
          onDelete={deleteFilter}
          onClose={() => setShowDialog(false)}
        />
      )}
    </>
  );
}
