"use client";

export interface QuestToast {
  id: number;
  message: string;
  kind: "success" | "error" | "info";
}

export default function QuestToasts({
  toasts,
  onDismiss,
}: {
  toasts: QuestToast[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[70] flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] sm:w-80"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`dq-pop-in flex items-start justify-between gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md text-sm font-medium ${
            t.kind === "success"
              ? "bg-zinc-900/95 border-emerald-500/30 text-emerald-200"
              : t.kind === "error"
                ? "bg-zinc-900/95 border-red-500/30 text-red-200"
                : "bg-zinc-900/95 border-amber-500/30 text-amber-100"
          }`}
        >
          <span>{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="shrink-0 text-zinc-400 hover:text-white transition-colors text-base leading-none"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}