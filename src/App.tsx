import { useEffect, useState, Component, type ReactNode } from 'react';
import { BondTable, useFilteredCount } from './components/table/BondTable';
import { TableToolbar } from './components/table/TableToolbar';
import { PaginationBar } from './components/table/PaginationBar';
import { DesignSystem } from './pages/DesignSystem';
import { PortfolioPage } from './pages/PortfolioPage';
import { FiltersPage } from './pages/FiltersPage';
import { useTableStore } from './store/tableStore';
import { useLiveData } from './hooks/useLiveData';
import { summarizeTree } from './components/table/FilterBuilder';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e.message + '\n' + e.stack }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'monospace', fontSize: 12, color: '#ef4444', whiteSpace: 'pre-wrap', overflow: 'auto' }}>
          <strong>Runtime error — paste this to the developer:</strong>{'\n\n'}{this.state.error}
        </div>
      );
    }
    return this.props.children;
  }
}

type Tab = 'offerings' | 'portfolio' | 'filters';

function ActiveFilterBar({ onEdit }: { onEdit: () => void }) {
  const filterTree = useTableStore(s => s.filterTree);
  const setFilterTree = useTableStore(s => s.setFilterTree);
  if (!filterTree || filterTree.children.length === 0) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800 flex-shrink-0">
      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex-shrink-0">Filter:</span>
      <button
        onClick={onEdit}
        className="text-xs text-blue-600 dark:text-blue-400 flex-1 truncate font-mono text-left hover:underline"
        title="Click to edit filter"
      >
        {summarizeTree(filterTree)}
      </button>
      <button
        onClick={() => setFilterTree(null)}
        className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 flex-shrink-0 ml-1 px-2 py-0.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
      >
        Clear Filter
      </button>
    </div>
  );
}

function Inner() {
  const darkMode = useTableStore(s => s.darkMode);
  const setPortfolioViewMode = useTableStore(s => s.setPortfolioViewMode);
  const clearSelected = useTableStore(s => s.clearSelected);
  const [showDesignSystem, setShowDesignSystem] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('offerings');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  useLiveData();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const filteredCount = useFilteredCount();

  const switchTab = (tab: Tab) => {
    if (tab === 'offerings') setPortfolioViewMode(false);
    clearSelected();
    setActiveTab(tab);
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950 overflow-hidden">
      {/* Top header bar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 dark:bg-slate-950 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">B</span>
          </div>
          <h1 className="text-sm font-semibold text-white">Bondarium</h1>
        </div>
        <span className="text-slate-400 text-xs">Structured Finance Analytics</span>

        {/* Tab navigation */}
        <div className="flex items-center gap-0.5 ml-4 bg-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => switchTab('offerings')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors
              ${activeTab === 'offerings'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            Offerings
          </button>
          <button
            onClick={() => switchTab('portfolio')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors
              ${activeTab === 'portfolio'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => switchTab('filters')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors
              ${activeTab === 'filters'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            Filters
          </button>
        </div>

        <div className="ml-auto">
          <button
            onClick={() => setShowDesignSystem(v => !v)}
            className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
          >
            {showDesignSystem ? '← Back' : 'Design System'}
          </button>
        </div>
      </div>

      {showDesignSystem ? (
        <div style={{ flex: '1 1 0', minHeight: 0, overflow: 'auto' }}>
          <DesignSystem />
        </div>
      ) : activeTab === 'portfolio' ? (
        <div style={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden' }}>
          <PortfolioPage />
        </div>
      ) : activeTab === 'filters' ? (
        <div style={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden' }}>
          <FiltersPage onNavigateToOfferings={() => switchTab('offerings')} />
        </div>
      ) : (
        <>
          <TableToolbar forceOpenFilter={filterPanelOpen} onForceOpenConsumed={() => setFilterPanelOpen(false)} />
          <ActiveFilterBar onEdit={() => setFilterPanelOpen(true)} />
          <div style={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden' }}>
            <BondTable />
          </div>
          <PaginationBar totalRows={filteredCount} />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Inner />
    </ErrorBoundary>
  );
}
