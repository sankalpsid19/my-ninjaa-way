"use client";

export interface CalorieSnapshot {
  id: string;
  timestamp: string;
  weightKg: number;
  heightCm: number;
  tdee: number;
  targetCals: number;
  goalLabel: string;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
}

interface CalorieHistoryModalProps {
  isOpen: boolean;
  history: CalorieSnapshot[];
  onClose: () => void;
  onSelectSnapshot: (item: CalorieSnapshot) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

export default function CalorieHistoryModal({
  isOpen,
  history,
  onClose,
  onSelectSnapshot,
  onClearHistory,
  onDeleteItem,
}: CalorieHistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden p-6 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Calculation History
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Saved calculations and body weight entries
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {history.length === 0 ? (
            <div className="py-12 text-center">
              <span className="text-4xl mb-2 block">📋</span>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                No saved calculations yet
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                Click &quot;Save Snapshot&quot; on the calculator to track your calories and weight over time.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 hover:border-blue-400 dark:hover:border-blue-500 transition-all flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.timestamp}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-[10px] font-bold">
                      {item.goalLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    <span>Weight: <strong className="text-zinc-900 dark:text-zinc-100">{item.weightKg} kg</strong></span>
                    <span>TDEE: <strong className="text-zinc-900 dark:text-zinc-100">{item.tdee} kcal</strong></span>
                    <span>Target: <strong className="text-blue-600 dark:text-blue-400">{item.targetCals} kcal</strong></span>
                  </div>

                  <div className="mt-1.5 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span>P: {item.proteinGrams}g</span>
                    <span>&bull;</span>
                    <span>C: {item.carbGrams}g</span>
                    <span>&bull;</span>
                    <span>F: {item.fatGrams}g</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSnapshot(item);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    Load
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete snapshot"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-red-600 dark:text-red-400 hover:underline font-medium"
            >
              Clear All History
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
