import { useState } from 'react';
import { X } from 'lucide-react';
import { useTableStore } from '../../store/tableStore';
import { useShallow } from 'zustand/react/shallow';

interface Props {
  bondIds: string[];
  onClose: () => void;
}

export function AddToPortfolioModal({ bondIds, onClose }: Props) {
  const {
    data, portfolios, activePortfolioId,
    addPortfolio, addPosition, setActivePortfolio,
  } = useTableStore(useShallow(s => ({
    data: s.data,
    portfolios: s.portfolios,
    activePortfolioId: s.activePortfolioId,
    addPortfolio: s.addPortfolio,
    addPosition: s.addPosition,
    setActivePortfolio: s.setActivePortfolio,
  })));

  const firstBond = bondIds.length === 1 ? data.find(b => b.id === bondIds[0]) : null;

  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>(activePortfolioId ?? '');
  const [creatingNew, setCreatingNew] = useState(portfolios.length === 0);
  const [newName, setNewName] = useState('');
  const [notional, setNotional] = useState(1_000_000);
  const [purchasePrice, setPurchasePrice] = useState<string>(firstBond ? firstBond.price.toFixed(3) : '');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  const handleCreateNew = () => {
    const name = newName.trim();
    if (!name) return;
    addPortfolio(name);
    const created = useTableStore.getState().portfolios.at(-1);
    if (created) {
      setSelectedPortfolioId(created.id);
      setActivePortfolio(created.id);
    }
    setCreatingNew(false);
    setNewName('');
  };

  const handleSubmit = () => {
    if (!selectedPortfolioId || !purchasePrice) return;
    const price = parseFloat(purchasePrice);
    if (isNaN(price)) return;
    for (const bondId of bondIds) {
      addPosition(selectedPortfolioId, bondId, notional, price, purchaseDate, notes.trim() || undefined);
    }
    setActivePortfolio(selectedPortfolioId);
    onClose();
  };

  const canSubmit = selectedPortfolioId && purchasePrice && !isNaN(parseFloat(purchasePrice));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-[360px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Add to Portfolio</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3 space-y-3 overflow-y-auto">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Adding {bondIds.length} bond{bondIds.length !== 1 ? 's' : ''}
            {firstBond && <span className="text-gray-700 dark:text-gray-300"> — {firstBond.description}</span>}
          </p>

          {/* Portfolio picker */}
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Portfolio</label>
            {!creatingNew ? (
              <div className="flex gap-1.5">
                <select
                  className="select-sm flex-1"
                  value={selectedPortfolioId}
                  onChange={e => setSelectedPortfolioId(e.target.value)}
                >
                  {portfolios.length === 0 && <option value="">No portfolios yet</option>}
                  {portfolios.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <button className="btn btn-secondary btn-sm" onClick={() => setCreatingNew(true)}>
                  + New
                </button>
              </div>
            ) : (
              <div className="flex gap-1.5">
                <input
                  className="input-sm flex-1"
                  placeholder="Portfolio name…"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateNew()}
                  autoFocus
                />
                <button className="btn btn-primary btn-sm" onClick={handleCreateNew} disabled={!newName.trim()}>
                  Create
                </button>
                {portfolios.length > 0 && (
                  <button className="btn btn-ghost btn-sm p-1" onClick={() => setCreatingNew(false)}>
                    <X size={12} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Notional */}
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Notional ($)</label>
            <input
              type="number"
              className="input-sm w-full"
              value={notional}
              min={0}
              onChange={e => setNotional(Number(e.target.value))}
            />
          </div>

          {/* Purchase Price */}
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Purchase Price (pts)</label>
            <input
              type="number"
              step="0.001"
              className="input-sm w-full"
              value={purchasePrice}
              onChange={e => setPurchasePrice(e.target.value)}
              placeholder={bondIds.length > 1 ? 'e.g. 97.500' : ''}
            />
          </div>

          {/* Purchase Date */}
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Purchase Date</label>
            <input
              type="date"
              className="input-sm w-full"
              value={purchaseDate}
              onChange={e => setPurchaseDate(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Notes (optional)</label>
            <input
              type="text"
              className="input-sm w-full"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Long-term hold, hedged"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!canSubmit}>
            Add to Portfolio →
          </button>
        </div>
      </div>
    </div>
  );
}
