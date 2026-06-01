import { useState } from 'react';
import { X, Pencil, GitMerge, Trash2 } from 'lucide-react';
import { useTableStore } from '../store/tableStore';
import { useShallow } from 'zustand/react/shallow';
import { BondTable, useFilteredCount } from '../components/table/BondTable';
import { TableToolbar } from '../components/table/TableToolbar';
import { PaginationBar } from '../components/table/PaginationBar';

function PortfolioActionBar() {
  const {
    portfolios, activePortfolioId,
    deletePortfolio, renamePortfolio, mergePortfolios, setPortfolioViewMode,
  } = useTableStore(useShallow(s => ({
    portfolios: s.portfolios,
    activePortfolioId: s.activePortfolioId,
    deletePortfolio: s.deletePortfolio,
    renamePortfolio: s.renamePortfolio,
    mergePortfolios: s.mergePortfolios,
    setPortfolioViewMode: s.setPortfolioViewMode,
  })));

  const [mode, setMode] = useState<'idle' | 'rename' | 'merge' | 'delete'>('idle');
  const [renameValue, setRenameValue] = useState('');
  const [mergeTarget, setMergeTarget] = useState('');

  const portfolio = portfolios.find(p => p.id === activePortfolioId);
  if (!portfolio) return null;

  const otherPortfolios = portfolios.filter(p => p.id !== activePortfolioId);

  const startRename = () => {
    setRenameValue(portfolio.name);
    setMode('rename');
  };

  const confirmRename = () => {
    const name = renameValue.trim();
    if (name && name !== portfolio.name) renamePortfolio(portfolio.id, name);
    setMode('idle');
  };

  const startMerge = () => {
    setMergeTarget(otherPortfolios[0]?.id ?? '');
    setMode('merge');
  };

  const confirmMerge = () => {
    if (mergeTarget) mergePortfolios(portfolio.id, mergeTarget);
    setMode('idle');
  };

  const confirmDelete = () => {
    deletePortfolio(portfolio.id);
    setPortfolioViewMode(false);
    setMode('idle');
  };

  return (
    <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">

      {mode === 'rename' ? (
        <>
          <input
            className="input-sm w-48"
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setMode('idle'); }}
            autoFocus
          />
          <button className="btn btn-primary btn-sm" onClick={confirmRename} disabled={!renameValue.trim()}>Save</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setMode('idle')}>Cancel</button>
        </>
      ) : mode === 'merge' ? (
        <>
          <span className="text-xs text-gray-600 dark:text-gray-400">Merge <strong className="text-gray-900 dark:text-gray-100">{portfolio.name}</strong> into:</span>
          {otherPortfolios.length === 0 ? (
            <span className="text-xs text-gray-400 italic">No other portfolios</span>
          ) : (
            <select
              className="select-sm"
              value={mergeTarget}
              onChange={e => setMergeTarget(e.target.value)}
            >
              {otherPortfolios.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <button className="btn btn-primary btn-sm" onClick={confirmMerge} disabled={!mergeTarget}>Merge</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setMode('idle')}>Cancel</button>
        </>
      ) : mode === 'delete' ? (
        <>
          <span className="text-xs text-gray-600 dark:text-gray-400">Delete <strong className="text-gray-900 dark:text-gray-100">{portfolio.name}</strong>?</span>
          <button className="btn btn-danger btn-sm" onClick={confirmDelete}>Yes, delete</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setMode('idle')}>Cancel</button>
        </>
      ) : (
        <>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 mr-1">{portfolio.name}</span>
          <div className="h-3 w-px bg-gray-200 dark:bg-gray-700" />
          <button className="btn btn-secondary btn-sm" onClick={startRename}>
            <Pencil size={11} className="mr-1" /> Rename
          </button>
          <button className="btn btn-secondary btn-sm" onClick={startMerge} disabled={otherPortfolios.length === 0}>
            <GitMerge size={11} className="mr-1" /> Merge
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => setMode('delete')}>
            <Trash2 size={11} className="mr-1" /> Delete
          </button>
        </>
      )}
    </div>
  );
}

export function PortfolioPage() {
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
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 dark:border-gray-700">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Portfolios</span>
          <button onClick={() => setCreating(v => !v)} className="btn btn-primary btn-sm">
            + Add New
          </button>
        </div>

        {/* Inline create form */}
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

        {/* All Bonds item */}
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

        {/* Portfolio list — no delete button here */}
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TableToolbar />
        {portfolioViewMode && <PortfolioActionBar />}
        <div style={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden' }}>
          <BondTable />
        </div>
        <PaginationBar totalRows={filteredCount} />
      </div>
    </div>
  );
}
