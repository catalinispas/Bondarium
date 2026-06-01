import { useState, useMemo } from 'react';
import { X, Plus, Trash2, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { useTableStore } from '../../store/tableStore';
import { useShallow } from 'zustand/react/shallow';
import type { Portfolio, PortfolioPosition } from '../../types/portfolio';
import type { Bond } from '../../types/bond';
import {
  positionMarketValue, positionBookValue, positionPnLDollar, positionPnLPct,
  portfolioSummary, scenarioPnL, allocationBreakdown,
  type PortfolioSummary,
} from '../../utils/portfolioCalc';

const ALLOC_PALETTE = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16'];

function fmtM(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtDollar(n: number) {
  const abs = Math.abs(n);
  const sign = n >= 0 ? '+' : '-';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

interface PositionRowProps {
  pos: PortfolioPosition;
  bond: Bond | undefined;
  onRemove: () => void;
}

function PositionRow({ pos, bond, onRemove }: PositionRowProps) {
  const pnl = bond ? positionPnLDollar(pos, bond) : 0;
  const pnlPct = bond ? positionPnLPct(pos, bond) : 0;
  const mktPrice = bond ? bond.price.toFixed(3) : '—';

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded p-2 group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">
          {bond?.cusip ?? pos.bondId}
        </span>
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-0.5 transition-opacity"
        >
          <Trash2 size={11} />
        </button>
      </div>
      <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate block leading-tight">
        {bond?.description ?? '—'}
      </span>
      <div className="flex flex-wrap gap-x-3 mt-1 text-[10px] text-gray-600 dark:text-gray-400">
        <span>Notional: {fmtM(pos.notional)}</span>
        <span>Book: {pos.purchasePrice.toFixed(3)}</span>
        <span>Mkt: {mktPrice}</span>
        {bond && (
          <span className={pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}>
            P&amp;L: {fmtDollar(pnl)} ({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%)
          </span>
        )}
      </div>
      {pos.notes && (
        <p className="text-[10px] text-gray-400 italic mt-0.5 truncate">{pos.notes}</p>
      )}
    </div>
  );
}

interface SummaryItemProps { label: string; value: string; pnl?: number }
function SummaryItem({ label, value, pnl }: SummaryItemProps) {
  const color = pnl !== undefined
    ? pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
    : 'text-gray-700 dark:text-gray-300';
  return (
    <div>
      <div className="text-[9px] text-gray-400 uppercase tracking-wide">{label}</div>
      <div className={`text-[11px] font-semibold ${color}`}>{value}</div>
    </div>
  );
}

function SummaryStrip({ summary }: { summary: PortfolioSummary }) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 grid grid-cols-2 gap-x-4 gap-y-2">
      <SummaryItem label="Total Mkt Value" value={fmtM(summary.totalMarketValue)} />
      <SummaryItem label="Total P&L" value={fmtDollar(summary.totalPnLDollar)} pnl={summary.totalPnLDollar} />
      <SummaryItem label="WA Spread" value={`${summary.waSpread.toFixed(1)} bp`} />
      <SummaryItem label="WA OAS Dur" value={`${summary.waOasDuration.toFixed(2)} yr`} />
      <SummaryItem label="Total DV01" value={`$${summary.totalDV01.toFixed(0)}`} />
      <SummaryItem
        label="P&L %"
        value={`${summary.totalPnLPct >= 0 ? '+' : ''}${summary.totalPnLPct.toFixed(2)}%`}
        pnl={summary.totalPnLDollar}
      />
    </div>
  );
}

interface Props {
  onClose: () => void;
}

export function PortfolioDrawer({ onClose }: Props) {
  const {
    data, portfolios, activePortfolioId,
    portfolioViewMode, setPortfolioViewMode,
    addPortfolio, deletePortfolio,
    setActivePortfolio, removePosition,
  } = useTableStore(useShallow(s => ({
    data: s.data,
    portfolios: s.portfolios,
    activePortfolioId: s.activePortfolioId,
    portfolioViewMode: s.portfolioViewMode,
    setPortfolioViewMode: s.setPortfolioViewMode,
    addPortfolio: s.addPortfolio,
    deletePortfolio: s.deletePortfolio,
    setActivePortfolio: s.setActivePortfolio,
    removePosition: s.removePosition,
  })));

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [shock, setShock] = useState(0);
  const [showAllocation, setShowAllocation] = useState(false);

  const bondMap = useMemo(() => new Map(data.map(b => [b.id, b])), [data]);

  const activePortfolio: Portfolio | null = useMemo(
    () => portfolios.find(p => p.id === activePortfolioId) ?? null,
    [portfolios, activePortfolioId],
  );

  const summary = useMemo(
    () => activePortfolio ? portfolioSummary(activePortfolio, bondMap) : null,
    [activePortfolio, bondMap],
  );

  const typeBreakdown = useMemo(
    () => activePortfolio ? allocationBreakdown(activePortfolio, bondMap, 'bondType') : [],
    [activePortfolio, bondMap],
  );

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    addPortfolio(name);
    const created = useTableStore.getState().portfolios.at(-1);
    if (created) setActivePortfolio(created.id);
    setNewName('');
    setCreating(false);
  };

  const handleDelete = () => {
    if (!activePortfolio) return;
    if (!confirm(`Delete portfolio "${activePortfolio.name}"?`)) return;
    deletePortfolio(activePortfolio.id);
  };

  const handleExport = () => {
    if (!activePortfolio) return;
    const headers = ['CUSIP','Description','Notional','Book Price','Live Price','Mkt Value ($)','Book Value ($)','P&L ($)','P&L (%)'];
    const rows = activePortfolio.positions.map(pos => {
      const bond = bondMap.get(pos.bondId);
      return [
        bond?.cusip ?? pos.bondId,
        bond?.description ?? '',
        pos.notional,
        pos.purchasePrice,
        bond?.price ?? '',
        bond ? positionMarketValue(pos, bond).toFixed(2) : '',
        bond ? positionBookValue(pos, bond).toFixed(2) : '',
        bond ? positionPnLDollar(pos, bond).toFixed(2) : '',
        bond ? positionPnLPct(pos, bond).toFixed(4) + '%' : '',
      ];
    });
    const csv = [headers, ...rows]
      .map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePortfolio.name.replace(/\s+/g, '-')}-positions.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-700 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Portfolio</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setCreating(v => !v); setNewName(''); }}
            title="New portfolio"
            className="btn btn-ghost btn-sm p-1"
          >
            <Plus size={14} />
          </button>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Inline create form */}
      {creating && (
        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 flex gap-1.5 flex-shrink-0">
          <input
            className="input-sm flex-1"
            placeholder="Portfolio name…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          <button className="btn btn-primary btn-sm" onClick={handleCreate}>Add</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setCreating(false)}>Cancel</button>
        </div>
      )}

      {/* Portfolio selector */}
      {portfolios.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <select
            className="select-sm w-full"
            value={activePortfolioId ?? ''}
            onChange={e => setActivePortfolio(e.target.value || null)}
          >
            <option value="">— Select portfolio —</option>
            {portfolios.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.positions.length} position{p.positions.length !== 1 ? 's' : ''})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Positions list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {activePortfolio && activePortfolio.positions.length > 0
          ? activePortfolio.positions.map(pos => (
              <PositionRow
                key={pos.id}
                pos={pos}
                bond={bondMap.get(pos.bondId)}
                onRemove={() => removePosition(activePortfolio.id, pos.id)}
              />
            ))
          : (
            <div className="text-xs text-gray-400 dark:text-gray-500 text-center py-10">
              {portfolios.length === 0
                ? 'Click + to create your first portfolio.'
                : activePortfolio
                ? 'No positions yet. Select bonds and click "Add to Portfolio".'
                : 'Select a portfolio above.'
              }
            </div>
          )
        }
      </div>

      {/* Summary strip */}
      {summary && <SummaryStrip summary={summary} />}

      {/* Scenario analysis */}
      {summary && (
        <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">Spread shock</span>
          <input
            type="number"
            className="input-sm w-16 text-center"
            value={shock}
            onChange={e => setShock(Number(e.target.value))}
            placeholder="bp"
          />
          <span className="text-[10px] text-gray-500 dark:text-gray-400">bp →</span>
          <span className={`text-[11px] font-semibold ${scenarioPnL(summary, shock) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
            {fmtDollar(scenarioPnL(summary, shock))}
          </span>
        </div>
      )}

      {/* Allocation breakdown */}
      {activePortfolio && activePortfolio.positions.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            className="w-full flex items-center justify-between px-3 py-2 text-[10px] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setShowAllocation(v => !v)}
          >
            <span className="uppercase tracking-wide">Allocation by type</span>
            {showAllocation ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </button>
          {showAllocation && typeBreakdown.length > 0 && (
            <div className="px-3 pb-2 space-y-1.5">
              <div className="h-2 w-full rounded overflow-hidden flex">
                {typeBreakdown.map((item, i) => (
                  <div
                    key={item.label}
                    style={{ width: `${item.pct}%`, backgroundColor: ALLOC_PALETTE[i % ALLOC_PALETTE.length] }}
                    title={`${item.label}: ${item.pct.toFixed(1)}%`}
                  />
                ))}
              </div>
              {typeBreakdown.map((item, i) => (
                <div key={item.label} className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: ALLOC_PALETTE[i % ALLOC_PALETTE.length] }} />
                  <span className="flex-1 truncate">{item.label}</span>
                  <span className="font-mono">{item.pct.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {activePortfolio && (
        <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-1.5 flex-shrink-0">
          {/* Portfolio view toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400">Portfolio view</span>
            <button
              onClick={() => setPortfolioViewMode(!portfolioViewMode)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none
                ${portfolioViewMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform
                ${portfolioViewMode ? 'translate-x-4' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
          <button className="btn btn-secondary btn-sm w-full" onClick={handleExport}>
            <Download size={12} /> Export positions CSV
          </button>
          <button className="btn btn-danger btn-sm w-full" onClick={handleDelete}>
            Delete portfolio
          </button>
        </div>
      )}
    </div>
  );
}
