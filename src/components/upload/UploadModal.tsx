import { useState, useRef, useCallback } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { useTableStore } from '../../store/tableStore';
import type { Bond } from '../../types/bond';

const BOND_FIELDS: (keyof Bond)[] = [
  'cusip', 'isin', 'ticker', 'description', 'bondType', 'issuer', 'rating',
  'originalFace', 'currentFace', 'factor', 'coupon', 'price', 'yieldToMaturity',
  'yieldToWorst', 'spread', 'benchmark', 'zSpread', 'oasDuration', 'modifiedDuration',
  'convexity', 'dv01', 'wac', 'wam', 'wal', 'prepaySpeed', 'settlementDate',
  'maturityDate', 'issueDate', 'sector', 'collateralType', 'trancheClass',
  'currency', 'country', 'accrualBasis', 'payFrequency', 'callable', 'callDate',
  'liquidity', 'priceChange1d', 'spreadChange1d',
];

function autoMap(headers: string[]): Record<string, keyof Bond> {
  const mapping: Record<string, keyof Bond> = {};
  for (const header of headers) {
    const lower = header.toLowerCase().replace(/[\s_\-]/g, '');
    const match = BOND_FIELDS.find(f =>
      f.toLowerCase() === lower ||
      f.toLowerCase().replace(/[\s_\-]/g, '') === lower
    );
    if (match) mapping[header] = match;
  }
  return mapping;
}

interface Props {
  onClose: () => void;
}

export function UploadModal({ onClose }: Props) {
  const setData = useTableStore(s => s.setData);
  const [step, setStep] = useState<'upload' | 'map' | 'done'>('upload');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, keyof Bond>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [accepted, setAccepted] = useState(0);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    try {
      const XLSX = await import('xlsx');
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
      if (data.length === 0) return;
      const hdrs = Object.keys(data[0]);
      setHeaders(hdrs);
      setRows(data);
      setMapping(autoMap(hdrs));
      setStep('map');
    } catch {
      setErrors(['Failed to parse file. Please use CSV or Excel format.']);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleImport = () => {
    const errs: string[] = [];
    const imported: Bond[] = [];

    rows.forEach((row, i) => {
      try {
        const bond: Partial<Bond> = { id: String(Date.now() + i) };
        for (const [header, field] of Object.entries(mapping)) {
          const raw = row[header];
          const numFields: (keyof Bond)[] = ['originalFace', 'currentFace', 'factor', 'coupon', 'price', 'yieldToMaturity', 'yieldToWorst', 'spread', 'zSpread', 'oasDuration', 'modifiedDuration', 'convexity', 'dv01', 'wac', 'wam', 'wal', 'prepaySpeed', 'priceChange1d', 'spreadChange1d'];
          if (numFields.includes(field)) {
            (bond as Record<string, unknown>)[field] = parseFloat(raw) || 0;
          } else if (field === 'callable') {
            (bond as Record<string, unknown>)[field] = raw === 'true' || raw === '1' || raw === 'Yes';
          } else {
            (bond as Record<string, unknown>)[field] = raw;
          }
        }
        if (!bond.cusip) { errs.push(`Row ${i + 2}: missing CUSIP`); return; }
        imported.push(bond as Bond);
      } catch {
        errs.push(`Row ${i + 2}: parse error`);
      }
    });

    if (imported.length > 0) {
      setData(imported);
      setAccepted(imported.length);
    }
    setErrors(errs);
    setStep('done');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Import Data</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {step === 'upload' && (
            <div
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${dragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 dark:border-gray-600'}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <FileSpreadsheet className="mx-auto mb-3 text-gray-400" size={36} />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Drag & drop a CSV or Excel file here</p>
              <button className="btn-primary px-4 py-2 text-sm rounded-lg" onClick={() => inputRef.current?.click()}>
                Browse files
              </button>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={e => e.target.files?.[0] && processFile(e.target.files[0])}
              />
            </div>
          )}

          {step === 'map' && (
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{rows.length} rows found. Map your columns to bond fields:</p>
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-xs border-collapse">
                  <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left px-2 py-1.5 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">Your Column</th>
                      <th className="text-left px-2 py-1.5 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">Maps to</th>
                      <th className="text-left px-2 py-1.5 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">Sample</th>
                    </tr>
                  </thead>
                  <tbody>
                    {headers.map(h => (
                      <tr key={h} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="px-2 py-1.5 font-medium text-gray-700 dark:text-gray-300">{h}</td>
                        <td className="px-2 py-1.5">
                          <select
                            value={mapping[h] ?? ''}
                            onChange={e => setMapping({ ...mapping, [h]: e.target.value as keyof Bond })}
                            className="select-sm w-full"
                          >
                            <option value="">— skip —</option>
                            {BOND_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-1.5 text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                          {rows[0]?.[h] ?? ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => setStep('upload')} className="btn-ghost px-3 py-1.5 text-sm rounded">Back</button>
                <button onClick={handleImport} className="btn-primary px-4 py-1.5 text-sm rounded flex items-center gap-1.5">
                  <Upload size={13} /> Import
                </button>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-6">
              {accepted > 0 ? (
                <><CheckCircle className="mx-auto mb-2 text-emerald-500" size={36} />
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{accepted} rows imported successfully</p></>
              ) : (
                <><AlertCircle className="mx-auto mb-2 text-red-500" size={36} />
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Import failed</p></>
              )}
              {errors.length > 0 && (
                <div className="mt-2 text-left bg-red-50 dark:bg-red-950 rounded p-2 max-h-32 overflow-y-auto">
                  {errors.map((e, i) => <p key={i} className="text-xs text-red-600 dark:text-red-400">{e}</p>)}
                </div>
              )}
              <button onClick={onClose} className="mt-4 btn-primary px-4 py-1.5 text-sm rounded">Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
