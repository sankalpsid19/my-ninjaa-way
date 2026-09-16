"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { History, Settings, Timer } from "lucide-react";
import type {
  AchievementView,
  ConsistencyCellView,
  DailyBoardSnapshot,
  QuestType,
} from "@/lib/daily-quests/types";
import {
  getDailyBoard,
  logProgress,
  completeTaskWithReflection,
  pickTodayTask,
} from "@/lib/actions/daily-quest-actions";
import { formatCountdown, monthKey } from "@/lib/daily-quests/dates";
import QuestToasts, { type QuestToast } from "./QuestToasts";
import OnboardingWizard from "./OnboardingWizard";
import TodayTaskCard from "./TodayTaskCard";
import WeekRhythm from "./WeekRhythm";
import XpRing from "./XpRing";
import StreakFlame from "./StreakFlame";
import StatHexagon from "./StatHexagon";
import LevelUpModal from "./LevelUpModal";
import ConsistencyHeatmap from "./ConsistencyHeatmap";
import AchievementShelf from "./AchievementShelf";
import SettingsPanel from "./SettingsPanel";
import HistoryView from "./HistoryView";
import ReminderBell from "./ReminderBell";

/** 🥷 Daily Quests — Dark Dojo dashboard shell (bento grid, §8.2). */
export default function DayBoard() {
  const [snapshot, setSnapshot] = useState<DailyBoardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const [busy, setBusy] = useState(false);
  const [toasts, setToasts] = useState<QuestToast[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [history, setHistory] = useState<{ month: string; selectedDate: string | null } | null>(null);
  const [levelUp, setLevelUp] = useState<{
    levelBefore: number;
    levelAfter: number;
    newAchievements: AchievementView[];
    xpGained?: number;
  } | null>(null);
  const [achievementsKey, setAchievementsKey] = useState(0);

  const rolledRef = useRef(false);
  const snapshotRef = useRef<DailyBoardSnapshot | null>(null);

  // Keep the ref in sync for the live ticker (never during render).
  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  const pushToast = useCallback((message: string, kind: QuestToast["kind"] = "info") => {
    setToasts((t) => [...t.slice(-2), { id: Date.now() + Math.random(), message, kind }]);
  }, []);

  const refreshBoard = useCallback(async () => {
    try {
      const res = await getDailyBoard();
      if (res.ok && res.snapshot) {
        rolledRef.current = false;
        setSnapshot(res.snapshot);
        setLoading(false);
      } else {
        pushToast(res.reason ?? "Failed to load the board.", "error");
      }
    } catch (err) {
      // Rejected fetch (e.g. stale bundle / action id mismatch after a dev
      // server restart, or a transient network error). Surface the dojo error
      // box + Retry instead of getting stuck on "Entering the dojo…".
      console.error("getDailyBoard rejected:", err);
      pushToast("Couldn't reach the dojo — check your connection and Retry.", "error");
      setLoading(false);
    }
  }, [pushToast]);

  // Initial load.
  useEffect(() => {
    let alive = true;
    getDailyBoard()
      .then((res) => {
        if (!alive) return;
        if (res.ok && res.snapshot) {
          setSnapshot(res.snapshot);
        } else {
          pushToast(res.reason ?? "Failed to load the board.", "error");
        }
      })
      .catch(() => {
        if (!alive) return;
        console.error("getDailyBoard rejected during initial load");
        pushToast("Couldn't reach the dojo — check your connection and Retry.", "error");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [pushToast]);

  // Live clock + automatic rollover refresh exactly at the deadline.
  useEffect(() => {
    const t = setInterval(() => {
      setNow(new Date());
      const s = snapshotRef.current;
      if (s && Date.parse(s.deadlineAtIso) <= Date.now() && !rolledRef.current) {
        rolledRef.current = true;
        void refreshBoard();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [refreshBoard]);

  // ── Mutations ────────────────────────────────────────────────────────────
  const handleLog = async (minutes: number) => {
    if (busy || !snapshot?.task || snapshot.task.status !== "active") return;
    setBusy(true);
    const prev = snapshot;
    // Optimistic progress — reconciled by the server action below.
    const cap = Math.round(snapshot.task.targetMinutes * 1.5);
    setSnapshot({
      ...snapshot,
      task: { ...snapshot.task, progressMinutes: Math.min(cap, snapshot.task.progressMinutes + minutes) },
    });
    const res = await logProgress(snapshot.task.id, minutes);
    if (res.ok && res.snapshot) {
      setSnapshot(res.snapshot);
      if (res.snapshot.task && res.snapshot.task.progressMinutes >= res.snapshot.task.targetMinutes) {
        pushToast("Target reached — you can complete the quest now! 💪", "success");
      }
    } else {
      setSnapshot(prev);
      pushToast(res.reason ?? "Failed to log progress.", "error");
    }
    setBusy(false);
  };

  const handleComplete = async (note?: string) => {
    if (busy || !snapshot?.task || snapshot.task.status !== "active") return;
    setBusy(true);
    const res = await completeTaskWithReflection(snapshot.task.id, note);
    setBusy(false);
    if (res.ok && res.snapshot) {
      setSnapshot(res.snapshot);
      setAchievementsKey((k) => k + 1);
      if (res.xpGained != null) pushToast(`Quest complete! +${res.xpGained} XP earned 🎉`, "success");
      if (res.leveledUp && res.levelBefore != null && res.levelAfter != null) {
        setLevelUp({
          levelBefore: res.levelBefore,
          levelAfter: res.levelAfter,
          newAchievements: res.newAchievements ?? [],
          xpGained: res.xpGained,
        });
      } else if (res.newAchievements && res.newAchievements.length > 0) {
        pushToast(`Badge earned: ${res.newAchievements.map((a) => `${a.icon} ${a.name}`).join(", ")} 🏅`, "success");
      }
    } else {
      pushToast(res.reason ?? "Failed to complete quest.", "error");
    }
  };

  const handlePickTask = async (choice: QuestType) => {
    if (busy || !snapshot) return;
    setBusy(true);
    const res = await pickTodayTask(choice);
    setBusy(false);
    if (res.ok && res.snapshot) {
      setSnapshot(res.snapshot);
      pushToast("Today's quest swapped. Locked once you start logging.", "success");
    } else {
      pushToast(res.reason ?? "Couldn't swap the quest.", "error");
    }
  };

  const handleCellClick = (cell: ConsistencyCellView) => {
    setHistory({ month: monthKey(cell.date), selectedDate: cell.date });
  };

  const onLocalMessage = useCallback(
    (title: string, body: string) => pushToast(`${title} — ${body}`, "info"),
    [pushToast],
  );

  // ── Loading / error / onboarding ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">🥷</div>
          <p className="text-sm text-zinc-500 font-medium">Entering the dojo…</p>
        </div>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center">
          <p className="text-sm text-zinc-400">
            The dojo couldn’t be loaded. Try refreshing — if it persists, check your connection.
          </p>
          <button
            onClick={() => {
              setLoading(true);
              void refreshBoard().finally(() => setLoading(false));
            }}
            className="mt-5 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-sm font-black transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!snapshot.profile.onboardedAt) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 py-12">
        <OnboardingWizard
          onDone={(snap) => {
            setSnapshot(snap);
            pushToast("Welcome to the Dojo, ninja! 🥷 One quest awaits.", "success");
          }}
        />
      </div>
    );
  }
// ── Main board ─────────────────────────────────────────────────────────────
  const msLeft = Date.parse(snapshot.deadlineAtIso) - now.getTime();
  const lowTime = msLeft > 0 && msLeft < 60 * 60 * 1000;
  const todayPerfect = snapshot.task?.status === "completed" && snapshot.task.perfectDay;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-xs font-semibold text-zinc-500 hover:text-amber-400 transition-colors inline-flex items-center gap-1.5"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl" aria-hidden="true">🥷</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">
                Dojo — Day {snapshot.dayNumber}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-50">
              {snapshot.todayKey === new Date().toISOString().slice(0, 10) ? "Today's" : "Tonight's"} Quest
              <span className="text-zinc-500 font-bold text-lg ml-2.5">
                {new Date(`${snapshot.todayKey}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              </span>
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              The dojo closes at {String(snapshot.profile.resetHour).padStart(2, "0")}:59 local — one task, all-or-nothing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border font-mono tabular-nums text-base font-bold ${
                lowTime ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-zinc-900/80 border-zinc-800 text-amber-300"
              }`}
              aria-live="polite"
            >
              <Timer className="w-4 h-4" />
              {msLeft > 0 ? formatCountdown(msLeft) : "rolled over"}
            </div>
            <ReminderBell onLocalMessage={onLocalMessage} />
            <button
              onClick={() => setHistory({ month: monthKey(snapshot.todayKey), selectedDate: null })}
              title="Quest history"
              className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-700/70 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors"
              aria-label="Open history"
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              title="Quest settings"
              className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-700/70 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors"
              aria-label="Open settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>
{/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Character panel */}
          <section className="space-y-5" aria-label="Character panel">
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Character</h2>
                <button
                  onClick={() => setShowSettings(true)}
                  className="text-[10px] font-semibold text-zinc-500 hover:text-amber-400 transition-colors"
                >
                  ⚙️ Settings
                </button>
              </div>
              <XpRing xp={snapshot.stats.xp} level={snapshot.stats.level} />
              <div className="mt-5 flex justify-center">
                <StreakFlame streak={snapshot.stats.streak} bestStreak={snapshot.stats.bestStreak} />
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Attributes</h3>
              <StatHexagon stats={snapshot.stats} glow={todayPerfect} />
              <p className="text-center text-[10px] text-zinc-600 mt-3">
                {snapshot.stats.perfectDays} 💯 perfect days · {snapshot.isHeavyDay ? "today is a Heavy Day" : "hover a vertex for your tier"}
              </p>
            </div>
          </section>

          {/* Task of the day */}
          <section className="space-y-5" aria-label="Task of the day">
            {snapshot.task ? (
              <TodayTaskCard
                task={snapshot.task}
                ladder={snapshot.ladder}
                rotation={snapshot.profile.rotation}
                deadlineAtIso={snapshot.deadlineAtIso}
                now={now}
                busy={busy}
                onLog={handleLog}
                onComplete={handleComplete}
                onPickTask={handlePickTask}
              />
            ) : (
              <div className="p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800 text-center">
                <p className="text-sm text-zinc-400">No quest issued for today yet — refreshing what the dojo has planned…</p>
              </div>
            )}
            <WeekRhythm todayDow={new Date().getDay()} />
          </section>

          {/* Right rail */}
          <section className="space-y-5" aria-label="Consistency and achievements">
            <ConsistencyHeatmap consistency={snapshot.consistency} ladder={snapshot.ladder} onCellClick={handleCellClick} />
            <AchievementShelf refreshKey={achievementsKey} />
          </section>
        </div>
      </div>
{showSettings && (
        <SettingsPanel
          profile={snapshot.profile}
          onSaved={(snap) => {
            setSnapshot(snap);
            setShowSettings(false);
          }}
          onClose={() => setShowSettings(false)}
          notify={pushToast}
        />
      )}
      {history && (
        <HistoryView
          open
          month={history.month}
          selectedDate={history.selectedDate}
          onClose={() => setHistory(null)}
          onMonthChange={(m) => setHistory({ month: m, selectedDate: null })}
        />
      )}
      {levelUp && (
        <LevelUpModal
          levelBefore={levelUp.levelBefore}
          levelAfter={levelUp.levelAfter}
          newAchievements={levelUp.newAchievements}
          xpGained={levelUp.xpGained}
          onClose={() => setLevelUp(null)}
        />
      )}
      <QuestToasts toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </div>
  );
}