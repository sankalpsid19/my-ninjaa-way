// Placeholder styled like the module cards for a fast first paint.
export default function Loading() {
  return (
    <main className="min-h-screen animate-pulse">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        <div className="h-64 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800" />
          ))}
        </div>
      </div>
    </main>
  );
}