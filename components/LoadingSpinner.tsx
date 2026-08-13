"use client";

export default function LoadingSpinner({ size = "md", text }: { size?: "sm" | "md" | "lg"; text?: string }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-3",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 p-2">
      <div
        className={`${sizeClasses[size]} border-blue-600 border-t-transparent dark:border-blue-400 dark:border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="loading"
      />
      {text && <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{text}</p>}
    </div>
  );
}
