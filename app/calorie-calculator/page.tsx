import Link from "next/link";
import type { Metadata } from "next";
import CalorieCalculatorContainer from "@/components/calorie-calculator/CalorieCalculatorContainer";

export const metadata: Metadata = {
  title: "Maintenance Calorie & Macro Calculator — My Ninjaa Way",
  description:
    "Scientifically calculate your Basal Metabolic Rate (BMR), Daily Maintenance Calories (TDEE), and custom macronutrient splits for fat loss, maintenance, or muscle gain.",
};

export default function CalorieCalculatorPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs & Navigation */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors inline-flex items-center gap-1.5"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">🔥</span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
              Health &amp; Performance
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Maintenance Calorie &amp; Macro Calculator
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-2 max-w-3xl leading-relaxed">
            Determine your exact Total Daily Energy Expenditure (TDEE) and Basal Metabolic Rate (BMR) using clinically validated scientific equations. Adjust goals and fine-tune your optimal protein, carbohydrate, and healthy fat distribution.
          </p>
        </div>

        {/* Calculator Master Container */}
        <CalorieCalculatorContainer />

        {/* Educational Info Cards */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-6 text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1.5">
              🧬 Mifflin-St Jeor Equation
            </h4>
            <p>
              Recognized by the American Dietetic Association as the most accurate standard method for predicting BMR in healthy individuals without body fat measurement.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1.5">
              ⚡ TDEE (Total Daily Energy)
            </h4>
            <p>
              Accounts for your BMR plus Non-Exercise Activity Thermogenesis (NEAT), the thermic effect of food (TEF), and intentional exercise training.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1.5">
              🎯 Goal Calorie Deficit/Surplus
            </h4>
            <p>
              A 500 kcal daily deficit translates to roughly 0.5 kg (1 lb) of fat loss per week, maintaining lean mass when paired with sufficient protein intake.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
