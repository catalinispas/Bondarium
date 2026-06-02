import { X, Plus, Trash2 } from 'lucide-react';
import { useTableStore } from '../../store/tableStore';
import { useShallow } from 'zustand/react/shallow';
import type { ConditionalRule, FilterOperator } from '../../types/bond';
import { COLUMN_DEFS, colId } from '../../data/columns';
import type { ColumnMeta } from '../../data/columns';

const UID = () => Math.random().toString(36).slice(2, 9);

const OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: '>', label: '>' }, { value: '>=', label: '≥' },
  { value: '<', label: '<' }, { value: '<=', label: '≤' },
  { value: '=', label: '=' }, { value: '!=', label: '≠' },
  { value: 'contains', label: 'contains' },
];

const colOptions = COLUMN_DEFS.filter(c => colId(c) !== 'select').map(c => ({
  id: colId(c),
  label: (c.meta as ColumnMeta | undefined)?.label ?? colId(c),
}));

interface Props {
  onClose: () => void;
}

export function ConditionalFormat({ onClose }: Props) {
  const { conditionalRules, setConditionalRules } = useTableStore(useShallow(s => ({
    conditionalRules: s.conditionalRules,
    setConditionalRules: s.setConditionalRules,
  })));

  const add = () => {
    const rule: ConditionalRule = {
      id: UID(),
      column: 'spread',
      operator: '>',
      value: '300',
      bgColor: '#fef9c3',
      textColor: '#713f12',
      label: 'New rule',
    };
    setConditionalRules([...conditionalRules, rule]);
  };

  const update = (id: string, patch: Partial<ConditionalRule>) => {
    setConditionalRules(conditionalRules.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  const del = (id: string) => {
    setConditionalRules(conditionalRules.filter(r => r.id !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      {conditionalRules.map(rule => (
        <div key={rule.id} className="flex items-center gap-1.5 flex-wrap bg-gray-50 dark:bg-gray-800 rounded p-2">
          <input
            className="input-sm w-24"
            placeholder="Label"
            value={rule.label}
            onChange={e => update(rule.id, { label: e.target.value })}
          />
          <select
            value={rule.column as string}
            onChange={e => update(rule.id, { column: e.target.value as keyof import('../../types/bond').Bond })}
            className="select-sm"
          >
            {colOptions.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <select
            value={rule.operator}
            onChange={e => update(rule.id, { operator: e.target.value as FilterOperator })}
            className="select-sm w-16"
          >
            {OPERATORS.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
          </select>
          <input
            className="input-sm w-20"
            placeholder="value"
            value={rule.value}
            onChange={e => update(rule.id, { value: e.target.value })}
          />
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">bg</span>
            <input
              type="color"
              value={rule.bgColor}
              onChange={e => update(rule.id, { bgColor: e.target.value })}
              className="w-7 h-6 rounded cursor-pointer border border-gray-300"
            />
            <span className="text-xs text-gray-500">txt</span>
            <input
              type="color"
              value={rule.textColor}
              onChange={e => update(rule.id, { textColor: e.target.value })}
              className="w-7 h-6 rounded cursor-pointer border border-gray-300"
            />
          </div>
          <div className="w-20 h-6 rounded text-xs flex items-center justify-center font-medium" style={{ backgroundColor: rule.bgColor, color: rule.textColor }}>
            preview
          </div>
          <button onClick={() => del(rule.id)} className="text-gray-400 hover:text-red-500 ml-auto">
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button onClick={add} className="mt-1 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
        <Plus size={12} /> Add rule
      </button>
    </div>
  );
}
