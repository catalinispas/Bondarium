import { useState } from 'react';
import { X, Pin, PinOff, GripVertical, RotateCcw } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTableStore } from '../../store/tableStore';
import { useShallow } from 'zustand/react/shallow';
import { COLUMN_DEFS, DEFAULT_VISIBLE, DEFAULT_WIDTHS, colId } from '../../data/columns';
import type { ColumnMeta } from '../../data/columns';

function SortableItem({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const { columnVisibility, toggleColumn, columnPinning, pinColumn } = useTableStore(useShallow(s => ({
    columnVisibility: s.columnVisibility,
    toggleColumn: s.toggleColumn,
    columnPinning: s.columnPinning,
    pinColumn: s.pinColumn,
  })));
  const [pinHover, setPinHover] = useState(false);

  const col = COLUMN_DEFS.find(c => colId(c) === id);
  if (!col) return null;
  const meta = col.meta as ColumnMeta | undefined;
  const label = meta?.label ?? id;
  const visible = columnVisibility[id] ?? true;
  const isPinned = columnPinning.left.includes(id);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 group">
      <span {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
        <GripVertical size={14} />
      </span>
      <input
        type="checkbox"
        checked={visible}
        onChange={() => toggleColumn(id)}
        className="accent-blue-600"
      />
      <span className="flex-1 text-xs text-gray-700 dark:text-gray-300 truncate">{label}</span>
      <button
        onClick={() => pinColumn(id, isPinned ? null : 'left')}
        onMouseEnter={() => setPinHover(true)}
        onMouseLeave={() => setPinHover(false)}
        title={isPinned ? 'Unpin' : 'Pin'}
        className={`p-0.5 rounded transition-colors
          ${isPinned
            ? pinHover ? 'text-red-400' : 'text-blue-600'
            : 'opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600'
          }`}
      >
        {isPinned && pinHover
          ? <PinOff size={12} />
          : <Pin size={12} fill={isPinned ? 'currentColor' : 'none'} />
        }
      </button>
    </div>
  );
}

interface Props {
  onClose: () => void;
}

export function ColumnManager({ onClose }: Props) {
  const { columnOrder, setColumnOrder, setColumnVisibility, setColumnSizing } = useTableStore(useShallow(s => ({
    columnOrder: s.columnOrder,
    setColumnOrder: s.setColumnOrder,
    setColumnVisibility: s.setColumnVisibility,
    setColumnSizing: s.setColumnSizing,
  })));

  const [search, setSearch] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const oldIndex = columnOrder.indexOf(active.id as string);
      const newIndex = columnOrder.indexOf(over.id as string);
      setColumnOrder(arrayMove(columnOrder, oldIndex, newIndex));
    }
  };

  const reset = () => {
    setColumnVisibility(DEFAULT_VISIBLE);
    setColumnSizing(DEFAULT_WIDTHS);
    setColumnOrder(COLUMN_DEFS.map(c => colId(c)));
  };

  const filteredOrder = search
    ? columnOrder.filter(id => {
        const col = COLUMN_DEFS.find(c => c.id === id);
        const label = (col?.meta as ColumnMeta | undefined)?.label ?? id;
        return label.toLowerCase().includes(search.toLowerCase());
      })
    : columnOrder;

  return (
    <div className="fixed right-0 top-10 h-[calc(100vh-40px)] w-72 bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-700 z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Columns</h3>
        <div className="flex items-center gap-2">
          <button onClick={reset} title="Reset to defaults" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <RotateCcw size={14} />
          </button>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
        <input
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 dark:text-gray-200"
          placeholder="Search columns..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={search ? columnOrder : filteredOrder} strategy={verticalListSortingStrategy}>
            {filteredOrder.map(id => <SortableItem key={id} id={id} />)}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
