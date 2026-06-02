import { useState } from 'react';
import { X, Pencil, GitMerge, Trash2 } from 'lucide-react';
import { useTableStore } from '../store/tableStore';
import { useShallow } from 'zustand/react/shallow';
import { BondTable, useFilteredCount } from '../components/table/BondTable';
import { TableToolbar } from '../components/table/TableToolbar';
import { PaginationBar } from '../components/table/PaginationBar';
import type { Portfolio } from '../types/portfolio';

// ── Modals ────────────────────────────────────────────────────────────────────

function RenameModal({ portfolio, onClose }: { portfolio: Portfolio; onClose: () => void }) {
  const renamePortfolio = useTableStore(s => s.renamePortfolio);
  const [value, setValue] = useState(portfolio.name);

  const confirm = () => {
    const name = value.trim();
    if (name && name !== portfolio.name) renamePortfolio(portfolio.id, name);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-[360px] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Rename Portfolio</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={16} /></button>
        </div>
        <div className="px-4 py-4">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Portfolio name</label>
          <input
            className="input-sm w-full"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') onClose(); }}
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={confirm} disabled={!value.trim()}>Save</button>
        </div>
      </div>
    </div>
  );
}

function MergeModal({ portfolio, onClose }: { portfolio: Portfolio; onClose: () => void }) {
  const { portfolios, mergePortfolios } = useTableStore(useShallow(s => ({
    portfolios: s.portfolios,
    mergePortfolios: s.mergePortfolios,
  })));
  const others = portfolios.filter(p => p.id !== portfolio.id);
  const [targetId, setTargetId] = useState(others[0]?.id ?? '');

  const confirm = () => {
    if (targetId) mergePortfolios(portfolio.id, targetId);
    onClose();
  };

  const targetPortfolio = others.find(p => p.id === targetId);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-[360px] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Merge Portfolio</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={16} /></button>
        </div>
        <div className="px-4 py-4 space-y-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            All positions from <strong className="text-gray-800 dark:text-gray-200">{portfolio.name}</strong> will be moved into the selected portfolio. <strong className="text-gray-800 dark:text-gray-200">{portfolio.name}</strong> will then be deleted.
          </p>
          {others.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No other portfolios to merge into.</p>
          ) : (
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Merge into</label>
              <select className="select-sm w-full" value={targetId} onChange={e => setTargetId(e.target.value)}>
                {others.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.positions.length} positions)</option>
                ))}
              </select>
            </div>
          )}
          {targetPortfolio && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500">
              Result: {targetPortfolio.name} will have {targetPortfolio.positions.length + portfolio.positions.length} positions.
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={confirm} disabled={!targetId || others.length === 0}>Merge →</button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ portfolio, onClose }: { portfolio: Portfolio; onClose: () => void }) {
  const { deletePortfolio, setPortfolioViewMode } = useTableStore(useShallow(s => ({
    deletePortfolio: s.deletePortfolio,
    setPortfolioViewMode: s.setPortfolioViewMode,
  })));

  const confirm = () => {
    deletePortfolio(portfolio.id);
    setPortfolioViewMode(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-[360px] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Delete Portfolio</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={16} /></button>
        </div>
        <div className="px-4 py-4">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Are you sure you want to delete <strong className="text-gray-900 dark:text-gray-100">{portfolio.name}</strong>?
            This will remove all {portfolio.positions.length} position{portfolio.positions.length !== 1 ? 's' : ''} and cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={confirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Action bar ────────────────────────────────────────────────────────────────

function PortfolioActionBar() {
  const { portfolios, activePortfolioId } = useTableStore(useShallow(s => ({
    portfolios: s.portfolios,
    activePortfolioId: s.activePortfolioId,
  })));

  const [modal, setModal] = useState<'rename' | 'merge' | 'delete' | null>(null);

  const portfolio = portfolios.find(p => p.id === activePortfolioId);
  if (!portfolio) return null;

  const otherPortfolios = portfolios.filter(p => p.id !== activePortfolioId);

  return (
    <>
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 mr-1">{portfolio.name}</span>
        <div className="h-3 w-px bg-gray-200 dark:bg-gray-700" />
        <button className="btn btn-secondary btn-sm" onClick={() => setModal('rename')}>
          <Pencil size={11} className="mr-1" /> Rename
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => setModal('merge')} disabled={otherPortfolios.length === 0}>
          <GitMerge size={11} className="mr-1" /> Merge
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => setModal('delete')}>
          <Trash2 size={11} className="mr-1" /> Delete
        </button>
      </div>

      {modal === 'rename' && <RenameModal portfolio={portfolio} onClose={() => setModal(null)} />}
      {modal === 'merge'  && <MergeModal  portfolio={portfolio} onClose={() => setModal(null)} />}
      {modal === 'delete' && <DeleteModal portfolio={portfolio} onClose={() => setModal(null)} />}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function PortfolioPage({
  forceOpenFilter = false,
  onForceOpenConsumed,
}: {
  forceOpenFilter?: boolean;
  onForceOpenConsumed?: () => void;
} = {}) {
  const {
    portfolios, activePortfolioId, portfolioViewMode,
    addPortfolio, setActivePortfolio, setPortfolioViewMode, data,
  } = useTableStore(useShallow(s => ({
    portfolios: s.portfolios,
    activePortfolioId: s.activePortfolioId,
    portfolioViewMode: s.portfolioViewMode,
    addPortfolio: s.addPortfolio,
    setActivePortfolio: s.setActivePortfolio,
    setPortfolioViewMode: s.setPortfolioViewMode,
    data: s.data,
  })));

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const filteredCount = useFilteredCount();

  const selectedId = portfolioViewMode ? activePortfolioId : 'all';

  const selectPortfolio = (id: string | 'all') => {
    if (id === 'all') {
      setPortfolioViewMode(false);
    } else {
      setActivePortfolio(id);
      setPortfolioViewMode(true);
    }
  };

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    addPortfolio(name);
    const created = useTableStore.getState().portfolios.at(-1);
    if (created) {
      setActivePortfolio(created.id);
      setPortfolioViewMode(true);
    }
    setCreating(false);
    setNewName('');
  };

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Left sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 dark:border-gray-700">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Portfolios</span>
          <button onClick={() => setCreating(v => !v)} className="btn btn-primary btn-sm">
            + New
          </button>
        </div>

        {creating && (
          <div className="px-2 py-2 border-b border-gray-200 dark:border-gray-700 flex gap-1">
            <input
              className="input-sm flex-1 min-w-0"
              placeholder="Portfolio name…"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setCreating(false); setNewName(''); } }}
              autoFocus
            />
            <button className="btn btn-primary btn-sm" onClick={handleCreate} disabled={!newName.trim()}>Add</button>
            <button className="btn btn-ghost btn-sm p-1" onClick={() => { setCreating(false); setNewName(''); }}><X size={12} /></button>
          </div>
        )}

        <button
          onClick={() => selectPortfolio('all')}
          className={`flex items-center justify-between px-3 py-2.5 text-xs text-left w-full transition-colors
            ${selectedId === 'all'
              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-medium'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
        >
          <span>All Bonds</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium
            ${selectedId === 'all'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
            {data.length.toLocaleString()}
          </span>
        </button>

        <div className="h-px bg-gray-100 dark:bg-gray-800 mx-3" />

        <div className="flex-1 overflow-y-auto py-1">
          {portfolios.length === 0 ? (
            <p className="px-3 py-6 text-[10px] text-gray-400 dark:text-gray-500 text-center leading-relaxed">
              No portfolios yet.<br />Click "+ Add New" to create one.
            </p>
          ) : (
            portfolios.map(p => {
              const isSelected = selectedId === p.id;
              return (
                <div
                  key={p.id}
                  className={`flex flex-col px-3 py-2 cursor-pointer transition-colors
                    ${isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  onClick={() => selectPortfolio(p.id)}
                >
                  <span className={`text-xs truncate ${isSelected ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-700 dark:text-gray-200'}`}>
                    {p.name}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {p.positions.length} position{p.positions.length !== 1 ? 's' : ''}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main table area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <TableToolbar forceOpenFilter={forceOpenFilter} onForceOpenConsumed={onForceOpenConsumed} />
        {portfolioViewMode && <PortfolioActionBar />}
        <div style={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden' }}>
          <BondTable />
        </div>
        <PaginationBar totalRows={filteredCount} />
      </div>
    </div>
  );
}
