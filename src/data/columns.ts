import type { ColumnDef } from '@tanstack/react-table';
import type { Bond } from '../types/bond';

const fmt = {
  number: (v: number, dp = 2) => v == null ? '' : v.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp }),
  currency: (v: number) => v == null ? '' : v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
  percent: (v: number, dp = 3) => v == null ? '' : v.toFixed(dp) + '%',
  bp: (v: number, dp = 1) => v == null ? '' : v.toFixed(dp) + ' bp',
  yrs: (v: number) => v == null ? '' : v.toFixed(2) + ' yr',
};

export type ColumnMeta = {
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  defaultVisible: boolean;
  defaultWidth: number;
  format?: (v: unknown) => string;
  align?: 'left' | 'right' | 'center';
  aggregate?: 'sum' | 'avg' | 'min' | 'max' | 'count';
};

export const COLUMN_DEFS: ColumnDef<Bond, unknown>[] = [
  {
    id: 'select',
    header: '',
    cell: () => null,
    size: 36,
    enableSorting: false,
    enableResizing: false,
    meta: { label: 'Select', type: 'boolean', defaultVisible: true, defaultWidth: 36 } as ColumnMeta,
  },
  {
    accessorKey: 'cusip',
    header: 'CUSIP',
    size: 100,
    meta: { label: 'CUSIP', type: 'string', defaultVisible: true, defaultWidth: 100, align: 'left' } as ColumnMeta,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    size: 260,
    meta: { label: 'Description', type: 'string', defaultVisible: true, defaultWidth: 260, align: 'left' } as ColumnMeta,
  },
  {
    accessorKey: 'bondType',
    header: 'Type',
    size: 120,
    meta: { label: 'Bond Type', type: 'string', defaultVisible: true, defaultWidth: 120, align: 'left', aggregate: 'count' } as ColumnMeta,
  },
  {
    accessorKey: 'issuer',
    header: 'Issuer',
    size: 140,
    meta: { label: 'Issuer', type: 'string', defaultVisible: true, defaultWidth: 140, align: 'left' } as ColumnMeta,
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
    size: 70,
    meta: { label: 'Rating', type: 'string', defaultVisible: true, defaultWidth: 70, align: 'center' } as ColumnMeta,
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: info => fmt.number(info.getValue() as number, 3),
    size: 80,
    meta: { label: 'Price', type: 'number', defaultVisible: true, defaultWidth: 80, align: 'right', format: v => fmt.number(v as number, 3), aggregate: 'avg' } as ColumnMeta,
  },
  {
    accessorKey: 'priceChange1d',
    header: 'Chg 1D',
    cell: info => fmt.number(info.getValue() as number, 3),
    size: 80,
    meta: { label: 'Price Chg 1D', type: 'number', defaultVisible: true, defaultWidth: 80, align: 'right', format: v => fmt.number(v as number, 3) } as ColumnMeta,
  },
  {
    accessorKey: 'spread',
    header: 'OAS (bp)',
    cell: info => fmt.bp(info.getValue() as number),
    size: 90,
    meta: { label: 'OAS Spread (bp)', type: 'number', defaultVisible: true, defaultWidth: 90, align: 'right', format: v => fmt.bp(v as number), aggregate: 'avg' } as ColumnMeta,
  },
  {
    accessorKey: 'spreadChange1d',
    header: 'Spd Chg',
    cell: info => fmt.bp(info.getValue() as number),
    size: 80,
    meta: { label: 'Spread Chg 1D', type: 'number', defaultVisible: true, defaultWidth: 80, align: 'right', format: v => fmt.bp(v as number) } as ColumnMeta,
  },
  {
    accessorKey: 'zSpread',
    header: 'Z-Sprd',
    cell: info => fmt.bp(info.getValue() as number),
    size: 85,
    meta: { label: 'Z-Spread (bp)', type: 'number', defaultVisible: true, defaultWidth: 85, align: 'right', format: v => fmt.bp(v as number), aggregate: 'avg' } as ColumnMeta,
  },
  {
    accessorKey: 'benchmark',
    header: 'Benchmark',
    size: 105,
    meta: { label: 'Benchmark', type: 'string', defaultVisible: true, defaultWidth: 105, align: 'left' } as ColumnMeta,
  },
  {
    accessorKey: 'yieldToMaturity',
    header: 'YTM',
    cell: info => fmt.percent(info.getValue() as number),
    size: 75,
    meta: { label: 'Yield to Maturity', type: 'number', defaultVisible: true, defaultWidth: 75, align: 'right', format: v => fmt.percent(v as number), aggregate: 'avg' } as ColumnMeta,
  },
  {
    accessorKey: 'yieldToWorst',
    header: 'YTW',
    cell: info => fmt.percent(info.getValue() as number),
    size: 75,
    meta: { label: 'Yield to Worst', type: 'number', defaultVisible: false, defaultWidth: 75, align: 'right', format: v => fmt.percent(v as number), aggregate: 'avg' } as ColumnMeta,
  },
  {
    accessorKey: 'coupon',
    header: 'Coupon',
    cell: info => fmt.percent(info.getValue() as number),
    size: 75,
    meta: { label: 'Coupon', type: 'number', defaultVisible: true, defaultWidth: 75, align: 'right', format: v => fmt.percent(v as number), aggregate: 'avg' } as ColumnMeta,
  },
  {
    accessorKey: 'originalFace',
    header: 'Orig Face',
    cell: info => fmt.currency(info.getValue() as number),
    size: 110,
    meta: { label: 'Original Face', type: 'number', defaultVisible: true, defaultWidth: 110, align: 'right', format: v => fmt.currency(v as number), aggregate: 'sum' } as ColumnMeta,
  },
  {
    accessorKey: 'currentFace',
    header: 'Curr Face',
    cell: info => fmt.currency(info.getValue() as number),
    size: 110,
    meta: { label: 'Current Face', type: 'number', defaultVisible: true, defaultWidth: 110, align: 'right', format: v => fmt.currency(v as number), aggregate: 'sum' } as ColumnMeta,
  },
  {
    accessorKey: 'factor',
    header: 'Factor',
    cell: info => (info.getValue() as number).toFixed(6),
    size: 90,
    meta: { label: 'Factor', type: 'number', defaultVisible: false, defaultWidth: 90, align: 'right', format: v => (v as number).toFixed(6) } as ColumnMeta,
  },
  {
    accessorKey: 'oasDuration',
    header: 'OAS Dur',
    cell: info => fmt.yrs(info.getValue() as number),
    size: 85,
    meta: { label: 'OAS Duration', type: 'number', defaultVisible: true, defaultWidth: 85, align: 'right', format: v => fmt.yrs(v as number), aggregate: 'avg' } as ColumnMeta,
  },
  {
    accessorKey: 'modifiedDuration',
    header: 'Mod Dur',
    cell: info => fmt.yrs(info.getValue() as number),
    size: 85,
    meta: { label: 'Modified Duration', type: 'number', defaultVisible: false, defaultWidth: 85, align: 'right', format: v => fmt.yrs(v as number), aggregate: 'avg' } as ColumnMeta,
  },
  {
    accessorKey: 'convexity',
    header: 'Convexity',
    cell: info => fmt.number(info.getValue() as number, 3),
    size: 85,
    meta: { label: 'Convexity', type: 'number', defaultVisible: false, defaultWidth: 85, align: 'right', format: v => fmt.number(v as number, 3), aggregate: 'avg' } as ColumnMeta,
  },
  {
    accessorKey: 'dv01',
    header: 'DV01',
    cell: info => '$' + fmt.number(info.getValue() as number, 2),
    size: 90,
    meta: { label: 'DV01 ($)', type: 'number', defaultVisible: false, defaultWidth: 90, align: 'right', format: v => '$' + fmt.number(v as number, 2), aggregate: 'sum' } as ColumnMeta,
  },
  {
    accessorKey: 'wac',
    header: 'WAC',
    cell: info => fmt.percent(info.getValue() as number),
    size: 75,
    meta: { label: 'Wtd Avg Coupon', type: 'number', defaultVisible: false, defaultWidth: 75, align: 'right', format: v => fmt.percent(v as number), aggregate: 'avg' } as ColumnMeta,
  },
  {
    accessorKey: 'wam',
    header: 'WAM',
    cell: info => (info.getValue() as number) + ' mo',
    size: 75,
    meta: { label: 'Wtd Avg Maturity (mo)', type: 'number', defaultVisible: false, defaultWidth: 75, align: 'right', format: v => v + ' mo', aggregate: 'avg' } as ColumnMeta,
  },
  {
    accessorKey: 'wal',
    header: 'WAL',
    cell: info => fmt.yrs(info.getValue() as number),
    size: 75,
    meta: { label: 'Wtd Avg Life', type: 'number', defaultVisible: true, defaultWidth: 75, align: 'right', format: v => fmt.yrs(v as number), aggregate: 'avg' } as ColumnMeta,
  },
  {
    accessorKey: 'prepaySpeed',
    header: 'CPR',
    cell: info => fmt.percent(info.getValue() as number, 1),
    size: 70,
    meta: { label: 'Prepay Speed (CPR)', type: 'number', defaultVisible: false, defaultWidth: 70, align: 'right', format: v => fmt.percent(v as number, 1), aggregate: 'avg' } as ColumnMeta,
  },
  {
    accessorKey: 'trancheClass',
    header: 'Tranche',
    size: 80,
    meta: { label: 'Tranche Class', type: 'string', defaultVisible: true, defaultWidth: 80, align: 'left' } as ColumnMeta,
  },
  {
    accessorKey: 'sector',
    header: 'Sector',
    size: 120,
    meta: { label: 'Sector', type: 'string', defaultVisible: false, defaultWidth: 120, align: 'left' } as ColumnMeta,
  },
  {
    accessorKey: 'collateralType',
    header: 'Collateral',
    size: 120,
    meta: { label: 'Collateral Type', type: 'string', defaultVisible: true, defaultWidth: 120, align: 'left' } as ColumnMeta,
  },
  {
    accessorKey: 'currency',
    header: 'CCY',
    size: 55,
    meta: { label: 'Currency', type: 'string', defaultVisible: true, defaultWidth: 55, align: 'center' } as ColumnMeta,
  },
  {
    accessorKey: 'country',
    header: 'Ctry',
    size: 55,
    meta: { label: 'Country', type: 'string', defaultVisible: false, defaultWidth: 55, align: 'center' } as ColumnMeta,
  },
  {
    accessorKey: 'liquidity',
    header: 'Liquidity',
    size: 80,
    meta: { label: 'Liquidity', type: 'string', defaultVisible: true, defaultWidth: 80, align: 'center' } as ColumnMeta,
  },
  {
    accessorKey: 'callable',
    header: 'Call',
    cell: info => info.getValue() ? 'Yes' : 'No',
    size: 55,
    meta: { label: 'Callable', type: 'boolean', defaultVisible: false, defaultWidth: 55, align: 'center', format: v => v ? 'Yes' : 'No' } as ColumnMeta,
  },
  {
    accessorKey: 'callDate',
    header: 'Call Date',
    cell: info => info.getValue() ?? '—',
    size: 95,
    meta: { label: 'Call Date', type: 'date', defaultVisible: false, defaultWidth: 95, align: 'left' } as ColumnMeta,
  },
  {
    accessorKey: 'maturityDate',
    header: 'Maturity',
    size: 95,
    meta: { label: 'Maturity Date', type: 'date', defaultVisible: true, defaultWidth: 95, align: 'left' } as ColumnMeta,
  },
  {
    accessorKey: 'issueDate',
    header: 'Issue Date',
    size: 95,
    meta: { label: 'Issue Date', type: 'date', defaultVisible: false, defaultWidth: 95, align: 'left' } as ColumnMeta,
  },
  {
    accessorKey: 'settlementDate',
    header: 'Settle Date',
    size: 95,
    meta: { label: 'Settlement Date', type: 'date', defaultVisible: false, defaultWidth: 95, align: 'left' } as ColumnMeta,
  },
  {
    accessorKey: 'accrualBasis',
    header: 'Day Cnt',
    size: 80,
    meta: { label: 'Day Count', type: 'string', defaultVisible: false, defaultWidth: 80, align: 'center' } as ColumnMeta,
  },
  {
    accessorKey: 'payFrequency',
    header: 'Pay Freq',
    size: 85,
    meta: { label: 'Pay Frequency', type: 'string', defaultVisible: false, defaultWidth: 85, align: 'left' } as ColumnMeta,
  },
  {
    accessorKey: 'isin',
    header: 'ISIN',
    size: 130,
    meta: { label: 'ISIN', type: 'string', defaultVisible: false, defaultWidth: 130, align: 'left' } as ColumnMeta,
  },
  {
    accessorKey: 'ticker',
    header: 'Ticker',
    size: 80,
    meta: { label: 'Ticker', type: 'string', defaultVisible: false, defaultWidth: 80, align: 'left' } as ColumnMeta,
  },
];

export function colId(col: ColumnDef<Bond, unknown>): string {
  return col.id ?? ((col as { accessorKey?: string }).accessorKey as string);
}

export const DEFAULT_VISIBLE = COLUMN_DEFS.reduce((acc, col) => {
  const meta = col.meta as ColumnMeta | undefined;
  const id = colId(col);
  if (id && meta) acc[id] = meta.defaultVisible;
  return acc;
}, {} as Record<string, boolean>);

export const DEFAULT_WIDTHS = COLUMN_DEFS.reduce((acc, col) => {
  const meta = col.meta as ColumnMeta | undefined;
  const id = colId(col);
  if (id && meta) acc[id] = meta.defaultWidth;
  return acc;
}, {} as Record<string, number>);
