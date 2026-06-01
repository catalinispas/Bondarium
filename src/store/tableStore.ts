import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Bond, FilterGroup, ConditionalRule, SavedFilter, Density } from '../types/bond';
import type { Portfolio, PortfolioPosition } from '../types/portfolio';

const DEFAULT_PORTFOLIOS: Portfolio[] = [
  {
    id: 'default-portfolio-1',
    name: 'Core Fixed Income',
    createdAt: '2025-09-15T09:00:00.000Z',
    positions: [
      { id: 'pos-1-1', bondId: '1',  notional: 2_000_000, purchasePrice: 97.500, purchaseDate: '2025-09-15', notes: 'Agency CMO anchor' },
      { id: 'pos-1-2', bondId: '5',  notional: 1_500_000, purchasePrice: 99.250, purchaseDate: '2025-10-01' },
      { id: 'pos-1-3', bondId: '10', notional: 3_000_000, purchasePrice: 101.125, purchaseDate: '2025-10-15' },
      { id: 'pos-1-4', bondId: '15', notional: 2_500_000, purchasePrice: 98.750, purchaseDate: '2025-11-01' },
      { id: 'pos-1-5', bondId: '20', notional: 1_000_000, purchasePrice: 103.500, purchaseDate: '2025-11-20' },
      { id: 'pos-1-6', bondId: '25', notional: 2_000_000, purchasePrice: 96.000, purchaseDate: '2025-12-05' },
      { id: 'pos-1-7', bondId: '30', notional: 1_750_000, purchasePrice: 99.875, purchaseDate: '2026-01-10' },
      { id: 'pos-1-8', bondId: '35', notional: 1_250_000, purchasePrice: 97.250, purchaseDate: '2026-02-14' },
    ],
  },
  {
    id: 'default-portfolio-2',
    name: 'High Yield Focus',
    createdAt: '2025-10-20T10:30:00.000Z',
    positions: [
      { id: 'pos-2-1', bondId: '2',  notional: 500_000,   purchasePrice: 78.500, purchaseDate: '2025-10-20', notes: 'Distressed' },
      { id: 'pos-2-2', bondId: '7',  notional: 750_000,   purchasePrice: 85.250, purchaseDate: '2025-11-05' },
      { id: 'pos-2-3', bondId: '12', notional: 1_000_000, purchasePrice: 92.000, purchaseDate: '2025-11-25' },
      { id: 'pos-2-4', bondId: '18', notional: 600_000,   purchasePrice: 80.750, purchaseDate: '2025-12-10' },
      { id: 'pos-2-5', bondId: '23', notional: 800_000,   purchasePrice: 88.500, purchaseDate: '2026-01-08' },
      { id: 'pos-2-6', bondId: '28', notional: 1_200_000, purchasePrice: 95.125, purchaseDate: '2026-02-20' },
    ],
  },
  {
    id: 'default-portfolio-3',
    name: 'Short Duration ABS',
    createdAt: '2026-01-05T08:00:00.000Z',
    positions: [
      { id: 'pos-3-1', bondId: '3',  notional: 5_000_000, purchasePrice: 99.500,  purchaseDate: '2026-01-05' },
      { id: 'pos-3-2', bondId: '8',  notional: 3_000_000, purchasePrice: 100.125, purchaseDate: '2026-01-12' },
      { id: 'pos-3-3', bondId: '13', notional: 2_500_000, purchasePrice: 98.875,  purchaseDate: '2026-01-20' },
      { id: 'pos-3-4', bondId: '19', notional: 4_000_000, purchasePrice: 101.250, purchaseDate: '2026-02-01' },
      { id: 'pos-3-5', bondId: '24', notional: 2_000_000, purchasePrice: 99.000,  purchaseDate: '2026-02-15' },
      { id: 'pos-3-6', bondId: '29', notional: 3_500_000, purchasePrice: 100.750, purchaseDate: '2026-03-01' },
      { id: 'pos-3-7', bondId: '34', notional: 1_500_000, purchasePrice: 98.500,  purchaseDate: '2026-03-20' },
    ],
  },
];
import { MOCK_DATA } from '../data/mockData';
import { DEFAULT_VISIBLE, DEFAULT_WIDTHS, COLUMN_DEFS, colId } from '../data/columns';

export type PinSide = 'left' | 'right' | null;

interface TableState {
  // Data
  data: Bond[];
  setData: (data: Bond[]) => void;
  updateRows: (updates: Record<string, Partial<Bond>>) => void;

  // Column config
  columnVisibility: Record<string, boolean>;
  setColumnVisibility: (v: Record<string, boolean>) => void;
  toggleColumn: (id: string) => void;

  columnPinning: { left: string[]; right: string[] };
  setColumnPinning: (p: { left: string[]; right: string[] }) => void;
  pinColumn: (id: string, side: PinSide) => void;

  columnOrder: string[];
  setColumnOrder: (order: string[]) => void;

  columnSizing: Record<string, number>;
  setColumnSizing: (s: Record<string, number>) => void;

  // Sorting
  sorting: { id: string; desc: boolean }[];
  setSorting: (s: { id: string; desc: boolean }[]) => void;

  // Filter
  filterTree: FilterGroup | null;
  setFilterTree: (t: FilterGroup | null) => void;
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
  activePresets: string[];
  togglePreset: (id: string) => void;
  clearPresets: () => void;

  // Grouping
  groupBy: string | null;
  setGroupBy: (g: string | null) => void;

  // Pagination
  pageIndex: number;
  pageSize: number;
  setPageIndex: (i: number) => void;
  setPageSize: (s: number) => void;

  // Expansion
  expanded: Record<string, boolean>;
  toggleExpanded: (id: string) => void;

  // Selection
  selected: Record<string, boolean>;
  toggleSelected: (id: string) => void;
  clearSelected: () => void;

  // UX
  density: Density;
  setDensity: (d: Density) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Live feed
  liveMode: boolean;
  setLiveMode: (v: boolean) => void;

  // Conditional formatting
  conditionalRules: ConditionalRule[];
  setConditionalRules: (r: ConditionalRule[]) => void;

  // Saved filters
  savedFilters: SavedFilter[];
  saveFilter: (name: string, tree: FilterGroup) => void;
  deleteFilter: (name: string) => void;

  // Portfolio
  portfolios: Portfolio[];
  activePortfolioId: string | null;
  portfolioViewMode: boolean;
  addPortfolio: (name: string) => void;
  deletePortfolio: (id: string) => void;
  renamePortfolio: (id: string, name: string) => void;
  mergePortfolios: (sourceId: string, targetId: string) => void;
  setActivePortfolio: (id: string | null) => void;
  setPortfolioViewMode: (v: boolean) => void;
  addPosition: (portfolioId: string, bondId: string, notional: number, purchasePrice: number, purchaseDate: string, notes?: string) => void;
  removePosition: (portfolioId: string, positionId: string) => void;
  updatePosition: (portfolioId: string, positionId: string, updates: Partial<Omit<PortfolioPosition, 'id' | 'bondId'>>) => void;
}

export const useTableStore = create<TableState>()(
  persist(
    (set, get) => ({
      data: MOCK_DATA,
      setData: data => set({ data }),
      updateRows: updates => set(state => ({
        data: state.data.map(row =>
          updates[row.id] ? { ...row, ...updates[row.id] } : row
        ),
      })),

      columnVisibility: DEFAULT_VISIBLE,
      setColumnVisibility: v => set({ columnVisibility: v }),
      toggleColumn: id => set(s => ({
        columnVisibility: { ...s.columnVisibility, [id]: !s.columnVisibility[id] },
      })),

      columnPinning: { left: ['select', 'cusip', 'description'], right: [] },
      setColumnPinning: p => set({ columnPinning: p }),
      pinColumn: (id, side) => set(s => {
        const left = s.columnPinning.left.filter(c => c !== id);
        const right = s.columnPinning.right.filter(c => c !== id);
        if (side === 'left') left.push(id);
        else if (side === 'right') right.push(id);
        return { columnPinning: { left, right } };
      }),

      columnOrder: COLUMN_DEFS.map(c => colId(c)),
      setColumnOrder: order => set({ columnOrder: order }),

      columnSizing: DEFAULT_WIDTHS,
      setColumnSizing: s => set({ columnSizing: s }),

      sorting: [],
      setSorting: sorting => set({ sorting }),

      filterTree: null,
      setFilterTree: filterTree => set({ filterTree }),
      globalSearch: '',
      setGlobalSearch: globalSearch => set({ globalSearch }),
      activePresets: [],
      togglePreset: id => set(s => ({
        activePresets: s.activePresets.includes(id)
          ? s.activePresets.filter(p => p !== id)
          : [...s.activePresets, id],
      })),
      clearPresets: () => set({ activePresets: [] }),

      groupBy: null,
      setGroupBy: groupBy => set({ groupBy }),

      pageIndex: 0,
      pageSize: 100,
      setPageIndex: pageIndex => set({ pageIndex }),
      setPageSize: pageSize => set({ pageSize, pageIndex: 0 }),

      expanded: {},
      toggleExpanded: id => set(s => ({
        expanded: { ...s.expanded, [id]: !s.expanded[id] },
      })),

      selected: {},
      toggleSelected: id => set(s => ({
        selected: { ...s.selected, [id]: !s.selected[id] },
      })),
      clearSelected: () => set({ selected: {} }),

      density: 'comfortable',
      setDensity: density => set({ density }),
      darkMode: false,
      toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),

      liveMode: false,
      setLiveMode: liveMode => set({ liveMode }),

      conditionalRules: [
        { id: 'r1', column: 'spread', operator: '>', value: '300', bgColor: '#fecaca', textColor: '#7f1d1d', label: 'High spread' },
        { id: 'r2', column: 'price', operator: '<', value: '80', bgColor: '#fed7aa', textColor: '#7c2d12', label: 'Discount price' },
      ],
      setConditionalRules: conditionalRules => set({ conditionalRules }),

      portfolios: DEFAULT_PORTFOLIOS,
      activePortfolioId: null,
      portfolioViewMode: false,

      addPortfolio: name => set(s => ({
        portfolios: [...s.portfolios, {
          id: crypto.randomUUID(),
          name,
          createdAt: new Date().toISOString(),
          positions: [],
        }],
      })),

      deletePortfolio: id => set(s => ({
        portfolios: s.portfolios.filter(p => p.id !== id),
        activePortfolioId: s.activePortfolioId === id ? null : s.activePortfolioId,
        portfolioViewMode: s.activePortfolioId === id ? false : s.portfolioViewMode,
      })),

      renamePortfolio: (id, name) => set(s => ({
        portfolios: s.portfolios.map(p => p.id === id ? { ...p, name } : p),
      })),

      mergePortfolios: (sourceId, targetId) => set(s => {
        const source = s.portfolios.find(p => p.id === sourceId);
        if (!source) return {};
        return {
          portfolios: s.portfolios
            .map(p => p.id === targetId
              ? { ...p, positions: [...p.positions, ...source.positions.map(pos => ({ ...pos, id: crypto.randomUUID() }))] }
              : p
            )
            .filter(p => p.id !== sourceId),
          activePortfolioId: s.activePortfolioId === sourceId ? targetId : s.activePortfolioId,
        };
      }),

      setActivePortfolio: id => set({ activePortfolioId: id }),
      setPortfolioViewMode: v => set({ portfolioViewMode: v }),

      addPosition: (portfolioId, bondId, notional, purchasePrice, purchaseDate, notes) =>
        set(s => ({
          portfolios: s.portfolios.map(p =>
            p.id !== portfolioId ? p : {
              ...p,
              positions: [...p.positions, {
                id: crypto.randomUUID(),
                bondId, notional, purchasePrice, purchaseDate,
                ...(notes ? { notes } : {}),
              }],
            }
          ),
        })),

      removePosition: (portfolioId, positionId) =>
        set(s => ({
          portfolios: s.portfolios.map(p =>
            p.id !== portfolioId ? p : {
              ...p,
              positions: p.positions.filter(pos => pos.id !== positionId),
            }
          ),
        })),

      updatePosition: (portfolioId, positionId, updates) =>
        set(s => ({
          portfolios: s.portfolios.map(p =>
            p.id !== portfolioId ? p : {
              ...p,
              positions: p.positions.map(pos =>
                pos.id !== positionId ? pos : { ...pos, ...updates }
              ),
            }
          ),
        })),

      savedFilters: [
        {
          name: 'Investment Grade',
          savedAt: '2025-09-01T00:00:00.000Z',
          tree: { id: 'ig-root', type: 'group', logic: 'OR', children: [
            { id: 'ig-1',  type: 'condition', field: 'rating', operator: 'in', value: 'AAA,AA+,AA,AA-,A+,A,A-,BBB+,BBB,BBB-' },
          ]},
        },
        {
          name: 'High Yield',
          savedAt: '2025-09-01T00:00:00.000Z',
          tree: { id: 'hy-root', type: 'group', logic: 'OR', children: [
            { id: 'hy-1', type: 'condition', field: 'rating', operator: 'in', value: 'BB+,BB,BB-,B+,B,B-,CCC,CC,C,D,NR' },
          ]},
        },
        {
          name: 'Wide Spread (> 300 bp)',
          savedAt: '2025-09-01T00:00:00.000Z',
          tree: { id: 'ws-root', type: 'group', logic: 'AND', children: [
            { id: 'ws-1', type: 'condition', field: 'spread', operator: '>', value: '300' },
          ]},
        },
        {
          name: 'Discounted Bonds (< 95)',
          savedAt: '2025-09-01T00:00:00.000Z',
          tree: { id: 'disc-root', type: 'group', logic: 'AND', children: [
            { id: 'disc-1', type: 'condition', field: 'price', operator: '<', value: '95' },
          ]},
        },
        {
          name: 'Short Duration IG',
          savedAt: '2025-09-01T00:00:00.000Z',
          tree: { id: 'sdig-root', type: 'group', logic: 'AND', children: [
            { id: 'sdig-1', type: 'condition', field: 'rating', operator: 'in', value: 'AAA,AA+,AA,AA-,A+,A,A-,BBB+,BBB,BBB-' },
            { id: 'sdig-2', type: 'condition', field: 'wal',    operator: '<',  value: '5' },
          ]},
        },
        {
          name: 'Distressed',
          savedAt: '2025-09-01T00:00:00.000Z',
          tree: { id: 'dist-root', type: 'group', logic: 'AND', children: [
            { id: 'dist-1', type: 'condition', field: 'spread', operator: '>',  value: '500' },
            { id: 'dist-2', type: 'condition', field: 'price',  operator: '<',  value: '80' },
          ]},
        },
        {
          name: 'EUR Bonds',
          savedAt: '2025-09-01T00:00:00.000Z',
          tree: { id: 'eur-root', type: 'group', logic: 'AND', children: [
            { id: 'eur-1', type: 'condition', field: 'currency', operator: '=', value: 'EUR' },
          ]},
        },
      ],
      saveFilter: (name, tree) => set(s => ({
        savedFilters: [
          ...s.savedFilters.filter(f => f.name !== name),
          { name, tree, savedAt: new Date().toISOString() },
        ],
      })),
      deleteFilter: name => set(s => ({
        savedFilters: s.savedFilters.filter(f => f.name !== name),
      })),
    }),
    {
      name: 'bond-table-state-v6',
      partialize: state => ({
        // columnOrder intentionally excluded — always re-derived from COLUMN_DEFS
        columnVisibility: state.columnVisibility,
        columnPinning: state.columnPinning,
        columnSizing: state.columnSizing,
        sorting: state.sorting,
        density: state.density,
        darkMode: state.darkMode,
        savedFilters: state.savedFilters,
        portfolios: state.portfolios,
        activePortfolioId: state.activePortfolioId,
        // portfolioViewMode intentionally not persisted
        conditionalRules: state.conditionalRules,
        groupBy: state.groupBy,
        pageSize: state.pageSize,
      }),
    }
  )
);
