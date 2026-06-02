import { useTableStore } from '../../store/tableStore';
import { useShallow } from 'zustand/react/shallow';
import { QUICK_PRESETS, QUICK_PRESET_CATEGORIES } from '../../data/presets';

export function QuickFilterChips() {
  const { activePresets, togglePreset } = useTableStore(useShallow(s => ({
    activePresets: s.activePresets,
    togglePreset: s.togglePreset,
  })));

  return (
    <div className="flex gap-5 flex-wrap">
      {QUICK_PRESET_CATEGORIES.map(category => {
        const chips = QUICK_PRESETS.filter(p => p.category === category);
        if (chips.length === 0) return null;
        return (
          <div key={category} className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">{category}</span>
            <div className="flex flex-col gap-1">
              {chips.map(p => {
                const active = activePresets.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePreset(p.id)}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors text-left whitespace-nowrap
                      ${active
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
                      }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
