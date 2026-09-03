"use client";

import { useState, useEffect, useMemo } from "react";
import CalculatorForm from "./CalculatorForm";
import ResultsCard from "./ResultsCard";
import MacroBreakdown from "./MacroBreakdown";
import CalorieHistoryModal, { CalorieSnapshot } from "./CalorieHistoryModal";
import {
  CalculatorInputs,
  calculateAll,
  MACRO_PRESETS,
} from "@/lib/calorie-calculator";

const DEFAULT_INPUTS: CalculatorInputs = {
  gender: "male",
  unit: "metric",
  age: 26,
  weightKg: 75,
  heightCm: 178,
  activity: "moderate",
  bodyFatPct: null,
  formula: "mifflin",
  goal: "maintenance",
  macroPreset: "balanced",
  customMacros: MACRO_PRESETS.balanced,
};

export default function CalorieCalculatorContainer() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [history, setHistory] = useState<CalorieSnapshot[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mnw_calorie_history");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load calorie history from localStorage", e);
    }
  }, []);

  // Save history to localStorage
  const saveHistoryToStorage = (updatedHistory: CalorieSnapshot[]) => {
    setHistory(updatedHistory);
    try {
      localStorage.setItem("mnw_calorie_history", JSON.stringify(updatedHistory));
    } catch (e) {
      console.error("Failed to save history to localStorage", e);
    }
  };

  const results = useMemo(() => calculateAll(inputs), [inputs]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2500);
  };

  const handleSaveSnapshot = () => {
    const newSnapshot: CalorieSnapshot = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      weightKg: inputs.weightKg,
      heightCm: inputs.heightCm,
      tdee: results.tdee,
      targetCals: results.selectedGoal.targetCals,
      goalLabel: results.selectedGoal.label,
      proteinGrams: results.macros.proteinGrams,
      carbGrams: results.macros.carbGrams,
      fatGrams: results.macros.fatGrams,
    };

    const updated = [newSnapshot, ...history].slice(0, 30); // keep up to 30 items
    saveHistoryToStorage(updated);
    showToast("✓ Calculation snapshot saved to history!");
  };

  const handleCopySummary = async () => {
    const summaryText = `🔥 My Ninjaa Way — Calorie & Macro Target
---------------------------------
• Maintenance (TDEE): ${results.tdee.toLocaleString()} kcal/day
• Target Goal: ${results.selectedGoal.label} (${results.selectedGoal.targetCals.toLocaleString()} kcal/day)
• Base Metabolism (BMR): ${results.bmr.toLocaleString()} kcal
• Body Metrics: ${inputs.weightKg} kg | ${inputs.heightCm} cm | Age ${inputs.age}

Macronutrients (${results.selectedGoal.targetCals.toLocaleString()} kcal):
🥩 Protein: ${results.macros.proteinGrams}g (${results.macroPcts.proteinPct}%)
🍚 Carbs:   ${results.macros.carbGrams}g (${results.macroPcts.carbPct}%)
🥑 Fats:    ${results.macros.fatGrams}g (${results.macroPcts.fatPct}%)
---------------------------------
Calculated via My Ninjaa Way`;

    try {
      await navigator.clipboard.writeText(summaryText);
      showToast("✓ Targets copied to clipboard!");
    } catch (e) {
      showToast("Unable to copy to clipboard.");
    }
  };

  const handleLoadSnapshot = (item: CalorieSnapshot) => {
    setInputs((prev) => ({
      ...prev,
      weightKg: item.weightKg,
      heightCm: item.heightCm,
    }));
    showToast(`✓ Loaded snapshot from ${item.timestamp}`);
  };

  const handleDeleteItem = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    saveHistoryToStorage(updated);
  };

  const handleClearHistory = () => {
    saveHistoryToStorage([]);
    showToast("History cleared");
  };

  return (
    <div className="space-y-8">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 dark:bg-zinc-900/70 p-3.5 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Real-time Calculations Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="px-3.5 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Summary
          </button>

          <button
            type="button"
            onClick={handleSaveSnapshot}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Snapshot
          </button>

          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
          >
            <span>History</span>
            {history.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Form Left, Results Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form (5 Cols) */}
        <div className="lg:col-span-5">
          <CalculatorForm inputs={inputs} onChange={setInputs} />
        </div>

        {/* Right Column: Output Results & Macros (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <ResultsCard
            results={results}
            selectedGoal={inputs.goal}
            onSelectGoal={(goal) => setInputs({ ...inputs, goal })}
          />

         <MacroBreakdown
           results={results}
           macroPreset={inputs.macroPreset}
           customMacros={inputs.customMacros}
           onPresetChange={(macroPreset) =>
             setInputs((prev) => ({
               ...prev,
               macroPreset,
               // Seed the custom sliders with the chosen preset so switching to
               // Custom afterwards starts from the last selected distribution.
               customMacros:
                 macroPreset === "custom" ? prev.customMacros : MACRO_PRESETS[macroPreset],
             }))
           }
           onCustomMacrosChange={(customMacros) =>
             setInputs((prev) => ({ ...prev, customMacros, macroPreset: "custom" }))
           }
         />

        </div>
      </div>

      {/* History Modal */}
      <CalorieHistoryModal
        isOpen={isHistoryOpen}
        history={history}
        onClose={() => setIsHistoryOpen(false)}
        onSelectSnapshot={handleLoadSnapshot}
        onDeleteItem={handleDeleteItem}
        onClearHistory={handleClearHistory}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="bg-zinc-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl border border-zinc-700 flex items-center gap-2">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
