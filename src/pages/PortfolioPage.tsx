import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useTableStore } from '../store/tableStore';
import { useShallow } from 'zustand/react/shallow';
import { BondTable, useFilteredCount } from '../components/table/BondTable';
import { TableToolbar } from '../components/table/TableToolbar';
import { PaginationBar } from '../components/table/PaginationBar';

export function PortfolioPage() {
  const {
    portfolios, activePortfolioId, portfolioViewMode,
    addPortfolio, deletePortfolio,
    setActivePortfolio, setPortfolioViewMode,
    data,
  } = useTableStore(useShallow(s => ({
    portfolios: s.portfolios,
    activePortfolioId: s.activePortfolioId,
    portfolioViewMode: s.portfolioViewMode,
    addPortfolio: s.addPortfolio,
    deletePortfolio: s.deletePortfolio,
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
          <button
            onClick={() => setCreating(v => !v)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={10} /> Add New +
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
            <button className="btn btn-primary btn-sm px-2" onClick={handleCreate} disabled={!newName.trim()}>Add</button>
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

        {/* Portfolio list */}
        <div className="flex-1 overflow-y-auto py-1">
          {portfolios.length === 0 ? (
            <p className="px-3 py-6 text-[10px] text-gray-400 dark:text-gray-500 text-center leading-relaxed">
              No portfolios yet.<br />Click "Add New +" to create one.
            </p>
          ) : (
            portfolios.map(p => {
              const isSelected = selectedId === p.id;
              return (
                <div
                  key={p.id}
                  className={`group flex items-center justify-between px-3 py-2 cursor-pointer transition-colors
                    ${isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  onClick={() => selectPortfolio(p.id)}
                >
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs truncate ${isSelected ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-700 dark:text-gray-200'}`}>
                      {p.name}
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500">
                      {p.positions.length} position{p.positions.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deletePortfolio(p.id); }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 ml-1 text-gray-400 hover:text-red-500 transition-colors rounded flex-shrink-0"
                    title="Delete portfolio"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main table area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TableToolbar />
        <div style={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden' }}>
          <BondTable />
        </div>
        <PaginationBar totalRows={filteredCount} />
      </div>
    </div>
  );
}
