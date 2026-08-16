"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { changePassword } from "@/lib/actions/auth-actions";
import LoadingSpinner from "@/components/LoadingSpinner";
import PasswordInput from "@/components/PasswordInput";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await changePassword(currentPassword, newPassword);

      if (!res.success) {
        setError(res.error || "Failed to change password.");
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl mx-auto shadow-lg mb-4">
          🔐
        </div>
        <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Change Password
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Update your account password securely.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-zinc-900 py-8 px-6 shadow-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium text-center">
              ✓ Password changed successfully! Redirecting...
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <PasswordInput
              id="currentPassword"
              label="Current Password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
              placeholder="••••••••"
            />

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


            <div className="pt-2 flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 items-center gap-2"
              >
                {loading ? <LoadingSpinner size="sm" text="Updating..." /> : "Update Password"}
              </button>

              <Link
                href="/"
                className="text-center text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              >
                Cancel & Return Home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
