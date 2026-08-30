"use client";

import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface DeleteClientModalProps {
  isOpen: boolean;
  clientName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteClientModal({
  isOpen,
  clientName,
  onClose,
  onConfirm,
}: DeleteClientModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      await onConfirm();
    } catch (err: any) {
      setError(err?.message || "An error occurred while deleting the client.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transform transition-all scale-100 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Delete Client?
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Are you sure you want to delete <strong className="text-zinc-900 dark:text-zinc-200">{clientName}</strong>?
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg p-2.5 mt-3">
            ⚠️ This will permanently erase this client along with all their financial bills, active services, and contact records. This action cannot be undone.
          </p>
        </div>

        {error && (
          <div className="mb-4 text-xs font-medium text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white text-sm font-semibold shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <LoadingSpinner size="sm" text="Deleting..." /> : "Delete Client"}
          </button>
        </div>
      </div>
    </div>
  );
}
