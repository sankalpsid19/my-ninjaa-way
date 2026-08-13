"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { requestModuleAccess } from "@/lib/actions/auth-actions";
import LoadingSpinner from "./LoadingSpinner";

export interface ModuleItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  accessStatus: "unauthenticated" | "not_requested" | "pending" | "approved" | "rejected";
}

export default function ModuleCard({ module }: { module: ModuleItem }) {
  const router = useRouter();
  const [status, setStatus] = useState(module.accessStatus);
  const [loading, setLoading] = useState(false);

  const handleRequestAccess = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    setLoading(true);
    const res = await requestModuleAccess(module.slug);
    if (res.success) {
      setStatus("pending");
    } else {
      alert(res.error || "Failed to request access.");
    }
    setLoading(false);
  };

  if (status === "approved") {
    return (
      <Link
        href={module.href}
        className="group relative flex flex-col p-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:shadow-xl hover:-translate-y-1 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-6">
          <span className="text-4xl group-hover:scale-110 transform transition-transform">
            {module.icon}
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Accessible
          </span>
        </div>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
          {module.title}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-6">
          {module.description}
        </p>

        <div className="mt-auto flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
          Open Module &rarr;
        </div>
      </Link>
    );
  }

  return (
    <div className="relative flex flex-col p-8 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-3xl shadow-sm border border-zinc-200/80 dark:border-zinc-800/80 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <span className="text-4xl opacity-50 filter grayscale">{module.icon}</span>
        {status === "pending" && (
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 text-xs font-semibold flex items-center gap-1.5 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Approval
          </span>
        )}
        {status === "rejected" && (
          <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 text-xs font-semibold flex items-center gap-1.5 border border-red-500/20">
            Access Denied
          </span>
        )}
        {(status === "not_requested" || status === "unauthenticated") && (
          <span className="px-3 py-1 rounded-full bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium flex items-center gap-1">
            🔒 Restricted
          </span>
        )}
      </div>

      <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">
        {module.title}
      </h2>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-6">
        {module.description}
      </p>

      <div className="mt-auto pt-2">
        {status === "pending" ? (
          <div className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60">
            Access Request Submitted &bull; Waiting for Admin Approval
          </div>
        ) : status === "unauthenticated" ? (
          <Link
            href="/login"
            className="w-full inline-flex justify-center items-center py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition-colors shadow-sm"
          >
            Sign in to Access Module
          </Link>
        ) : (
          <button
            onClick={handleRequestAccess}
            disabled={loading}
            className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 gap-2"
          >
            {loading ? (
              <LoadingSpinner size="sm" text="Submitting Request..." />
            ) : status === "rejected" ? (
              "Re-request Access"
            ) : (
              "Request Access"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
