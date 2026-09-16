import React, { useState, useEffect, useCallback, useRef } from "react";
import { FoodItemData } from "@/lib/nutrition/engine";
import { X, Search, Star, History, Sparkles, UtensilsCrossed, Globe } from "lucide-react";

interface FoodLogModalProps {
  userId: string;
  initialMealType?: string;
  initialQuery?: string;
  onClose: () => void;
  onLogFood: (foodId: string, quantity: number, unit: string, mealType: string, foodData?: FoodItemData) => void;
}

interface RecentFood {
  foodId: string;
  food: FoodItemData;
  lastUsed: string;
  lastQuantity: number;
  lastUnit: string;
}

interface FavoriteFoodEntry {
  id: string;
  foodId: string;
  food: FoodItemData;
  createdAt: string;
}

interface SavedMealItemEntry {
  id: string;
  foodId: string;
  food: FoodItemData;
  quantity: number;
  unit: string;
}

interface SavedMealEntry {
  id: string;
  name: string;
  createdAt: string;
  items: SavedMealItemEntry[];
}

export const FoodLogModal: React.FC<FoodLogModalProps> = ({
  userId,
  initialMealType = "Breakfast",
  initialQuery = "",
  onClose,
  onLogFood,
}) => {
  const [mealType, setMealType] = useState(initialMealType);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [foods, setFoods] = useState<FoodItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState<FoodItemData | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>("g");
  // Guards against out-of-order search responses overwriting newer results.
  const searchSeq = useRef(0);

  const [recentFoods, setRecentFoods] = useState<RecentFood[]>([]);
  const [favorites, setFavorites] = useState<FavoriteFoodEntry[]>([]);
  const [savedMeals, setSavedMeals] = useState<SavedMealEntry[]>([]);
  const [nlpText, setNlpText] = useState("");
  const [internetUnavailable, setInternetUnavailable] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "nlp" | "recent" | "favorites" | "saved">(
    initialQuery ? "search" : "search"
  );

  const fetchFoods = async (q: string) => {
    const seq = ++searchSeq.current;
    setLoading(true);
    try {
      const res = await fetch(`/api/foods/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (seq === searchSeq.current) {
        setInternetUnavailable(res.headers.get("x-internet-unavailable") === "1");
        if (Array.isArray(data)) setFoods(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (seq === searchSeq.current) setLoading(false);
    }
  };

  // Debounce the (now internet-backed) search so we don't hit web APIs per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFoods(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchRecent = useCallback(async () => {
    try {
      const res = await fetch(`/api/nutrition/recent?userId=${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) setRecentFoods(data);
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await fetch(`/api/nutrition/favorites?userId=${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) setFavorites(data);
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  const fetchSavedMeals = useCallback(async () => {
    try {
      const res = await fetch(`/api/nutrition/saved-meals?userId=${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) setSavedMeals(data);
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  useEffect(() => {
    fetchRecent();
    fetchFavorites();
    fetchSavedMeals();
  }, [fetchRecent, fetchFavorites, fetchSavedMeals]);

  const handleSelectFood = (food: FoodItemData) => {
    setSelectedFood(food);
    setQuantity(food.servingSize || 1);
    setUnit(food.servingUnit || "g");
  };

  const handleConfirmLog = () => {
    if (!selectedFood) return;
    // All search results come from the internet — ship the nutrition payload
    // so the meals API can persist the food into the library before logging.
    onLogFood(selectedFood.id, quantity, unit, mealType, selectedFood);
    onClose();
  };

  const handleLogSavedMeal = (meal: SavedMealEntry) => {
    meal.items.forEach((item) => {
      onLogFood(item.foodId, item.quantity, item.unit, mealType);
    });
    onClose();
  };

  const handleToggleFavorite = async (foodId: string) => {
    const isFav = favorites.some((f) => f.foodId === foodId);
    try {
      if (isFav) {
        await fetch(`/api/nutrition/favorites?userId=${userId}&foodId=${foodId}`, { method: "DELETE" });
        setFavorites((prev) => prev.filter((f) => f.foodId !== foodId));
      } else {
        await fetch("/api/nutrition/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, foodId }),
        });
        fetchFavorites();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNlpParse = () => {
    if (!nlpText.trim()) return;
    const tokens = nlpText
      .toLowerCase()
      .split(/[,;+and\n]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    for (const token of tokens) {
      const qtyMatch = token.match(/^(\d+(?:\.\d+)?)\s+(.+)/);
      let searchName = token;
      if (qtyMatch) searchName = qtyMatch[2];

      const found = foods.find((f) => {
        const fname = f.name.toLowerCase();
        return (
          fname.includes(searchName) ||
          searchName.includes(fname) ||
          fname.split(" ").some((w) => searchName.includes(w) && w.length > 2)
        );
      });

      if (found) {
        handleSelectFood(found);
        if (qtyMatch) setQuantity(parseFloat(qtyMatch[1]) * (found.servingSize || 1));
        setActiveTab("search");
        return;
      }
    }

    const firstWord = nlpText.replace(/\d+/g, "").trim().split(/\s+/)[0];
    if (firstWord) {
      setSearchQuery(firstWord);
      setActiveTab("search");
    }
  };

  const isFavorited = (foodId: string) => favorites.some((f) => f.foodId === foodId);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 sm:overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add food"
        className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6 max-w-xl w-full shadow-2xl relative flex flex-col h-[92dvh] sm:h-auto sm:max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-800 shrink-0">
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-white">Add Food</h3>
            <p className="text-xs text-slate-400 truncate">Log meals fast to track your nutrients</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-white p-2 sm:p-1.5 rounded-full bg-slate-800 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Type Selector */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 my-3 sm:my-4 shrink-0">
          {["Breakfast", "Lunch", "Snack", "Dinner"].map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition truncate ${
                mealType.toLowerCase() === type.toLowerCase()
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 mb-3 sm:mb-4 bg-slate-800/60 rounded-xl p-1 border border-slate-700/50 shrink-0">
          <button onClick={() => setActiveTab("search")} title="Search" aria-label="Search" className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-2 rounded-lg text-xs font-semibold transition ${activeTab === "search" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}>
            <Search className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Search</span>
          </button>
          <button onClick={() => { setActiveTab("recent"); fetchRecent(); }} title="Recent" aria-label="Recent" className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-2 rounded-lg text-xs font-semibold transition ${activeTab === "recent" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}>
            <History className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Recent</span>
          </button>
          <button onClick={() => { setActiveTab("favorites"); fetchFavorites(); }} title="Favorites" aria-label="Favorites" className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-2 rounded-lg text-xs font-semibold transition ${activeTab === "favorites" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}>
            <Star className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Favorites</span>
          </button>
          <button onClick={() => { setActiveTab("saved"); fetchSavedMeals(); }} title="Saved meals" aria-label="Saved meals" className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-2 rounded-lg text-xs font-semibold transition ${activeTab === "saved" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}>
            <UtensilsCrossed className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Saved</span>
          </button>
          <button onClick={() => setActiveTab("nlp")} title="Natural language" aria-label="Natural language" className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-2 rounded-lg text-xs font-semibold transition ${activeTab === "nlp" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}>
            <Sparkles className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">NLP</span>
          </button>
        </div>

        {/* Search Tab */}
        {activeTab === "search" && (
          <>
            <div className="relative mb-3 sm:mb-4 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search foods (e.g., paneer, dal, rice, banana)"
                enterKeyHint="search"
                autoComplete="off"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                autoFocus
              />
            </div>
            <div className="grow min-h-0 space-y-2 overflow-y-auto pr-1 sm:max-h-60">
              {loading ? (
                <div className="py-6 text-center text-slate-500 text-xs">Searching online databases (USDA, Open Food Facts)...</div>
              ) : foods.length === 0 ? (
                <div className="py-6 text-center text-xs">
                  {internetUnavailable ? (
                    <span className="text-slate-500">
                      Internet food search (USDA / Open Food Facts) is unavailable right now due to
                      rate limits or maintenance. Try again in a minute.
                    </span>
                  ) : (
                    <span className="text-slate-500">
                      No foods found online. Try a different name (e.g. &quot;basmati rice&quot;).
                    </span>
                  )}
                </div>
              ) : (
                <>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Globe className="w-3 h-3" />
                    Results from online databases (USDA FoodData Central, Open Food Facts). Logging an item saves it to your library.
                  </div>
                  {foods.map((food) => (
                    <div
                      key={food.id}
                      onClick={() => handleSelectFood(food)}
                      className="flex items-center justify-between gap-2 p-3 rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 hover:border-violet-500/50 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg border border-violet-500/30 bg-violet-500/10 flex items-center justify-center text-xs font-bold shrink-0 text-violet-400">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-200 group-hover:text-white truncate">{food.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {food.servingSize} {food.servingUnit}
                            {food.brand ? ` · ${food.brand}` : ""} · {food.category}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <div className="font-bold text-sm text-violet-400">
                            {food.calories} kcal
                          </div>
                          <div className="text-[11px] text-slate-400">P: {food.protein}g · F: {food.fat}g</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        )}

        {/* Recent Tab */}
        {activeTab === "recent" && (
          <div className="grow min-h-0 space-y-2 overflow-y-auto pr-1 sm:max-h-60">
            {recentFoods.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No recently logged foods yet.
              </div>
            ) : (
              recentFoods.map((rf) => (
                <div
                  key={rf.foodId}
                  onClick={() => handleSelectFood(rf.food)}
                  className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                      <History className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-200 group-hover:text-white truncate">{rf.food.name}</div>
                      <div className="text-[11px] text-slate-400">Last: {rf.lastQuantity} {rf.lastUnit} · {rf.food.calories} kcal</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-cyan-400 text-sm">{rf.food.calories} kcal</div>
                    <div className="text-[11px] text-slate-400">P: {rf.food.protein}g</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === "favorites" && (
          <div className="grow min-h-0 space-y-2 overflow-y-auto pr-1 sm:max-h-60">
            {favorites.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No favorite foods yet. Log a food, then star it from recent foods to save it here.
              </div>
            ) : (
              favorites.map((fav) => (
                <div
                  key={fav.id}
                  onClick={() => handleSelectFood(fav.food)}
                  className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Star className="w-4 h-4 fill-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-200 group-hover:text-white truncate">{fav.food.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{fav.food.servingSize} {fav.food.servingUnit} · {fav.food.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleFavorite(fav.foodId); }}
                      className="text-amber-400 hover:text-red-400 transition p-2 sm:p-1.5"
                      title="Remove from favorites"
                      aria-label="Remove from favorites"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="text-right">
                      <div className="font-bold text-amber-400 text-sm">{fav.food.calories} kcal</div>
                      <div className="text-[11px] text-slate-400">P: {fav.food.protein}g</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

{/* Saved Meals Tab */}
        {activeTab === "saved" && (
          <div className="grow min-h-0 space-y-2 overflow-y-auto pr-1 sm:max-h-60">
            {savedMeals.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No saved meals yet. Log a meal and save it as a favorite combination to reuse it quickly.
              </div>
            ) : (
              savedMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition group"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
                        <UtensilsCrossed className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-200 truncate">{meal.name}</span>
                    </div>
                    <button
                      onClick={() => handleLogSavedMeal(meal)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-[11px] font-bold hover:bg-emerald-400 transition shrink-0"
                    >
                      Log all
                    </button>
                  </div>
                  <div className="pl-10 space-y-1">
                    {meal.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                        <span className="min-w-0 truncate">
                          {item.food.name} <span className="text-slate-500">({item.quantity} {item.unit})</span>
                        </span>
                        <span className="font-semibold text-slate-300 shrink-0">
                          {Math.round((item.food.calories * item.quantity) / (item.food.servingSize || 1))} kcal
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {/* NLP Tab */}
        {activeTab === "nlp" && (
          <div className="space-y-4 py-2 overflow-y-auto min-h-0 pr-1">
            <p className="text-xs text-slate-300">
              Type what you ate naturally. We will match it against your food database.
            </p>
            <div className="text-[11px] text-slate-500 space-y-1 mb-2">
              <p>Examples:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li><em>&quot;2 rotis and 1 bowl of dal&quot;</em></li>
                <li><em>&quot;1 apple, 1 boiled egg&quot;</em></li>
                <li><em>&quot;rice, paneer, salad&quot;</em></li>
              </ul>
            </div>
            <textarea
              value={nlpText}
              onChange={(e) => setNlpText(e.target.value)}
              placeholder="e.g. 2 eggs, 1 apple and a glass of milk"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white h-24 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleNlpParse}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Parse and Find Food
            </button>
          </div>
        )}

        {/* Portion Customizer */}
        {selectedFood && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-800 bg-slate-800/40 rounded-2xl p-3 sm:p-4 shrink-0">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-sm text-white truncate">{selectedFood.name}</span>
                {selectedFood.source !== "web" && (
                  <button
                    onClick={() => handleToggleFavorite(selectedFood.id)}
                    className={`p-1.5 rounded-lg transition shrink-0 ${isFavorited(selectedFood.id) ? "text-amber-400" : "text-slate-500 hover:text-amber-400"}`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFavorited(selectedFood.id) ? "fill-amber-400" : ""}`} />
                  </button>
                )}
              </div>
              <span className="text-xs font-bold text-emerald-400 shrink-0">
                {Math.round((selectedFood.calories * quantity) / selectedFood.servingSize)} kcal
              </span>
            </div>

            {selectedFood.source === "web" && (
              <div className="mb-3 flex items-start gap-2 text-[11px] text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-xl px-3 py-2">
                <Globe className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  Online food from USDA / Open Food Facts. It will be saved to your food library when you log it.
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Serving Amount</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0.1"
                  step="0.5"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value={selectedFood.servingUnit}>{selectedFood.servingUnit}</option>
                  {selectedFood.servingUnit !== "g" && <option value="g">g</option>}
                  {selectedFood.servingUnit !== "piece" && <option value="piece">piece</option>}
                  {selectedFood.servingUnit !== "cup" && <option value="cup">cup</option>}
                  {selectedFood.servingUnit !== "bowl" && <option value="bowl">bowl</option>}
                  {selectedFood.servingUnit !== "roti" && <option value="roti">roti</option>}
                  {selectedFood.servingUnit !== "tbsp" && <option value="tbsp">tbsp</option>}
                  {selectedFood.servingUnit !== "tsp" && <option value="tsp">tsp</option>}
                  <option value="glass">glass</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleConfirmLog}
              className="w-full mt-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition active:scale-98"
            >
              Add to {mealType}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
