import React, { useState } from "react";
import { MealData } from "@/lib/nutrition/engine";
import { Plus, Trash2, Clock, Flame, Pencil, Check, X, Bookmark } from "lucide-react";

interface MealTimelineProps {
  meals: MealData[];
  onOpenLogModal: (mealType?: string) => void;
  onEditItem: (itemId: string, quantity: number, unit: string) => void;
  onDeleteItem: (itemId: string) => void;
  onSaveMeal?: (mealType: string, items: { foodId: string; quantity: number; unit: string }[]) => void;
}

export const MealTimeline: React.FC<MealTimelineProps> = ({
  meals,
  onOpenLogModal,
  onEditItem,
  onDeleteItem,
  onSaveMeal,
}) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editUnit, setEditUnit] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [savedMealType, setSavedMealType] = useState<string | null>(null);

  const mealCategories = [
    { type: "Breakfast", icon: "🍳", time: "08:30" },
    { type: "Lunch", icon: "🍛", time: "13:15" },
    { type: "Snack", icon: "🍎", time: "17:00" },
    { type: "Dinner", icon: "🥗", time: "20:30" },
  ];

  const startEdit = (itemId: string, quantity: number, unit: string) => {
    setEditingItemId(itemId);
    setEditQuantity(quantity);
    setEditUnit(unit);
  };

  const saveEdit = (itemId: string) => {
    onEditItem(itemId, editQuantity, editUnit);
    setEditingItemId(null);
  };

  const cancelEdit = () => {
    setEditingItemId(null);
  };

  const handleDelete = (itemId: string) => {
    if (confirmDeleteId === itemId) {
      onDeleteItem(itemId);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(itemId);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  const handleSaveMeal = (mealType: string, meal: MealData | undefined) => {
    if (!onSaveMeal || !meal || meal.items.length === 0) return;
    onSaveMeal(
      mealType,
      meal.items.map((item) => ({ foodId: item.foodId, quantity: item.quantity, unit: item.unit }))
    );
    setSavedMealType(mealType);
    setTimeout(() => setSavedMealType(null), 2500);
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200">Meal Timeline</h3>
        </div>
        <button
          onClick={() => onOpenLogModal()}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add Meal
        </button>
      </div>

      <div className="space-y-4 relative">
        {mealCategories.map((cat) => {
          const loggedMeal = meals.find((m) => m.mealType.toLowerCase() === cat.type.toLowerCase());
          const hasItems = loggedMeal && loggedMeal.items.length > 0;

          const totalMealCals = hasItems ? loggedMeal.items.reduce((sum, i) => sum + i.calories, 0) : 0;
          const totalMealProtein = hasItems ? loggedMeal.items.reduce((sum, i) => sum + i.protein, 0) : 0;

          return (
            <div key={cat.type} className="relative pl-6 pb-4 border-l-2 border-slate-800 last:border-l-0 last:pb-0">
              {/* Timeline Dot */}
              <div
                className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${
                  hasItems
                    ? "bg-emerald-500 border-slate-900 ring-2 ring-emerald-500/20"
                    : "bg-slate-800 border-slate-700"
                }`}
              />

              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 transition hover:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cat.icon}</span>
                    <div>
                      <span className="text-sm font-bold text-slate-200">{cat.type}</span>
                      <span className="text-[11px] text-slate-400 ml-2">approx {cat.time}</span>
                    </div>
                  </div>

                  {hasItems ? (
                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
                      <span className="flex items-center gap-1 text-amber-400">
                        <Flame className="w-3.5 h-3.5" />
                        {Math.round(totalMealCals)} kcal
                      </span>
                      <span className="text-cyan-400">P: {Math.round(totalMealProtein)}g</span>
                      {onSaveMeal && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveMeal(cat.type, loggedMeal);
                          }}
                          className={`ml-1 flex items-center gap-1 p-1.5 rounded-lg transition ${
                            savedMealType === cat.type
                              ? "text-violet-400 bg-violet-500/10"
                              : "text-slate-500 hover:text-violet-400 hover:bg-violet-500/10"
                          }`}
                          title="Save this meal to reuse it later"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${savedMealType === cat.type ? "fill-violet-400" : ""}`} />
                          <span className={`text-[10px] ${savedMealType === cat.type ? "" : "sr-only sm:not-sr-only"}`}>
                            {savedMealType === cat.type ? "Saved!" : "Save"}
                          </span>
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>

                {hasItems ? (
                  <div className="space-y-2 mt-3 pt-3 border-t border-slate-700/50">
                    {loggedMeal.items.map((item) => (
                      <div
                        key={item.id}
                        className="text-xs p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition group"
                      >
                        {editingItemId === item.id ? (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200 min-w-[80px] truncate">{item.food.name}</span>
                            <input
                              type="number"
                              min="0.1"
                              step="0.5"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(parseFloat(e.target.value) || 1)}
                              className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-emerald-500"
                            />
                            <select
                              value={editUnit}
                              onChange={(e) => setEditUnit(e.target.value)}
                              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
                            >
                              <option value={item.unit}>{item.unit}</option>
                              <option value="g">g</option>
                              <option value="piece">piece</option>
                              <option value="cup">cup</option>
                              <option value="bowl">bowl</option>
                              <option value="roti">roti</option>
                            </select>
                            <button onClick={() => saveEdit(item.id)} className="text-emerald-400 hover:text-emerald-300 p-1">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={cancelEdit} className="text-slate-400 hover:text-white p-1">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-200">{item.food.name}</span>
                              <span className="text-slate-400 text-[11px]">
                                ({item.quantity} {item.unit})
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-300 font-semibold">{Math.round(item.calories)} kcal</span>
                              <button
                                onClick={() => startEdit(item.id, item.quantity, item.unit)}
                                className="text-slate-500 hover:text-cyan-400 transition p-1 opacity-80 group-hover:opacity-100"
                                title="Edit item"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className={`transition p-1 opacity-80 group-hover:opacity-100 ${
                                  confirmDeleteId === item.id
                                    ? "text-red-400 animate-pulse"
                                    : "text-slate-500 hover:text-red-400"
                                }`}
                                title={confirmDeleteId === item.id ? "Click again to confirm" : "Delete item"}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => onOpenLogModal(cat.type)}
                      className="text-[11px] font-semibold text-emerald-400 hover:underline mt-1 inline-flex items-center gap-1"
                    >
                      + Add more to {cat.type}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>No food logged yet</span>
                    <button
                      onClick={() => onOpenLogModal(cat.type)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-[11px] transition"
                    >
                      + Log {cat.type}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
