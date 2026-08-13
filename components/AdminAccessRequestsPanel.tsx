"use client";

import { useState } from "react";
import { updateAccessRequest } from "@/lib/actions/auth-actions";
import LoadingSpinner from "./LoadingSpinner";

export interface AccessRequestItem {
  id: string;
  status: string;
  createdAt: Date | string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  module: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function AdminAccessRequestsPanel({
  initialRequests,
}: {
  initialRequests: AccessRequestItem[];
}) {
  const [requests, setRequests] = useState<AccessRequestItem[]>(initialRequests);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (requestId: string, newStatus: "approved" | "rejected") => {
    setLoadingId(requestId);
    const res = await updateAccessRequest(requestId, newStatus);
    if (res.success && res.request) {
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
      );
    } else {
      alert(res.error || "Failed to update request.");
    }
    setLoadingId(null);
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const processedRequests = requests.filter((r) => r.status !== "pending");

  return (
    <div className="mb-10 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Module Access Requests
            </h3>
            {pendingRequests.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse">
                {pendingRequests.length} Pending
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Review and grant permission to users requesting access to system modules.
          </p>
        </div>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          ✨ No pending access requests at the moment.
        </div>
      ) : (
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {pendingRequests.map((req) => {
            const isLoading = loadingId === req.id;
            return (
              <div
                key={req.id}
                className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                    {req.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {req.user.name}{" "}
                      <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                        ({req.user.email})
                      </span>
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
                      Requesting access to module:{" "}
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {req.module.title}
                      </span>
                    </p>
                    <span className="text-[10px] text-zinc-400">
                      Requested on {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleStatusChange(req.id, "approved")}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : "✓ Approve"}
                  </button>
                  <button
                    onClick={() => handleStatusChange(req.id, "rejected")}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700"
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : "✕ Reject"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {processedRequests.length > 0 && (
        <details className="border-t border-zinc-200 dark:border-zinc-800 group">
          <summary className="p-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 select-none">
            View Request History ({processedRequests.length})
          </summary>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            {processedRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {req.user.name}
                  </span>{" "}
                  &bull; {req.module.title}
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full font-semibold uppercase text-[10px] ${
                    req.status === "approved"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
