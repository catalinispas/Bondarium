import { useTableStore } from '../../store/tableStore';
import { useShallow } from 'zustand/react/shallow';

export function LiveBadge() {
  const { liveMode, setLiveMode } = useTableStore(useShallow(s => ({
    liveMode: s.liveMode,
    setLiveMode: s.setLiveMode,
  })));

  return (
    <button
      onClick={() => setLiveMode(!liveMode)}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors
        ${liveMode
          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-400'
          : 'bg-gray-50 border-gray-300 text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400'
        }`}
    >
      <span className={`w-2 h-2 rounded-full ${liveMode ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
      {liveMode ? 'Live' : 'Paused'}
    </button>
  );
}
