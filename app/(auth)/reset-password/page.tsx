"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/actions/auth-actions";
import LoadingSpinner from "@/components/LoadingSpinner";
import PasswordInput from "@/components/PasswordInput";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token. Please request a new reset link.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(token, newPassword);

      if (!res.success) {
        setError(res.error || "Failed to reset password.");
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium">
          Invalid or missing reset token.
        </div>
        <Link
          href="/forgot-password"
          className="inline-block font-semibold text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          Request a new password reset link →
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium text-center space-y-1">
          <p>✓ Password reset successfully!</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Redirecting to sign in page...
          </p>
        </div>
      )}

      {!success && (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <PasswordInput
            id="newPassword"
            label="New Password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
            placeholder="At least 6 characters"
          />

          <PasswordInput
            id="confirmPassword"
            label="Confirm New Password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            placeholder="Repeat new password"
          />

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 items-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" text="Resetting password..." /> : "Reset Password"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
        >
          ← Back to Sign In
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl mx-auto shadow-lg mb-4">
          🔐
        </div>
        <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Reset Your Password
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Enter a new password for your account below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-zinc-900 py-8 px-6 shadow-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 sm:px-10">
          <Suspense fallback={<LoadingSpinner text="Loading..." />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
