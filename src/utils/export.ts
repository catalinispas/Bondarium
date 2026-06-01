import type { Bond } from '../types/bond';
import type { ColumnMeta } from '../data/columns';
import type { ColumnDef } from '@tanstack/react-table';

function getHeaders(cols: ColumnDef<Bond, unknown>[]): string[] {
  return cols.map(c => {
    const meta = c.meta as ColumnMeta | undefined;
    return meta?.label ?? String(c.id ?? '');
  });
}

function getRow(bond: Bond, cols: ColumnDef<Bond, unknown>[]): (string | number | boolean | null)[] {
  return cols.map(c => {
    const key = (c as { accessorKey?: keyof Bond }).accessorKey;
    if (!key) return '';
    const val = bond[key];
    const meta = c.meta as ColumnMeta | undefined;
    if (meta?.format && val !== null && val !== undefined) return meta.format(val);
    return val ?? '';
  });
}

export function exportCSV(bonds: Bond[], cols: ColumnDef<Bond, unknown>[], filename = 'bonds.csv') {
  const headers = getHeaders(cols);
  const rows = bonds.map(b => getRow(b, cols));
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

export async function exportExcel(bonds: Bond[], cols: ColumnDef<Bond, unknown>[], filename = 'bonds.xlsx') {
  const XLSX = await import('xlsx');
  const headers = getHeaders(cols);
  const rows = bonds.map(b => getRow(b, cols));
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bonds');
  XLSX.writeFile(wb, filename);
}

export async function exportPDF(bonds: Bond[], cols: ColumnDef<Bond, unknown>[], filename = 'bonds.pdf') {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a3' });
  const headers = getHeaders(cols);
  const rows = bonds.map(b => getRow(b, cols).map(String));
  autoTable(doc, {
    head: [headers],
    body: rows,
    styles: { fontSize: 6, cellPadding: 2 },
    headStyles: { fillColor: [30, 41, 59] },
  });
  doc.save(filename);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
