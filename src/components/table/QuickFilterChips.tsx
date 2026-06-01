import { useTableStore } from '../../store/tableStore';
import { useShallow } from 'zustand/react/shallow';
import { QUICK_PRESETS } from '../../data/presets';

export function QuickFilterChips() {
  const { activePresets, togglePreset } = useTableStore(useShallow(s => ({
    activePresets: s.activePresets,
    togglePreset: s.togglePreset,
  })));

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {QUICK_PRESETS.map(p => {
        const active = activePresets.includes(p.id);
        return (
          <button
            key={p.id}
            onClick={() => togglePreset(p.id)}
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors
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
  );
}
