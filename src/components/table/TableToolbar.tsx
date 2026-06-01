import { useState, useRef } from 'react';
import {
  Search, Columns, Filter, Palette, Download,
  Upload, Sun, Moon, AlignJustify, Group, GitCompare, X
} from 'lucide-react';
import { useTableStore } from '../../store/tableStore';
import { useShallow } from 'zustand/react/shallow';
import { LiveBadge } from './LiveBadge';
import { QuickFilterChips } from './QuickFilterChips';
import { ColumnManager } from './ColumnManager';
import { FilterBuilder } from './FilterBuilder';
import { ConditionalFormat } from './ConditionalFormat';
import { UploadModal } from '../upload/UploadModal';
import { CompareModal } from './CompareModal';
import { exportCSV, exportExcel, exportPDF } from '../../utils/export';
import { COLUMN_DEFS, colId } from '../../data/columns';
import type { ColumnMeta } from '../../data/columns';
import type { Density } from '../../types/bond';
import { useFilteredCount } from './BondTable';

type Panel = 'columns' | 'filter' | 'format' | 'export' | 'density' | 'group' | null;

const DENSITY_LABELS: Record<Density, string> = {
  compact: 'Compact',
  comfortable: 'Comfortable',
  spacious: 'Spacious',
};

const GROUP_OPTIONS = [
  { value: '', label: 'No grouping' },
  { value: 'bondType', label: 'Bond Type' },
  { value: 'sector', label: 'Sector' },
  { value: 'rating', label: 'Rating' },
  { value: 'benchmark', label: 'Benchmark' },
  { value: 'currency', label: 'Currency' },
  { value: 'liquidity', label: 'Liquidity' },
];

export function TableToolbar() {
  const {
    globalSearch, setGlobalSearch,
    darkMode, toggleDarkMode,
    density, setDensity,
    groupBy, setGroupBy,
    filterTree, activePresets,
    data, columnVisibility,
    selected, clearSelected,
  } = useTableStore(useShallow(s => ({
    globalSearch: s.globalSearch,
    setGlobalSearch: s.setGlobalSearch,
    darkMode: s.darkMode,
    toggleDarkMode: s.toggleDarkMode,
    density: s.density,
    setDensity: s.setDensity,
    groupBy: s.groupBy,
    setGroupBy: s.setGroupBy,
    filterTree: s.filterTree,
    activePresets: s.activePresets,
    data: s.data,
    columnVisibility: s.columnVisibility,
    selected: s.selected,
    clearSelected: s.clearSelected,
  })));

  const filteredCount = useFilteredCount();
  const [panel, setPanel] = useState<Panel>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const togglePanel = (p: Panel) => setPanel(prev => prev === p ? null : p);

  const hasFilter = (filterTree && filterTree.children.length > 0) || activePresets.length > 0;
  const selectedIds = Object.keys(selected).filter(k => selected[k]);
  const selectedCount = selectedIds.length;

  const getExportCols = () =>
    COLUMN_DEFS.filter(c => {
      const meta = c.meta as ColumnMeta | undefined;
      const id = colId(c);
      return id !== 'select' && (columnVisibility[id] ?? meta?.defaultVisible);
    });

  const getExportData = () => data; // In practice would use filtered+sorted

  return (
    <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      {/* Main toolbar row */}
      <div className="flex items-center gap-2 px-3 py-2 flex-wrap">
        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="pl-7 pr-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 dark:text-gray-200 w-52 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Search CUSIP, description, issuer..."
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
          />
          {globalSearch && (
            <button onClick={() => setGlobalSearch('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={11} />
            </button>
          )}
        </div>

        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

        {/* Toolbar buttons */}
        <ToolBtn icon={<Columns size={14} />} label="Columns" active={panel === 'columns'} onClick={() => togglePanel('columns')} />
        <ToolBtn icon={<Filter size={14} />} label="Filter" active={panel === 'filter'} hasIndicator={hasFilter} onClick={() => togglePanel('filter')} />
        <ToolBtn icon={<Palette size={14} />} label="Format" active={panel === 'format'} onClick={() => togglePanel('format')} />

        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

        {/* Group by */}
        <div className="flex items-center gap-1">
          <Group size={13} className="text-gray-400" />
          <select
            value={groupBy ?? ''}
            onChange={e => setGroupBy(e.target.value || null)}
            className="select-sm"
          >
            {GROUP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Density */}
        <div className="flex items-center gap-1">
          <AlignJustify size={13} className="text-gray-400" />
          <select
            value={density}
            onChange={e => setDensity(e.target.value as Density)}
            className="select-sm"
          >
            {(Object.keys(DENSITY_LABELS) as Density[]).map(d => (
              <option key={d} value={d}>{DENSITY_LABELS[d]}</option>
            ))}
          </select>
        </div>

        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

        {/* Export */}
        <div className="relative">
          <ToolBtn icon={<Download size={14} />} label="Export" active={panel === 'export'} onClick={() => togglePanel('export')} />
          {panel === 'export' && (
            <div ref={panelRef} className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-30 min-w-[120px]">
              <button className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200" onClick={() => { exportCSV(getExportData(), getExportCols()); setPanel(null); }}>Export CSV</button>
              <button className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200" onClick={() => { exportExcel(getExportData(), getExportCols()); setPanel(null); }}>Export Excel</button>
              <button className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200" onClick={() => { exportPDF(getExportData(), getExportCols()); setPanel(null); }}>Export PDF</button>
            </div>
          )}
        </div>

        {/* Upload */}
        <ToolBtn icon={<Upload size={14} />} label="Import" onClick={() => setShowUpload(true)} />

        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

        {/* Compare */}
        {selectedCount >= 2 && (
          <button
            onClick={() => setShowCompare(true)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-amber-50 border border-amber-300 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-400"
          >
            <GitCompare size={13} />
            Compare ({selectedCount})
          </button>
        )}
        {selectedCount > 0 && (
          <button onClick={clearSelected} className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <X size={12} className="inline" /> Deselect all
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {filteredCount.toLocaleString()} / {data.length.toLocaleString()} rows
          </span>
          <LiveBadge />
          <button onClick={toggleDarkMode} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>

      {/* Quick filter chips */}
      <div className="px-3 pb-2">
        <QuickFilterChips />
      </div>

      {/* Inline panels */}
      {panel === 'filter' && (
        <div className="px-3 pb-2">
          <FilterBuilder onClose={() => setPanel(null)} />
        </div>
      )}
      {panel === 'format' && (
        <div className="px-3 pb-2">
          <ConditionalFormat onClose={() => setPanel(null)} />
        </div>
      )}

      {/* Overlays */}
      {panel === 'columns' && <ColumnManager onClose={() => setPanel(null)} />}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {showCompare && <CompareModal onClose={() => setShowCompare(false)} />}
    </div>
  );
}

function ToolBtn({
  icon, label, active = false, hasIndicator = false, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  hasIndicator?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors
        ${active
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
    >
      {icon}
      {label}
      {hasIndicator && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full" />
      )}
    </button>
  );
}
