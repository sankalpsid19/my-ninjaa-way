"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BellOff } from "lucide-react";

function msUntil(hour: number): number {
  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, 0, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

/**
 * §8.1 PWA Daily Reminder (19:00 nudge) + Day-End Warning (22:00), via the
 * Notification API when permission is granted, degrading to in-app messages.
 * Pure client scheduler — no push server needed for v1.
 */
export default function ReminderBell({
  onLocalMessage,
}: {
  onLocalMessage: (title: string, body: string) => void;
}) {
  const [enabled, setEnabled] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Restore the persisted preference after mount (async — no hydration flash).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = setTimeout(() => {
      const stored = window.localStorage.getItem("dq-reminders-enabled");
      if (stored === "1" && typeof Notification !== "undefined" && Notification.permission === "granted") {
        setEnabled(true);
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  // Schedule today's reminders (and re-arm the next day).
  useEffect(() => {
    if (!enabled) return;
    const fire = (title: string, body: string) => {
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          new Notification(title, { body, tag: "dq-reminder" });
        } catch {
          onLocalMessage(title, body);
        }
      } else {
        onLocalMessage(title, body);
      }
    };

    const schedule = (hour: number, title: string, body: string) => {
      const t = setTimeout(() => {
        fire(title, body);
        timers.current.push(setTimeout(() => schedule(hour, title, body), msUntil(hour)));
      }, msUntil(hour));
      timers.current.push(t);
    };

    schedule(19, "🥷 Dojo — 1 quest remains", "Tonight the dojo closes at 23:59. ~1 task remains — make it count.");
    schedule(22, "⏳ Dojo closing soon", "2 hours left until reset. Log your final minutes before nightfall.");
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [enabled, onLocalMessage]);

  const toggle = async () => {
    if (typeof Notification === "undefined") {
      onLocalMessage("🔕 Notifications unsupported", "Reminders will still show in-app while the tab is open.");
      return;
    }
    if (!enabled) {
      if (Notification.permission === "default") {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          onLocalMessage("🔕 Reminders without notifications", "We'll nudge you in-app at 19:00 & 22:00 while the tab is open.");
        }
      }
      window.localStorage.setItem("dq-reminders-enabled", "1");
      setEnabled(true);
    } else {
      window.localStorage.setItem("dq-reminders-enabled", "0");
      setEnabled(false);
    }
  };

  return (
    <button
      onClick={toggle}
      title={
        enabled
          ? "Daily reminders ON (19:00 nudge · 22:00 day-end)"
          : "Enable daily reminders (19:00 nudge · 22:00 day-end)"
      }
      className={`relative p-2.5 rounded-xl border transition-colors ${
        enabled
          ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
          : "bg-zinc-900/80 border-zinc-700/70 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
      }`}
      aria-pressed={enabled}
      aria-label="Toggle daily reminders"
    >
      {enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
      {enabled && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
      )}
    </button>
  );
}