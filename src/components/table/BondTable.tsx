import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  type SortingState,
} from '@tanstack/react-table';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useTableStore } from '../../store/tableStore';
import { useShallow } from 'zustand/react/shallow';
import { COLUMN_DEFS } from '../../data/columns';
import type { ColumnMeta } from '../../data/columns';
import { applyFilters, mergeFilterTrees } from '../../utils/formulaEngine';
import { QUICK_PRESETS } from '../../data/presets';
import { positionMarketValue, positionBookValue, positionPnLDollar, positionPnLPct } from '../../utils/portfolioCalc';
import type { PortfolioPosition } from '../../types/portfolio';
import { SummaryFooter } from './SummaryFooter';
import { RowDetail } from './RowDetail';
import type { Bond } from '../../types/bond';

const DENSITY_PY: Record<string, string> = {
  compact: 'py-0.5',
  comfortable: 'py-1.5',
  spacious: 'py-3',
};

// Track previous data to detect price/spread changes for flash animation
function usePrevData(data: Bond[]) {
  const prev = useRef<Map<string, Bond>>(new Map());
  const flashMap = useRef<Map<string, Record<string, string>>>(new Map());

  useEffect(() => {
    const newFlash = new Map<string, Record<string, string>>();
    for (const bond of data) {
      const old = prev.current.get(bond.id);
      if (!old) continue;
      const fields: (keyof Bond)[] = ['price', 'spread', 'priceChange1d', 'spreadChange1d'];
      const changes: Record<string, string> = {};
      for (const f of fields) {
        const nv = bond[f] as number;
        const ov = old[f] as number;
        if (nv !== ov) changes[f] = nv > ov ? 'flash-up' : 'flash-down';
      }
      if (Object.keys(changes).length > 0) newFlash.set(bond.id, changes);
    }
    flashMap.current = newFlash;
    prev.current = new Map(data.map(b => [b.id, b]));
  });

  return flashMap;
}

export function BondTable() {
  const {
    data, columnVisibility, columnPinning, columnOrder, columnSizing,
    sorting, setSorting, filterTree, globalSearch, activePresets,
    groupBy, pageIndex, pageSize, expanded, toggleExpanded,
    selected, toggleSelected, density, conditionalRules, darkMode,
    portfolios, activePortfolioId, portfolioViewMode,
  } = useTableStore(useShallow(s => ({
    data: s.data, columnVisibility: s.columnVisibility, columnPinning: s.columnPinning,
    columnOrder: s.columnOrder, columnSizing: s.columnSizing, sorting: s.sorting,
    setSorting: s.setSorting, filterTree: s.filterTree, globalSearch: s.globalSearch,
    activePresets: s.activePresets, groupBy: s.groupBy, pageIndex: s.pageIndex,
    pageSize: s.pageSize, expanded: s.expanded, toggleExpanded: s.toggleExpanded,
    selected: s.selected, toggleSelected: s.toggleSelected, density: s.density,
    conditionalRules: s.conditionalRules, darkMode: s.darkMode,
    portfolios: s.portfolios, activePortfolioId: s.activePortfolioId,
    portfolioViewMode: s.portfolioViewMode,
  })));

  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  const flashMap = usePrevData(data);

  const effectiveTree = useMemo(() => {
    const trees = [];
    if (filterTree && filterTree.children.length > 0) trees.push(filterTree);
    for (const pid of activePresets) {
      const preset = QUICK_PRESETS.find(p => p.id === pid);
      if (preset) trees.push(preset.filterTree);
    }
    return mergeFilterTrees(trees);
  }, [filterTree, activePresets]);

  const activePortfolio = useMemo(
    () => portfolios.find(p => p.id === activePortfolioId) ?? null,
    [portfolios, activePortfolioId],
  );

  const positionByBondId = useMemo((): Map<string, PortfolioPosition> => {
    if (!activePortfolio) return new Map();
    return new Map(activePortfolio.positions.map(pos => [pos.bondId, pos]));
  }, [activePortfolio]);

  const filteredData = useMemo(() => {
    let d = applyFilters(data, effectiveTree.children.length > 0 ? effectiveTree : null);
    if (globalSearch) {
      const q = globalSearch.toLowerCase();
      d = d.filter(b =>
        b.cusip.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.issuer.toLowerCase().includes(q) ||
        b.ticker.toLowerCase().includes(q) ||
        b.bondType.toLowerCase().includes(q)
      );
    }
    if (portfolioViewMode && activePortfolio) {
      const ids = new Set(activePortfolio.positions.map(p => p.bondId));
      d = d.filter(b => ids.has(b.id));
    }
    return d;
  }, [data, effectiveTree, globalSearch, portfolioViewMode, activePortfolio]);

  const sortedData = useMemo(() => {
    if (sorting.length === 0) return filteredData;
    return [...filteredData].sort((a, b) => {
      for (const s of sorting) {
        const av = a[s.id as keyof Bond];
        const bv = b[s.id as keyof Bond];
        let cmp = 0;
        if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
        else cmp = String(av ?? '').localeCompare(String(bv ?? ''));
        if (cmp !== 0) return s.desc ? -cmp : cmp;
      }
      return 0;
    });
  }, [filteredData, sorting]);

  const pageData = useMemo(() => {
    const start = pageIndex * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pageIndex, pageSize]);

  type DisplayRow =
    | { kind: 'group'; key: string; count: number }
    | { kind: 'bond'; bond: Bond }
    | { kind: 'detail'; bond: Bond };

  const displayRows = useMemo((): DisplayRow[] => {
    if (!groupBy) {
      const rows: DisplayRow[] = [];
      for (const bond of pageData) {
        rows.push({ kind: 'bond', bond });
        if (expanded[bond.id]) rows.push({ kind: 'detail', bond });
      }
      return rows;
    }
    const groups = new Map<string, Bond[]>();
    for (const bond of sortedData) {
      const key = String(bond[groupBy as keyof Bond] ?? 'Other');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(bond);
    }
    const rows: DisplayRow[] = [];
    for (const [key, bonds] of groups) {
      const pageBonds = bonds.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
      if (pageBonds.length === 0) continue;
      rows.push({ kind: 'group', key, count: bonds.length });
      if (!expanded[`group-${key}`]) continue;
      for (const bond of pageBonds) {
        rows.push({ kind: 'bond', bond });
        if (expanded[bond.id]) rows.push({ kind: 'detail', bond });
      }
    }
    return rows;
  }, [groupBy, pageData, sortedData, expanded, pageIndex, pageSize]);

  // TanStack table — used only for column state (visibility, order, sizing, pinning)
  const table = useReactTable({
    data: pageData,
    columns: COLUMN_DEFS,
    state: {
      columnVisibility,
      columnPinning,
      columnOrder,
      columnSizing: columnSizing as Record<string, number>,
      sorting: sorting as SortingState,
    },
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
  });

  const visibleCols = table.getVisibleLeafColumns();
  const leftPinCols = visibleCols.filter(c => columnPinning.left.includes(c.id));
  const rightPinCols = visibleCols.filter(c => columnPinning.right.includes(c.id));
  const midCols = visibleCols.filter(c => !columnPinning.left.includes(c.id) && !columnPinning.right.includes(c.id));
  const orderedVisible = [...leftPinCols, ...midCols, ...rightPinCols];

  // Synthetic portfolio columns — only shown in portfolio view mode
  const portfolioCols = portfolioViewMode && activePortfolio
    ? [
        { id: 'pf-notional',   label: 'Notional',    width: 88 },
        { id: 'pf-bookprice',  label: 'Book Price',  width: 80 },
        { id: 'pf-mktvalue',   label: 'Mkt Value',   width: 88 },
        { id: 'pf-pnl-dollar', label: 'P&L ($)',     width: 90 },
        { id: 'pf-pnl-pct',   label: 'P&L (%)',     width: 76 },
        { id: 'pf-notes',      label: 'Notes',       width: 150 },
      ]
    : [];

  const portfolioColsWidth = portfolioCols.reduce((s, c) => s + c.width, 0);
  const totalTableWidth = portfolioColsWidth + orderedVisible.reduce((s, c) => s + (columnSizing[c.id] ?? c.getSize()), 0);

  // Sticky left/right offsets for pinned columns
  const leftOffsets = useMemo(() => {
    const offsets: Record<string, number> = {};
    let acc = 0;
    for (const col of leftPinCols) {
      offsets[col.id] = acc;
      acc += columnSizing[col.id] ?? col.getSize();
    }
    return offsets;
  }, [leftPinCols, columnSizing]);

  const rightOffsets = useMemo(() => {
    const offsets: Record<string, number> = {};
    let acc = 0;
    for (const col of [...rightPinCols].reverse()) {
      offsets[col.id] = acc;
      acc += columnSizing[col.id] ?? col.getSize();
    }
    return offsets;
  }, [rightPinCols, columnSizing]);

  const lastLeftPinId = leftPinCols[leftPinCols.length - 1]?.id;

  // Column resize via mouse drag
  const [resizingCol, setResizingCol] = useState<string | null>(null);
  const resizeStartX = useRef(0);
  const resizeStartW = useRef(0);
  const setColumnSizing = useTableStore(s => s.setColumnSizing);  // stable function ref, no shallow needed

  const startResize = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setResizingCol(id);
    resizeStartX.current = e.clientX;
    resizeStartW.current = columnSizing[id] ?? 100;
  }, [columnSizing]);

  useEffect(() => {
    if (!resizingCol) return;
    const onMove = (e: MouseEvent) => {
      const newW = Math.max(40, resizeStartW.current + (e.clientX - resizeStartX.current));
      setColumnSizing({ ...columnSizing, [resizingCol]: newW });
    };
    const onUp = () => setResizingCol(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [resizingCol, columnSizing, setColumnSizing]);

  // Sort on header click
  const handleSort = useCallback((id: string, e: React.MouseEvent) => {
    if (id === 'select') return;
    const existing = sorting.find(s => s.id === id);
    if (e.shiftKey) {
      if (!existing) setSorting([...sorting, { id, desc: false }]);
      else if (!existing.desc) setSorting(sorting.map(s => s.id === id ? { ...s, desc: true } : s));
      else setSorting(sorting.filter(s => s.id !== id));
    } else {
      if (!existing) setSorting([{ id, desc: false }]);
      else if (!existing.desc) setSorting([{ id, desc: true }]);
      else setSorting([]);
    }
  }, [sorting, setSorting]);

  // Conditional formatting
  const getCellStyle = useCallback((bond: Bond, id: string): React.CSSProperties => {
    for (const rule of conditionalRules) {
      if (String(rule.column) !== id) continue;
      const val = bond[rule.column];
      const num = parseFloat(String(val));
      const rv = parseFloat(rule.value);
      let match = false;
      switch (rule.operator) {
        case '>': match = !isNaN(num) && num > rv; break;
        case '>=': match = !isNaN(num) && num >= rv; break;
        case '<': match = !isNaN(num) && num < rv; break;
        case '<=': match = !isNaN(num) && num <= rv; break;
        case '=': match = String(val).toLowerCase() === rule.value.toLowerCase(); break;
        case '!=': match = String(val).toLowerCase() !== rule.value.toLowerCase(); break;
        case 'contains': match = String(val).toLowerCase().includes(rule.value.toLowerCase()); break;
      }
      if (match) return { backgroundColor: rule.bgColor, color: rule.textColor };
    }
    return {};
  }, [conditionalRules]);

  // ── Render helpers ──────────────────────────────────────────────────────────

  function stickyStyle(id: string, isLeft: boolean, isRight: boolean): React.CSSProperties {
    if (isLeft) return { position: 'sticky', left: leftOffsets[id] ?? 0, zIndex: 3 };
    if (isRight) return { position: 'sticky', right: rightOffsets[id] ?? 0, zIndex: 3 };
    return {};
  }

  function renderHeaderCell(col: ReturnType<typeof table.getVisibleLeafColumns>[0]) {
    const meta = col.columnDef.meta as ColumnMeta | undefined;
    const w = columnSizing[col.id] ?? col.getSize();
    const sort = sorting.find(s => s.id === col.id);
    const isLeft = columnPinning.left.includes(col.id);
    const isRight = columnPinning.right.includes(col.id);
    const isLast = col.id === lastLeftPinId;
    const hStyle: React.CSSProperties = { ...stickyStyle(col.id, isLeft, isRight), zIndex: isLeft || isRight ? 21 : 'auto' };

    return (
      <th key={col.id}
        style={{ width: w, minWidth: w, maxWidth: w, ...hStyle }}
        className={`relative select-none border-r border-b border-gray-200 dark:border-gray-700
          bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300
          ${meta?.align === 'right' ? 'text-right' : meta?.align === 'center' ? 'text-center' : 'text-left'}
          ${isLast ? 'pin-left-last' : ''} px-2 py-1.5 text-xs font-semibold cursor-pointer`}
        onClick={e => handleSort(col.id, e)}
      >
        <div className="flex items-center gap-1">
          {col.id === 'select'
            ? <span className="w-4" />
            : <span className="truncate flex-1">{meta?.label ?? col.id}</span>
          }
          {sort && (
            <span className="text-blue-500 flex-shrink-0 text-[10px]">
              {sort.desc ? '↓' : '↑'}
              {sorting.length > 1 && <sup>{sorting.indexOf(sort) + 1}</sup>}
            </span>
          )}
        </div>
        {col.id !== 'select' && (
          <div className={`resizer ${resizingCol === col.id ? 'isResizing' : ''}`}
            onMouseDown={e => startResize(col.id, e)}
            onClick={e => e.stopPropagation()}
          />
        )}
      </th>
    );
  }

  function renderBondRow(bond: Bond) {
    const py = DENSITY_PY[density] ?? 'py-1.5';
    const isSelected = selected[bond.id];
    const isExpanded = expanded[bond.id];
    const flashEntry = flashMap.current.get(bond.id);
    const isHovered = hoveredRowId === bond.id;

    // Opaque inline background for pinned cells — prevents conditional-format bleed-through
    const pinnedBg = isSelected
      ? (darkMode ? '#172554' : '#eff6ff')
      : isHovered
      ? (darkMode ? '#1f2937' : '#f9fafb')
      : (darkMode ? '#111827' : '#ffffff');

    return (
      <tr key={bond.id}
        onMouseEnter={() => setHoveredRowId(bond.id)}
        onMouseLeave={() => setHoveredRowId(null)}
        className={`border-b border-gray-100 dark:border-gray-800
          ${isSelected ? 'bg-blue-50 dark:bg-blue-950/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
      >
        {portfolioCols.map(col => {
          const pos = positionByBondId.get(bond.id);
          const baseTd = `${py} px-2 text-xs text-right border-r border-gray-100 dark:border-gray-800 truncate`;
          if (!pos) return (
            <td key={col.id} style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
              className={`${baseTd} text-gray-400`}>—</td>
          );
          if (col.id === 'pf-notional') {
            const v = pos.notional >= 1_000_000 ? `$${(pos.notional / 1_000_000).toFixed(2)}M` : `$${(pos.notional / 1_000).toFixed(0)}K`;
            return <td key={col.id} style={{ width: col.width, minWidth: col.width, maxWidth: col.width }} className={`${baseTd} text-gray-700 dark:text-gray-300`}>{v}</td>;
          }
          if (col.id === 'pf-bookprice') return (
            <td key={col.id} style={{ width: col.width, minWidth: col.width, maxWidth: col.width }} className={`${baseTd} text-gray-700 dark:text-gray-300`}>{pos.purchasePrice.toFixed(3)}</td>
          );
          if (col.id === 'pf-mktvalue') {
            const mv = positionMarketValue(pos, bond);
            const v = mv >= 1_000_000 ? `$${(mv / 1_000_000).toFixed(2)}M` : `$${(mv / 1_000).toFixed(0)}K`;
            return <td key={col.id} style={{ width: col.width, minWidth: col.width, maxWidth: col.width }} className={`${baseTd} text-gray-700 dark:text-gray-300`}>{v}</td>;
          }
          if (col.id === 'pf-pnl-dollar') {
            const pnl = positionPnLDollar(pos, bond);
            const abs = Math.abs(pnl);
            const sign = pnl >= 0 ? '+' : '-';
            const v = abs >= 1_000_000 ? `${sign}$${(abs / 1_000_000).toFixed(2)}M` : `${sign}$${(abs / 1_000).toFixed(1)}K`;
            return <td key={col.id} style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
              className={`${baseTd} font-medium ${pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{v}</td>;
          }
          if (col.id === 'pf-pnl-pct') {
            const pct = positionPnLPct(pos, bond);
            return <td key={col.id} style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
              className={`${baseTd} font-medium ${pct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
            </td>;
          }
          if (col.id === 'pf-notes') {
            return <td key={col.id} style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
              className={`${py} px-2 text-xs text-left border-r border-gray-100 dark:border-gray-800 truncate text-gray-500 dark:text-gray-400 italic`}>
              {pos?.notes ?? ''}
            </td>;
          }
          return <td key={col.id} style={{ width: col.width, minWidth: col.width, maxWidth: col.width }} className={baseTd}>—</td>;
        })}
        {orderedVisible.map(col => {
          const meta = col.columnDef.meta as ColumnMeta | undefined;
          const w = columnSizing[col.id] ?? col.getSize();
          const isLeft = columnPinning.left.includes(col.id);
          const isRight = columnPinning.right.includes(col.id);
          const isLast = col.id === lastLeftPinId;
          const isPinned = isLeft || isRight;
          const cs = getCellStyle(bond, col.id);
          const flash = flashEntry?.[col.id] ?? '';

          if (col.id === 'select') {
            return (
              <td key={col.id}
                style={{ width: w, minWidth: w, maxWidth: w, ...stickyStyle(col.id, true, false), backgroundColor: pinnedBg }}
                className={`${py} px-2 border-r border-gray-100 dark:border-gray-800`}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center gap-1">
                  <input type="checkbox" checked={!!isSelected}
                    onChange={() => toggleSelected(bond.id)} className="accent-blue-600" />
                  <button onClick={e => { e.stopPropagation(); toggleExpanded(bond.id); }}
                    className="text-gray-400 hover:text-gray-600">
                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                </div>
              </td>
            );
          }

          const key = (col.columnDef as { accessorKey?: keyof Bond }).accessorKey;
          const raw = key ? bond[key] : null;
          const fmt = meta?.format ? meta.format(raw) : raw == null ? '—' : String(raw);

          return (
            <td key={col.id}
              style={{
                width: w, minWidth: w, maxWidth: w,
                ...stickyStyle(col.id, isLeft, isRight),
                ...(isPinned ? { backgroundColor: pinnedBg } : cs),
              }}
              className={`${py} ${flash} px-2 text-xs border-r border-gray-100 dark:border-gray-800 truncate
                ${meta?.align === 'right' ? 'text-right' : meta?.align === 'center' ? 'text-center' : 'text-left'}
                text-gray-800 dark:text-gray-200`}
            >
              {col.id === 'priceChange1d' || col.id === 'spreadChange1d' ? (
                <span className={typeof raw === 'number' && raw > 0 ? 'text-emerald-600' : typeof raw === 'number' && raw < 0 ? 'text-red-500' : ''}>
                  {typeof raw === 'number' && raw > 0 ? '+' : ''}{fmt}
                </span>
              ) : col.id === 'liquidity' ? (
                <span className={`px-1 py-0.5 rounded text-[10px] font-medium ${
                  raw === 'High' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' :
                  raw === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                  'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                }`}>{String(raw)}</span>
              ) : fmt}
            </td>
          );
        })}
      </tr>
    );
  }

  const visibleColIds = orderedVisible.map(c => c.id);

  const footerScrollRef = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (footerScrollRef.current) footerScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden">
    <div style={{ flex: '1 1 0', minHeight: 0, overflow: 'auto' }} onScroll={handleScroll}>
      <table
        style={{ width: Math.max(totalTableWidth, 800), tableLayout: 'fixed', minWidth: '100%', borderCollapse: 'separate', borderSpacing: 0 }}
      >
        <thead className="sticky top-0 z-20">
          <tr>
            {portfolioCols.map(col => (
              <th key={col.id}
                style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                className="relative select-none border-r border-b border-gray-200 dark:border-gray-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-right px-2 py-1.5 text-xs font-semibold"
              >
                {col.label}
              </th>
            ))}
            {orderedVisible.map(col => renderHeaderCell(col))}
          </tr>
        </thead>

        <tbody>
          {displayRows.map(row => {
            if (row.kind === 'group') {
              const isOpen = expanded[`group-${row.key}`];
              return (
                <tr key={`group-${row.key}`}
                  className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 cursor-pointer"
                  onClick={() => toggleExpanded(`group-${row.key}`)}
                >
                  <td colSpan={portfolioCols.length + orderedVisible.length}
                    style={{ position: 'sticky', left: 0, zIndex: 2 }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800">
                    <span className="mr-2">{isOpen ? '▾' : '▸'}</span>
                    {row.key}
                    <span className="ml-2 font-normal text-slate-500">({row.count.toLocaleString()})</span>
                  </td>
                </tr>
              );
            }
            if (row.kind === 'detail') {
              return (
                <tr key={`detail-${row.bond.id}`}>
                  <td colSpan={portfolioCols.length + orderedVisible.length} className="p-0">
                    <div style={{ position: 'sticky', left: 0, width: '100vw', maxWidth: '100vw', overflow: 'hidden', boxSizing: 'border-box' }}>
                      <RowDetail bond={row.bond} onClose={() => toggleExpanded(row.bond.id)} />
                    </div>
                  </td>
                </tr>
              );
            }
            return renderBondRow(row.bond);
          })}
        </tbody>

      </table>
    </div>
    {filteredData.length > 0 && (
      <div ref={footerScrollRef} className="flex-shrink-0 overflow-hidden border-t-2 border-slate-300 dark:border-slate-600">
        <SummaryFooter
          bonds={filteredData}
          visibleColIds={visibleColIds}
          colWidths={columnSizing}
          pinLeft={columnPinning.left}
          pinRight={columnPinning.right}
          totalWidth={totalTableWidth}
          portfolioCols={portfolioCols}
        />
      </div>
    )}
    </div>
  );
}

export function useFilteredCount() {
  const { data, filterTree, activePresets, globalSearch, portfolios, activePortfolioId, portfolioViewMode } = useTableStore(useShallow(s => ({
    data: s.data, filterTree: s.filterTree, activePresets: s.activePresets, globalSearch: s.globalSearch,
    portfolios: s.portfolios, activePortfolioId: s.activePortfolioId, portfolioViewMode: s.portfolioViewMode,
  })));
  const trees = [];
  if (filterTree && filterTree.children.length > 0) trees.push(filterTree);
  for (const pid of activePresets) {
    const preset = QUICK_PRESETS.find(p => p.id === pid);
    if (preset) trees.push(preset.filterTree);
  }
  let d = applyFilters(data, (() => { const t = mergeFilterTrees(trees); return t.children.length > 0 ? t : null; })());
  if (globalSearch) {
    const q = globalSearch.toLowerCase();
    d = d.filter(b => b.cusip.toLowerCase().includes(q) || b.description.toLowerCase().includes(q) || b.issuer.toLowerCase().includes(q));
  }
  if (portfolioViewMode && activePortfolioId) {
    const portfolio = portfolios.find(p => p.id === activePortfolioId);
    if (portfolio) {
      const ids = new Set(portfolio.positions.map(p => p.bondId));
      d = d.filter(b => ids.has(b.id));
    }
  }
  return d.length;
}
