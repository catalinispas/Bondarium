import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Bond, FilterGroup, ConditionalRule, SavedFilter, Density } from '../types/bond';
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

      savedFilters: [],
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
      name: 'bond-table-state-v4',
      partialize: state => ({
        // columnOrder intentionally excluded — always re-derived from COLUMN_DEFS
        columnVisibility: state.columnVisibility,
        columnPinning: state.columnPinning,
        columnSizing: state.columnSizing,
        sorting: state.sorting,
        density: state.density,
        darkMode: state.darkMode,
        savedFilters: state.savedFilters,
        conditionalRules: state.conditionalRules,
        groupBy: state.groupBy,
        pageSize: state.pageSize,
      }),
    }
  )
);
