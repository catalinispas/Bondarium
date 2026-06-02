import type { FilterGroup } from '../types/bond';

export interface QuickPreset {
  id: string;
  label: string;
  category: string;
  filterTree: FilterGroup;
}

export const QUICK_PRESET_CATEGORIES = ['Sector', 'Rating', 'Spread', 'Price', 'Duration', 'Other'];

export const QUICK_PRESETS: QuickPreset[] = [
  // ── Sector ──────────────────────────────────────────────────────────────────
  {
    id: 'agency',
    label: 'Agency',
    category: 'Sector',
    filterTree: {
      id: 'p1', type: 'group', logic: 'OR', children: [
        { id: 'p1c1', type: 'condition', field: 'bondType', operator: '=', value: 'Agency CMO' },
        { id: 'p1c2', type: 'condition', field: 'bondType', operator: '=', value: 'Spec Pool' },
        { id: 'p1c3', type: 'condition', field: 'bondType', operator: '=', value: 'SBA' },
      ],
    },
  },
  {
    id: 'nonagency',
    label: 'Non-Agency',
    category: 'Sector',
    filterTree: {
      id: 'p2', type: 'group', logic: 'AND', children: [
        { id: 'p2c1', type: 'condition', field: 'bondType', operator: '=', value: 'Non-Agency CMO' },
      ],
    },
  },
  {
    id: 'cmbs',
    label: 'CMBS',
    category: 'Sector',
    filterTree: {
      id: 'p3', type: 'group', logic: 'AND', children: [
        { id: 'p3c1', type: 'condition', field: 'bondType', operator: '=', value: 'CMBS' },
      ],
    },
  },
  {
    id: 'abs',
    label: 'ABS',
    category: 'Sector',
    filterTree: {
      id: 'p4', type: 'group', logic: 'AND', children: [
        { id: 'p4c1', type: 'condition', field: 'bondType', operator: '=', value: 'ABS' },
      ],
    },
  },
  {
    id: 'clo',
    label: 'CLO',
    category: 'Sector',
    filterTree: {
      id: 'pclo', type: 'group', logic: 'AND', children: [
        { id: 'pclo1', type: 'condition', field: 'bondType', operator: '=', value: 'CDO/CLO' },
      ],
    },
  },

  // ── Rating ───────────────────────────────────────────────────────────────────
  {
    id: 'aaa',
    label: 'AAA',
    category: 'Rating',
    filterTree: {
      id: 'paaa', type: 'group', logic: 'AND', children: [
        { id: 'paaa1', type: 'condition', field: 'rating', operator: '=', value: 'AAA' },
      ],
    },
  },
  {
    id: 'ig',
    label: 'IG Only',
    category: 'Rating',
    filterTree: {
      id: 'p5', type: 'group', logic: 'OR', children: [
        { id: 'p5c1', type: 'condition', field: 'rating', operator: 'in', value: 'AAA,AA+,AA,AA-,A+,A,A-,BBB+,BBB,BBB-' },
      ],
    },
  },
  {
    id: 'hy',
    label: 'HY',
    category: 'Rating',
    filterTree: {
      id: 'p6', type: 'group', logic: 'OR', children: [
        { id: 'p6c1', type: 'condition', field: 'rating', operator: 'in', value: 'BB+,BB,BB-,B+,B,B-,CCC,CC,C,D' },
      ],
    },
  },
  {
    id: 'nr',
    label: 'NR',
    category: 'Rating',
    filterTree: {
      id: 'pnr', type: 'group', logic: 'AND', children: [
        { id: 'pnr1', type: 'condition', field: 'rating', operator: '=', value: 'NR' },
      ],
    },
  },

  // ── Spread ───────────────────────────────────────────────────────────────────
  {
    id: 'spread-200',
    label: 'Spread > 200',
    category: 'Spread',
    filterTree: {
      id: 'ps200', type: 'group', logic: 'AND', children: [
        { id: 'ps200c1', type: 'condition', field: 'spread', operator: '>', value: '200' },
      ],
    },
  },
  {
    id: 'spread-300',
    label: 'Spread > 300',
    category: 'Spread',
    filterTree: {
      id: 'ps300', type: 'group', logic: 'AND', children: [
        { id: 'ps300c1', type: 'condition', field: 'spread', operator: '>', value: '300' },
      ],
    },
  },
  {
    id: 'spread-500',
    label: 'Spread > 500',
    category: 'Spread',
    filterTree: {
      id: 'ps500', type: 'group', logic: 'AND', children: [
        { id: 'ps500c1', type: 'condition', field: 'spread', operator: '>', value: '500' },
      ],
    },
  },

  // ── Price ────────────────────────────────────────────────────────────────────
  {
    id: 'price-95',
    label: 'Price < 95',
    category: 'Price',
    filterTree: {
      id: 'pp95', type: 'group', logic: 'AND', children: [
        { id: 'pp95c1', type: 'condition', field: 'price', operator: '<', value: '95' },
      ],
    },
  },
  {
    id: 'price-80',
    label: 'Price < 80',
    category: 'Price',
    filterTree: {
      id: 'pp80', type: 'group', logic: 'AND', children: [
        { id: 'pp80c1', type: 'condition', field: 'price', operator: '<', value: '80' },
      ],
    },
  },

  // ── Duration ─────────────────────────────────────────────────────────────────
  {
    id: 'short-wal',
    label: 'Short WAL',
    category: 'Duration',
    filterTree: {
      id: 'p7', type: 'group', logic: 'AND', children: [
        { id: 'p7c1', type: 'condition', field: 'wal', operator: '<', value: '3' },
      ],
    },
  },
  {
    id: 'long-wal',
    label: 'Long WAL',
    category: 'Duration',
    filterTree: {
      id: 'p8', type: 'group', logic: 'AND', children: [
        { id: 'p8c1', type: 'condition', field: 'wal', operator: '>', value: '7' },
      ],
    },
  },

  // ── Other ────────────────────────────────────────────────────────────────────
  {
    id: 'callable',
    label: 'Callable',
    category: 'Other',
    filterTree: {
      id: 'p9', type: 'group', logic: 'AND', children: [
        { id: 'p9c1', type: 'condition', field: 'callable', operator: 'is-true', value: '' },
      ],
    },
  },
  {
    id: 'eur',
    label: 'EUR',
    category: 'Other',
    filterTree: {
      id: 'p10', type: 'group', logic: 'AND', children: [
        { id: 'p10c1', type: 'condition', field: 'currency', operator: '=', value: 'EUR' },
      ],
    },
  },
  {
    id: 'usd',
    label: 'USD',
    category: 'Other',
    filterTree: {
      id: 'pusd', type: 'group', logic: 'AND', children: [
        { id: 'pusd1', type: 'condition', field: 'currency', operator: '=', value: 'USD' },
      ],
    },
  },
];
