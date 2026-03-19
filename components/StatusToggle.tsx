"use client";

import { useState } from "react";

export default function StatusToggle({ initialStatus }: { initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const isActive = status === "Active";

  const handleToggle = () => {
    setShowConfirm(true);
  };

  const confirmToggle = () => {
    setStatus(isActive ? "Inactive" : "Active");
    setShowConfirm(false);
  };

  const cancelToggle = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <div className="flex items-center">
        <button 
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-black ${isActive ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
        >
          <span className="sr-only">Toggle status</span>
          <span 
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
        <span className={`ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          isActive 
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
            : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
        }`}>
          {status}
        </span>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 transform transition-all scale-100 opacity-100">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Change Status</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8">
              Are you sure you want to change the status to <strong>{isActive ? "Inactive" : "Active"}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelToggle}
                className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmToggle}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
