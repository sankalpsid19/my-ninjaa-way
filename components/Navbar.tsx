"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  Shield,
  KeyRound,
  LogOut,
  Calculator,
  Sparkles,
  Home,
  ChevronRight,
  LogIn,
  UserPlus,
} from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setIsMobileMenuOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  // Close menu on Escape key press or outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        isMobileMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      // Prevent background scrolling when mobile menu is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const user = session?.user as { name?: string | null; email?: string | null; role?: string } | undefined;
  const isAdmin = user?.role === "admin";
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <header className="w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50 transition-colors pt-[env(safe-area-inset-top)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link
          href="/"
          className="flex items-center gap-2 group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="w-9 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-md group-hover:scale-105 transition-transform px-1">
            MNW
          </div>
          <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100 tracking-tight">
            My Ninjaa Way
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          <Link
            href="/calorie-calculator"
            className="hover:text-zinc-900 dark:hover:text-white transition"
          >
            Calorie Calculator
          </Link>
          <Link
            href="/nutrition"
            className="text-emerald-500 hover:text-emerald-400 font-bold transition flex items-center gap-1"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Nutrition Intelligence
          </Link>
        </nav>

        {/* Desktop User Section */}
        <div className="hidden md:flex items-center gap-4">
          {status === "loading" ? (
            <LoadingSpinner size="sm" />
          ) : session?.user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {user?.name}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate max-w-[160px]">
                  {user?.email}
                </span>
              </div>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 text-[10px] font-bold tracking-wider uppercase border border-amber-500/20 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
              )}
              <Link
                href="/change-password"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-700"
              >
                Password
              </Link>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 cursor-pointer"
              >
                {isSigningOut ? <LoadingSpinner size="sm" /> : "Sign Out"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-800"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex items-center md:hidden">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-dropdown-menu"
            className="p-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition active:scale-95 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 transition-transform duration-200 rotate-0" />
            ) : (
              <Menu className="w-5 h-5 transition-transform duration-200" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 top-16 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Dropdown Menu */}
      <div
        id="mobile-dropdown-menu"
        ref={menuRef}
        className={`md:hidden fixed top-16 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-2xl transition-all duration-300 ease-out origin-top ${
          isMobileMenuOpen
            ? "opacity-100 scale-y-100 translate-y-0 visible pointer-events-auto"
            : "opacity-0 scale-y-95 -translate-y-2 invisible pointer-events-none"
        }`}
        style={{
          maxHeight: "calc(100vh - 4rem)",
          overflowY: "auto",
        }}
      >
        <div className="px-5 py-5 space-y-4 max-w-md mx-auto">
          {/* User Profile Card (if authenticated) */}
          {status !== "loading" && session?.user && (
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              {isAdmin && (
                <span className="shrink-0 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold tracking-wider uppercase border border-amber-500/30 flex items-center gap-1 shadow-xs">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
              )}
            </div>
          )}

          {/* Navigation Links Group */}
          <div>
            <span className="px-1 text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
              Navigation
            </span>
            <div className="mt-1.5 space-y-1">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Home className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">Modules Overview</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </Link>

              <Link
                href="/calorie-calculator"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Calculator className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">Calorie Calculator</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </Link>

              <Link
                href="/nutrition"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <span className="font-semibold">Nutrition Intelligence</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-500/60" />
              </Link>
            </div>
          </div>

          {/* Account Settings & Actions */}
          {status !== "loading" && session?.user ? (
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <span className="px-1 text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                Account
              </span>
              <div className="mt-1.5 space-y-1">
                <Link
                  href="/change-password"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 shrink-0">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <span className="flex-1">Change Password</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </Link>

                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition disabled:opacity-50 text-left cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                    {isSigningOut ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                  </div>
                  <span className="flex-1">
                    {isSigningOut ? "Signing Out..." : "Sign Out"}
                  </span>
                </button>
              </div>
            </div>
          ) : status !== "loading" ? (
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition border border-zinc-200 dark:border-zinc-800"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
