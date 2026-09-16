import { FoodItemData } from "./engine";

/**
 * Internet food search for the Nutrition Intelligence module.
 *
 * Searches free, key-less (or optional-key) nutrition databases so foods that
 * are missing from the local `FoodItem` table can still be found and logged:
 *  1. USDA FoodData Central  -> https://fdc.nal.usda.gov/
 *  2. Open Food Facts        -> https://world.openfoodfacts.org/
 *
 * Results are returned in the app's `FoodItemData` shape (normalized per 100g)
 * and tagged with `source: "web"` so the UI can display them distinctly and so
 * the meals API knows to persist them into the local database on first log.
 */

const USDA_API_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";
const USDA_DEMO_KEY = "DEMO_KEY"; // shared across apps & rate-limited; set USDA_FDC_API_KEY in .env for production
const OFF_V1_PATH = "/cgi/search.pl"; // v1 keyword search, key-less
const OFF_V2_PATH = "/api/v2/search"; // v2 endpoint, key-less

// Open Food Facts is served from many regional hosts. The canonical `world` host
// holds the most complete database, but it (and some mirrors) periodically sit
// behind a "Page temporarily unavailable" CDN/maintenance page while others keep
// answering real data — so search probes `world` first and falls back to the
// mirrors below whenever it doesn't get usable products back.
const OFF_HOSTS = [
  "world.openfoodfacts.org",
  "de.openfoodfacts.org",
  "fr.openfoodfacts.org",
  "ch.openfoodfacts.org",
  "es.openfoodfacts.org",
  "pl.openfoodfacts.org",
  "in.openfoodfacts.org",
  "us.openfoodfacts.org",
  "uk.openfoodfacts.org",
  "ca.openfoodfacts.org",
];
// How many regional mirrors to probe in parallel after the canonical host fails.
const OFF_MIRROR_PROBE_COUNT = 5;
const OFF_TIMEOUT_MS = 5000; // slightly tighter than USDA so a sick mirror can't stall the merge

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Resolves with the first ProviderResult that contains foods. If none do, it
 * resolves with `undefined` as soon as every attempt has settled. This lets a
 * healthy mirror answer in ~1s without waiting for the slowest host to time out.
 */
async function raceToFoods(attempts: Promise<ProviderResult>[]): Promise<ProviderResult | undefined> {
  if (attempts.length === 0) return undefined;
  return new Promise((resolve) => {
    const results: ProviderResult[] = [];
    let settled = 0;
    for (const attempt of attempts) {
      attempt
        .then((r) => {
          results.push(r);
          settled++;
          if (r.foods.length > 0) resolve(r);
          else if (settled === attempts.length) resolve(results.find((x) => x.foods.length > 0));
        })
        .catch(() => {
          settled++;
          if (settled === attempts.length) resolve(results.find((x) => x.foods.length > 0));
        });
    }
  });
}

// In-memory cache. Debounced keystroke searches hit many subtly-different queries,
// and USDA's shared DEMO_KEY only allows ~30 requests/min, so cache results to
// avoid burning provider quota on repeats.
const CACHE_TTL_MS = 10 * 60 * 1000; // positive results
const NEGATIVE_CACHE_TTL_MS = 60 * 1000; // no results / providers down: retry again soon
const cache = new Map<string, { at: number; ttl: number; foods: FoodItemData[]; available: boolean }>();

// USDA nutrient ids relevant to the FoodItem model (values per 100g for
// Foundation / SR Legacy / FNDDS data types).
const USDA_NUTRIENT_IDS: Partial<Record<number, keyof FoodItemData>> = {
  1003: "protein", // Protein
  1004: "fat", // Total lipid (fat)
  1005: "carbs", // Carbohydrate, by difference
  1008: "calories", // Energy (kcal)
  1079: "fiber", // Fiber, total dietary
  2000: "sugar", // Sugars, total including NLEA
  1258: "saturatedFat", // Fatty acids, total saturated
  1093: "sodium", // Sodium, Na (mg)
  1092: "potassium", // Potassium, K (mg)
  1087: "calcium", // Calcium, Ca (mg)
  1089: "iron", // Iron, Fe (mg)
  1090: "magnesium", // Magnesium, Mg (mg)
  1095: "zinc", // Zinc, Zn (mg)
  1106: "vitaminA", // Vitamin A, RAE (mcg)
  1162: "vitaminC", // Vitamin C, total ascorbic acid (mg)
  1114: "vitaminD", // Vitamin D (D2 + D3) (mcg)
  1178: "vitaminB12", // Vitamin B-12 (mcg)
  1177: "folate", // Folate, total (mcg)
};

interface UsdaNutrient {
  nutrientId?: number;
  nutrientName?: string;
  value?: number;
  unitName?: string;
}

interface UsdaFood {
  fdcId?: number;
  description?: string;
  brandOwner?: string;
  foodCategory?: string;
  dataType?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients?: UsdaNutrient[];
}

interface OffNutriments {
  [key: string]: unknown;
}

interface OffProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  categories?: string;
  nutriments?: OffNutriments;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Result of one provider lookup: foods found + whether the provider even answered. */
interface ProviderResult {
  foods: FoodItemData[];
  ok: boolean;
}

/** Candidate USDA API keys — app keys first, shared DEMO_KEY as last resort. */
function usdaApiKeys(): string[] {
  const keys = [
    process.env.USDA_FDC_API_KEY,
    process.env.USDA_FDC_API_KEY_2,
    process.env.USDA_FDC_API_KEY_3,
  ].filter((k): k is string => Boolean(k && k.trim()));
  keys.push(USDA_DEMO_KEY);
  return keys;
}

function guessCategory(text: string): string {
  const t = text.toLowerCase();
  if (/(dairy|cheese|milk|paneer|curd|yogurt|ghee)/.test(t)) return "Dairy";
  if (/(fruit|banana|apple|mango|grape)/.test(t)) return "Fruits";
  if (/(vegetable|vegetab|tomato|potato|onion|leafy)/.test(t)) return "Vegetables";
  if (/(meat|chicken|fish|egg|soy|pulse|bean|lentil|dal|nuts?|seed)/.test(t)) return "Protein";
  if (/(rice|wheat|bread|roti|chapati|pasta|flour|cereal|oat|grain)/.test(t)) return "Staples";
  if (/(snack|biscuit|cookie|chips|namkeen)/.test(t)) return "Snacks";
  if (/(drink|juice|beverage|smoothie)/.test(t)) return "Beverages";
  return "General";
}

/** Search USDA FoodData Central (Foundation / SR Legacy / FNDDS / Branded). */
async function searchUsda(query: string, limit: number): Promise<ProviderResult> {
  for (const apiKey of usdaApiKeys()) {
    // The shared DEMO_KEY is rate-limited (~30 req/min across all consumers) and
    // 429s are transient; retry with exponential back-off to maximise hit rate.
    let attempts = 0;
    while (attempts < 3) {
      attempts++;
      try {
        const params = new URLSearchParams({ api_key: apiKey, query, pageSize: String(limit) });
        const res = await fetch(`${USDA_API_URL}?${params.toString()}`, {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(8000),
        });
        if (res.status === 429) {
          if (attempts < 3) await sleep(400 * attempts);
          continue; // retry the same key (transient throttle)
        }
        if (!res.ok) return { foods: [], ok: false };

        const json = (await res.json().catch(() => null)) as { foods?: UsdaFood[] } | null;
        if (!json || !Array.isArray(json.foods)) return { foods: [], ok: false };

        // Generic government data types are usually more accurate than branded
        // products — return those first.
        const GENERIC_DATA_TYPES = new Set(["Foundation", "SR Legacy", "Survey (FNDDS)"]);
        const rank = (food: UsdaFood) => (food.dataType && GENERIC_DATA_TYPES.has(food.dataType) ? 0 : 1);

        const foods = json.foods
          .slice()
          .sort((a, b) => rank(a) - rank(b))
          .map((food): FoodItemData | null => {
            const name = (food.description || "").trim();
            if (!name) return null;

            // Branded foods report nutrients per serving; normalize everything to 100g.
            const normalize = (value: number) => {
              if (food.servingSizeUnit === "g" && food.servingSize && food.servingSize > 0) {
                return (value * 100) / food.servingSize;
              }
              return value;
            };

            const item: FoodItemData = {
              id: `web-usda-${food.fdcId ?? normalizeName(name)}`,
              name,
              category: guessCategory(food.foodCategory || name),
              servingSize: 100,
              servingUnit: "g",
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              fiber: 0,
              source: "web",
              externalId: food.fdcId ? String(food.fdcId) : undefined,
              brand: food.brandOwner?.trim() || undefined,
            };

            for (const nutrient of food.foodNutrients || []) {
              const field = USDA_NUTRIENT_IDS[nutrient.nutrientId ?? -1];
              if (!field) continue;
              (item as unknown as Record<string, number>)[field] = Math.round(normalize(toNumber(nutrient.value)) * 100) / 100;
            }

            // Same sanity guard as the OFF parse: branded USDA rows sometimes
            // mis-scale per-serving values, and nothing edible exceeds ~900
            // kcal/100g (pure fat), so clamp to keep the UI honest.
            item.calories = Math.min(item.calories, 900);

            return item;
          })
          .filter((f): f is FoodItemData => f !== null)
          .filter((f) => f.calories > 0 || f.protein > 0 || f.carbs > 0 || f.fat > 0);

        return { foods, ok: true };
      } catch {
        return { foods: [], ok: false }; // network error / timeout → treat as unavailable
      }
    }
  }
  return { foods: [], ok: false }; // every configured USDA key is rate-limited
}
/**
 * Search Open Food Facts (key-less, includes many regional products).
 *
 * The canonical `world` host and up to `OFF_MIRROR_PROBE_COUNT` regional
 * mirrors are queried **concurrently** — the canonical host wins when it
 * returns products, otherwise the first mirror with real results is used.
 * Probing in parallel (rather than serially) keeps lookups fast even when one
 * host is behind a maintenance/CDN outage and hangs. A final v2 fallback is
 * attempted when every v1 probe came up empty, because v2 occasionally
 * succeeds when the v1 CGI is being filtered.
 */
async function searchOpenFoodFacts(query: string, limit: number): Promise<ProviderResult> {
  const probeHosts = OFF_HOSTS.slice(0, 1 + OFF_MIRROR_PROBE_COUNT);
  const attempts = probeHosts.map((host) => searchOffV1(query, limit, host));

  const canonical = await attempts[0];
  const mirror = await raceToFoods(attempts.slice(1));

  const winner = canonical.foods.length > 0 ? canonical : mirror;
  if (winner) return winner;

  // Every v1 probe found nothing usable — try v2 against the canonical host.
  const v2 = await searchOffV2(query, limit, OFF_HOSTS[0]);
  if (v2.foods.length > 0 || v2.ok) return v2;

  // At least one host answered successfully — report that providers are online
  // even though the specific query had zero hits.
  const settled = await Promise.all(attempts.map((p) => p.catch(() => ({ foods: [] as FoodItemData[], ok: false }))));
  const answered = settled.find((r) => r.ok);
  return answered ?? { foods: [], ok: false };
}

/** Open Food Facts v1 /cgi/search.pl endpoint. */
async function searchOffV1(query: string, limit: number, host: string): Promise<ProviderResult> {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: "1",
    action: "process",
    json: "1",
    page_size: String(limit),
    fields: "code,product_name,brands,categories,nutriments",
  });
  try {
    const res = await fetch(`https://${host}${OFF_V1_PATH}?${params.toString()}`, {
      headers: { Accept: "application/json", "User-Agent": "my-ninjaa-way-nutrition/0.1" },
      signal: AbortSignal.timeout(OFF_TIMEOUT_MS),
    });
    if (!res.ok) return { foods: [], ok: false };
    const json = (await res.json().catch(() => null)) as { products?: OffProduct[] } | null;
    if (!json || !Array.isArray(json.products)) return { foods: [], ok: false };
    return { foods: parseOffProducts(json.products, query), ok: true };
  } catch {
    return { foods: [], ok: false }; // network error / timeout / maintenance page
  }
}

/** Open Food Facts v2 /api/v2/search endpoint — fallback when v1 is unavailable. */
async function searchOffV2(query: string, limit: number, host: string): Promise<ProviderResult> {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: "1",
    page_size: String(limit),
    fields: "code,product_name,brands,categories,nutriments",
  });
  try {
    const res = await fetch(`https://${host}${OFF_V2_PATH}?${params.toString()}`, {
      headers: { Accept: "application/json", "User-Agent": "my-ninjaa-way-nutrition/0.1" },
      signal: AbortSignal.timeout(OFF_TIMEOUT_MS),
    });
    if (!res.ok) return { foods: [], ok: false };
    const json = (await res.json().catch(() => null)) as { products?: OffProduct[] } | null;
    if (!json || !Array.isArray(json.products)) return { foods: [], ok: false };
    return { foods: parseOffProducts(json.products, query), ok: true };
  } catch {
    return { foods: [], ok: false };
  }
}

/**
 * True when the product name overlaps with the query. OFF's v2 search sometimes
 * ignores keywords entirely and returns random products, so this protects the
 * results list from being polluted by irrelevant matches.
 */
function isRelevant(name: string, query: string): boolean {
  const nameTokens = new Set(name.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 2));
  const queryTokens = query.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 2);
  if (queryTokens.length === 0) return true;
  const nameLower = name.toLowerCase();
  for (const qToken of queryTokens) {
    if (nameLower.includes(qToken)) return true;
    // Loose plural/prefix match: "egg" in query "eggs", "seeds" vs "seed", etc.
    for (const nameToken of nameTokens) {
      if (qToken.includes(nameToken) || nameToken.includes(qToken)) return true;
    }
  }
  return false;
}

/** Convert Open Food Facts product objects into app FoodItemData (values per 100g). */
function parseOffProducts(products: OffProduct[], query: string): FoodItemData[] {
  return products
    .filter((p) => isRelevant(p.product_name || "", query))
    .map((product): FoodItemData | null => {
      const name = (product.product_name || "").trim();
      if (!name) return null;

      const n = product.nutriments || {};
      // OFF submissions sometimes have data-entry errors (e.g. kJ typed into
      // the kcal field → 1050 "kcal"). Nothing edible exceeds ~900 kcal/100g
      // (pure fat), so clamp to that as a sanity guard.
      const kcal = Math.min(
        toNumber(n["energy-kcal_100g"]) ||
          (toNumber(n["energy_100g"]) ? Math.round((toNumber(n["energy_100g"]) / 4.184) * 100) / 100 : 0),
        900
      );

      const category =
        typeof product.categories === "string" && product.categories.trim()
          ? guessCategory(product.categories)
          : "General";

      return {
        id: `web-off-${(product.code || "").trim() || normalizeName(name)}`,
        name,
        category,
        servingSize: 100,
        servingUnit: "g",
        calories: kcal,
        protein: toNumber(n["proteins_100g"]),
        carbs: toNumber(n["carbohydrates_100g"]),
        fat: toNumber(n["fat_100g"]),
        fiber: toNumber(n["fiber_100g"]),
        sugar: toNumber(n["sugars_100g"]),
        saturatedFat: toNumber(n["saturated-fat_100g"]),
        // Open Food Facts reports sodium per 100g in grams; convert to mg.
        sodium: Math.round(toNumber(n["sodium_100g"]) * 1000 * 100) / 100,
        potassium: toNumber(n["potassium_100g"]),
        calcium: toNumber(n["calcium_100g"]),
        iron: toNumber(n["iron_100g"]),
        magnesium: toNumber(n["magnesium_100g"]),
        zinc: toNumber(n["zinc_100g"]),
        vitaminA: toNumber(n["vitamin-a_100g"]),
        vitaminC: toNumber(n["vitamin-c_100g"]),
        vitaminD: toNumber(n["vitamin-d_100g"]),
        vitaminB12: toNumber(n["vitamin-b12_100g"]),
        folate: toNumber(n["folates_100g"]),
        source: "web",
        externalId: product.code ? String(product.code) : undefined,
        brand: (product.brands || "").trim() || undefined,
      };
    })
    .filter((f): f is FoodItemData => f !== null)
    .filter((f) => f.calories > 0 || f.protein > 0 || f.carbs > 0 || f.fat > 0);
}

function mergeDeduped(foods: FoodItemData[], limit: number): FoodItemData[] {
  const seen = new Set<string>();
  const merged: FoodItemData[] = [];
  for (const food of foods) {
    const key = normalizeName(food.name);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(food);
    if (merged.length >= limit) break;
  }
  return merged;
}

/**
 * Search the internet for foods matching `query`.
 * Merges results from all providers, dedupes by normalized name, and returns
 * at most `limit` items — plus `available`, which is true when at least one
 * provider answered. Callers can then distinguish "truly no results" from
 * "USDA / Open Food Facts is down or rate-limited right now".
 * Never throws — always resolves.
 */
export async function searchInternetFoodsDetailed(
  query: string,
  limit = 12
): Promise<{ foods: FoodItemData[]; available: boolean }> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { foods: [], available: false };
  }

  const cacheKey = trimmed.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < cached.ttl) {
    return { foods: cached.foods.slice(0, limit), available: cached.available };
  }

  const [usda, off] = await Promise.all([
    searchUsda(trimmed, limit),
    searchOpenFoodFacts(trimmed, limit),
  ]);

  const available = usda.ok || off.ok;
  const merged = mergeDeduped([...usda.foods, ...off.foods], limit);
  cache.set(cacheKey, {
    at: Date.now(),
    ttl: merged.length > 0 ? CACHE_TTL_MS : NEGATIVE_CACHE_TTL_MS,
    foods: merged,
    available,
  });
  return { foods: merged, available };
}

/**
 * Search the internet for foods matching `query`.
 * Merges results from all providers, dedupes by normalized name, and returns
 * at most `limit` items. Never throws — always returns an array.
 */
export async function searchInternetFoods(query: string, limit = 12): Promise<FoodItemData[]> {
  const { foods } = await searchInternetFoodsDetailed(query, limit);
  return foods;
}