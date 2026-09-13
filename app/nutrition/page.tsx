"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { NutritionHeader } from "@/components/nutrition/NutritionHeader";
import { NutritionScoreCard } from "@/components/nutrition/NutritionScoreCard";
import { CalorieRing } from "@/components/nutrition/CalorieRing";
import { MacroCards } from "@/components/nutrition/MacroCards";
import { NutrientCoverage } from "@/components/nutrition/NutrientCoverage";
import { NutrientGapCard } from "@/components/nutrition/NutrientGapCard";
import { DailyFocusCard } from "@/components/nutrition/DailyFocusCard";
import { MealTimeline } from "@/components/nutrition/MealTimeline";
import { FoodLogModal } from "@/components/nutrition/FoodLogModal";
import { NutrientDetailModal } from "@/components/nutrition/NutrientDetailModal";
import { NutritionHistory } from "@/components/nutrition/NutritionHistory";
import {
  NutritionDaySummary,
  UserTargets,
  DEFAULT_TARGETS,
} from "@/lib/nutrition/engine";
import { LayoutDashboard, PlusCircle, ShieldCheck, History } from "lucide-react";

export default function NutritionPage() {
  const { data: session, status: authStatus } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;

  const [dateStr, setDateStr] = useState<string>(new Date().toISOString().split("T")[0]);
  const [activeTab, setActiveTab] = useState<"today" | "nutrients" | "history">("today");
  const [data, setData] = useState<NutritionDaySummary | null>(null);
  const [loading, setLoading] = useState(true);

  const [showLogModal, setShowLogModal] = useState(false);
  const [logMealType, setLogMealType] = useState("Breakfast");
  const [logQuery, setLogQuery] = useState("");
  const [selectedNutrientId, setSelectedNutrientId] = useState<keyof UserTargets | null>(null);

  useEffect(() => {
    if (authStatus === "loading") return;
    fetchTodayData();
  }, [dateStr, authStatus, userId]);

  const fetchTodayData = async () => {
    setLoading(true);
    try {
      const uid = userId || "";
      const res = await fetch(`/api/nutrition/today?date=${dateStr}&userId=${uid}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to load nutrition data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLogModal = useCallback((mealType: string = "Breakfast", query: string = "") => {
    setLogMealType(mealType);
    setLogQuery(query);
    setShowLogModal(true);
  }, []);

  const handleLogFood = async (foodId: string, quantity: number, unit: string, mealType: string) => {
    if (!userId) return;
    try {
      await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, date: dateStr, mealType, foodId, quantity, unit }),
      });
      fetchTodayData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditItem = async (itemId: string, quantity: number, unit: string) => {
    try {
      await fetch("/api/meals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity, unit }),
      });
      fetchTodayData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await fetch(`/api/meals?itemId=${itemId}`, { method: "DELETE" });
      fetchTodayData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveMeal = async (mealType: string, items: { foodId: string; quantity: number; unit: string }[]) => {
    if (!userId || items.length === 0) return;
    try {
      await fetch("/api/nutrition/saved-meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name: `${mealType} Combo`, foodItems: items }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-sm">Verifying session...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Sign In Required</h2>
          <p className="text-sm text-slate-400 mb-6">
            Please sign in to access your nutrition dashboard and start tracking your meals.
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const targets = data?.targets || DEFAULT_TARGETS;
  const totals = data?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <NutritionHeader dateStr={dateStr} setDateStr={setDateStr} />

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("today")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === "today"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" /> Today
        </button>
        <button
          onClick={() => setActiveTab("nutrients")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === "nutrients"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Nutrients Coverage
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === "history"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <History className="w-4 h-4" /> Trends & History
        </button>

        <button
          onClick={() => handleOpenLogModal()}
          className="ml-auto hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold border border-slate-700/80 transition"
        >
          <PlusCircle className="w-4 h-4" /> Quick Log
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading nutrition intelligence...</p>
        </div>
      ) : activeTab === "today" ? (
        <div className="space-y-6">
          {/* Top Row: Score & Calorie Ring */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NutritionScoreCard score={data?.score || 0} scoreMessage={data?.scoreMessage || ""} />
            <CalorieRing
              consumedCalories={totals.calories}
              targetCalories={targets.calories}
              meals={data?.meals || []}
              onOpenLogModal={handleOpenLogModal}
            />
          </div>

          {/* Macro Cards Row */}
          <MacroCards
            totals={totals}
            targets={targets}
            onNutrientClick={(id) => setSelectedNutrientId(id)}
          />

          {/* Daily Focus & Gaps Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data?.dailyFocus && (
              <DailyFocusCard
                dailyFocus={data.dailyFocus}
                onLogSuggestedFood={(foodName) => handleOpenLogModal("Breakfast", foodName)}
              />
            )}
            <NutrientGapCard
              gaps={data?.gaps || []}
              goodNutrients={data?.goodNutrients || []}
              onSelectNutrient={(id) => setSelectedNutrientId(id)}
            />
          </div>

          {/* Nutrient Coverage Overview */}
          <NutrientCoverage
            nutrients={data?.nutrients || []}
            onSelectNutrient={(id) => setSelectedNutrientId(id)}
          />

          {/* Meal Timeline */}
          <MealTimeline
            meals={data?.meals || []}
            onOpenLogModal={handleOpenLogModal}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onSaveMeal={handleSaveMeal}
          />
        </div>
      ) : activeTab === "nutrients" ? (
        <NutrientCoverage
          nutrients={data?.nutrients || []}
          onSelectNutrient={(id) => setSelectedNutrientId(id)}
        />
      ) : (
        <NutritionHistory userId={userId || ""} />
      )}

      {/* Modals */}
      {showLogModal && userId && (
        <FoodLogModal
          userId={userId}
          initialMealType={logMealType}
          initialQuery={logQuery}
          onClose={() => setShowLogModal(false)}
          onLogFood={handleLogFood}
        />
      )}

      {selectedNutrientId && data && (
        <NutrientDetailModal
          nutrientId={selectedNutrientId}
          nutrients={data.nutrients}
          sourcesMap={data.sourcesMap || {}}
          userId={userId}
          onClose={() => setSelectedNutrientId(null)}
          onLogSuggestedFood={(foodName) => handleOpenLogModal("Breakfast", foodName)}
        />
      )}
    </div>
  );
}
