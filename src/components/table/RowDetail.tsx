import { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { LineChart, Line, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { Bond } from '../../types/bond';
import { AddToPortfolioModal } from '../portfolio/AddToPortfolioModal';

function generateSparkData(bond: Bond) {
  const points = [];
  let price = bond.price;
  let spread = bond.spread;
  for (let i = 6; i >= 0; i--) {
    price += (Math.random() - 0.5) * 0.3;
    spread += (Math.random() - 0.5) * 5;
    points.push({
      day: `D-${i}`,
      price: parseFloat(price.toFixed(3)),
      spread: parseFloat(spread.toFixed(1)),
    });
  }
  return points;
}

interface MiniSparkProps {
  data: { day: string; price?: number; spread?: number }[];
  dataKey: 'price' | 'spread';
  color: string;
  label: string;
}

function MiniSpark({ data, dataKey, color, label }: MiniSparkProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] text-gray-400 uppercase tracking-wide">{label}</span>
      <ResponsiveContainer width={110} height={44}>
        <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip
            contentStyle={{ fontSize: 9, padding: '2px 6px' }}
            labelStyle={{ display: 'none' }}
            formatter={(v: number) => [v, label]}
          />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface StatProps {
  label: string;
  value: string;
  color?: string;
}

function Stat({ label, value, color }: StatProps) {
  return (
    <div className="flex flex-col gap-0.5 min-w-[52px]">
      <span className="text-[9px] text-gray-400 uppercase tracking-wide whitespace-nowrap">{label}</span>
      <span className={`text-[11px] font-semibold ${color ?? 'text-gray-800 dark:text-gray-200'}`}>{value}</span>
    </div>
  );
}

interface Props {
  bond: Bond;
  onClose: () => void;
}

export function RowDetail({ bond, onClose }: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const sparkData = generateSparkData(bond);

  const pColor = typeof bond.priceChange1d === 'number'
    ? bond.priceChange1d > 0 ? 'text-emerald-600' : bond.priceChange1d < 0 ? 'text-red-500' : undefined
    : undefined;
  const sColor = typeof bond.spreadChange1d === 'number'
    ? bond.spreadChange1d < 0 ? 'text-emerald-600' : bond.spreadChange1d > 0 ? 'text-red-500' : undefined
    : undefined;

  const fmt = (n: number | null | undefined, digits = 3) =>
    n == null ? '—' : n.toFixed(digits);

  return (
    <div className="bg-slate-50 dark:bg-gray-800/80 px-4 py-2.5"
      style={{ width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{bond.description}</span>
          <span className="text-[10px] text-gray-400 whitespace-nowrap">{bond.cusip} · {bond.isin} · {bond.bondType}</span>
        </div>
        <div className="ml-3 flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-400"
          >
            <PlusCircle size={10} /> Add to Portfolio
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={13} />
          </button>
        </div>
        {showAddModal && (
          <AddToPortfolioModal bondIds={[bond.id]} onClose={() => setShowAddModal(false)} />
        )}
      </div>

      {/* Stats + sparklines */}
      <div className="flex items-end gap-5">
        {/* Key metrics */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 flex-1 min-w-0">
          <Stat label="Rating"    value={bond.rating} />
          <Stat label="Price"     value={fmt(bond.price)} />
          <Stat label="Δ Price"   value={(bond.priceChange1d > 0 ? '+' : '') + fmt(bond.priceChange1d)} color={pColor} />
          <Stat label="Spread"    value={`${fmt(bond.spread, 1)} bp`} />
          <Stat label="Δ Spread"  value={(bond.spreadChange1d > 0 ? '+' : '') + fmt(bond.spreadChange1d, 1)} color={sColor} />
          <Stat label="YTM"       value={`${fmt(bond.yieldToMaturity, 3)}%`} />
          <Stat label="YTW"       value={`${fmt(bond.yieldToWorst, 3)}%`} />
          <Stat label="OAS Dur"   value={`${fmt(bond.oasDuration, 2)} yr`} />
          <Stat label="WAL"       value={`${fmt(bond.wal, 2)} yr`} />
          <Stat label="Coupon"    value={`${fmt(bond.coupon, 3)}%`} />
          <Stat label="Factor"    value={fmt(bond.factor, 4)} />
          <Stat label="Curr Face" value={bond.currentFace.toLocaleString()} />
          <Stat label="Currency"  value={bond.currency} />
          <Stat label="Liquidity" value={bond.liquidity} />
        </div>

        {/* Sparklines */}
        <div className="flex gap-4 flex-shrink-0">
          <MiniSpark data={sparkData} dataKey="price"  color="#3b82f6" label="Price 7d" />
          <MiniSpark data={sparkData} dataKey="spread" color="#f59e0b" label="Spread 7d" />
        </div>
      </div>
    </div>
  );
}
