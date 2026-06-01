import type { FilterGroup } from '../types/bond';

export interface QuickPreset {
  id: string;
  label: string;
  filterTree: FilterGroup;
}

export const QUICK_PRESETS: QuickPreset[] = [
  {
    id: 'agency',
    label: 'Agency Only',
    filterTree: {
      id: 'p1',
      type: 'group',
      logic: 'OR',
      children: [
        { id: 'p1c1', type: 'condition', field: 'bondType', operator: '=', value: 'Agency CMO' },
        { id: 'p1c2', type: 'condition', field: 'bondType', operator: '=', value: 'Spec Pool' },
        { id: 'p1c3', type: 'condition', field: 'bondType', operator: '=', value: 'SBA' },
      ],
    },
  },
  {
    id: 'nonagency',
    label: 'Non-Agency',
    filterTree: {
      id: 'p2',
      type: 'group',
      logic: 'AND',
      children: [
        { id: 'p2c1', type: 'condition', field: 'bondType', operator: '=', value: 'Non-Agency CMO' },
      ],
    },
  },
  {
    id: 'cmbs',
    label: 'CMBS',
    filterTree: {
      id: 'p3',
      type: 'group',
      logic: 'AND',
      children: [
        { id: 'p3c1', type: 'condition', field: 'bondType', operator: '=', value: 'CMBS' },
      ],
    },
  },
  {
    id: 'abs',
    label: 'ABS',
    filterTree: {
      id: 'p4',
      type: 'group',
      logic: 'AND',
      children: [
        { id: 'p4c1', type: 'condition', field: 'bondType', operator: '=', value: 'ABS' },
      ],
    },
  },
  {
    id: 'ig',
    label: 'IG Only',
    filterTree: {
      id: 'p5',
      type: 'group',
      logic: 'OR',
      children: [
        { id: 'p5c1', type: 'condition', field: 'rating', operator: 'in', value: 'AAA,AA+,AA,AA-,A+,A,A-,BBB+,BBB,BBB-' },
      ],
    },
  },
  {
    id: 'hy',
    label: 'HY',
    filterTree: {
      id: 'p6',
      type: 'group',
      logic: 'OR',
      children: [
        { id: 'p6c1', type: 'condition', field: 'rating', operator: 'in', value: 'BB+,BB,BB-,B+,B,B-,CCC,CC,C,D' },
      ],
    },
  },
  {
    id: 'short-wal',
    label: 'Short WAL',
    filterTree: {
      id: 'p7',
      type: 'group',
      logic: 'AND',
      children: [
        { id: 'p7c1', type: 'condition', field: 'wal', operator: '<', value: '3' },
      ],
    },
  },
  {
    id: 'long-wal',
    label: 'Long WAL',
    filterTree: {
      id: 'p8',
      type: 'group',
      logic: 'AND',
      children: [
        { id: 'p8c1', type: 'condition', field: 'wal', operator: '>', value: '7' },
      ],
    },
  },
  {
    id: 'callable',
    label: 'Callable',
    filterTree: {
      id: 'p9',
      type: 'group',
      logic: 'AND',
      children: [
        { id: 'p9c1', type: 'condition', field: 'callable', operator: 'is-true', value: '' },
      ],
    },
  },
  {
    id: 'eur',
    label: 'EUR',
    filterTree: {
      id: 'p10',
      type: 'group',
      logic: 'AND',
      children: [
        { id: 'p10c1', type: 'condition', field: 'currency', operator: '=', value: 'EUR' },
      ],
    },
  },
];
