// Unit tests for the internet food search module.
// Run: pnpm test  (uses tsx + node:test — no extra deps)
//
// Tests use a mocked global.fetch so they don't depend on external APIs.

import { test } from "node:test";
import assert from "node:assert/strict";
import { searchInternetFoodsDetailed } from "./internet-foods";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal mock Response. */
function mockResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function htmlMaintenance(): Response {
  return new Response("<html><title>Page temporarily unavailable</title></html>", {
    status: 503,
    headers: { "content-type": "text/html" },
  });
}

/** A plausible USDA foods/search payload with one nutrient-dense item. */
function usdaPayload(name = "PANEER, RAW") {
  return {
    foods: [
      {
        fdcId: 12345,
        description: name,
        dataType: "Foundation",
        foodCategory: "Dairy and Egg Products",
        foodNutrients: [
          { nutrientId: 1008, value: 265 },   // kcal
          { nutrientId: 1003, value: 18.3 },  // protein
          { nutrientId: 1005, value: 1.2 },   // carbs
          { nutrientId: 1004, value: 20.8 },  // fat
        ],
      },
    ],
  };
}

/** A plausible Open Food Facts payload with one product. */
function offPayload(name = "Paneer") {
  return {
    count: 1,
    products: [
      {
        code: "8904083300021",
        product_name: name,
        brands: "Milky Mist",
        categories: "Cheeses",
        nutriments: {
          energy_value_100g: 265,
          proteins_100g: 18,
          carbohydrates_100g: 1.2,
          fat_100g: 20,
          fiber_100g: 0,
          sugars_100g: 1,
          "saturated-fat_100g": 13,
          sodium_100g: 0.3,
        },
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test("returns empty when query is shorter than 2 chars", async () => {
  const r = await searchInternetFoodsDetailed("p", 5);
  assert.deepEqual(r, { foods: [], available: false });
});

test("merges USDA + OFF results when both providers answer", async () => {
  const origFetch = globalThis.fetch;
  try {
    let callCount = 0;
    globalThis.fetch = async (_url: string | URL | Request) => {
      callCount++;
      const u = String(_url);
      if (u.includes("nal.usda.gov")) return mockResponse(usdaPayload());
      if (u.includes("openfoodfacts.org")) return mockResponse(offPayload());
      return new Response("not found", { status: 404 });
    };

    const r = await searchInternetFoodsDetailed("paneer", 10);
    assert.ok(r.available, "should report available when at least one provider answered");
    assert.ok(r.foods.length >= 2, `expected ≥2 foods from merged results, got ${r.foods.length}`);
    assert.ok(callCount >= 2, "should have hit both USDA and OFF");
  } finally {
    globalThis.fetch = origFetch;
  }
});

test("falls back to OFF mirrors when world host returns 503", async () => {
  const origFetch = globalThis.fetch;
  try {
    let offWorldCallCount = 0;
    globalThis.fetch = async (_url: string | URL | Request) => {
      const u = String(_url);
      if (u.includes("nal.usda.gov")) return mockResponse({ foods: [] }); // USDA empty
      if (u.includes("world.openfoodfacts.org")) { offWorldCallCount++; return htmlMaintenance(); }
      // Any other OFF host → valid products matching the query
      if (u.includes("openfoodfacts.org")) return mockResponse(offPayload("Tofu"));
      return new Response("not found", { status: 404 });
    };

    const r = await searchInternetFoodsDetailed("tofu", 10);
    assert.ok(r.available, "should still be available via mirror");
    assert.ok(r.foods.length >= 1, "should return products from a working mirror");
    assert.ok(offWorldCallCount >= 1, "should have tried world first");
  } finally {
    globalThis.fetch = origFetch;
  }
});

test("returns available: true when providers answer but query has no matches", async () => {
  const origFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (_url: string | URL | Request) => {
      const u = String(_url);
      if (u.includes("nal.usda.gov")) return mockResponse({ foods: [] });
      if (u.includes("openfoodfacts.org")) return mockResponse({ count: 0, products: [] });
      return new Response("not found", { status: 404 });
    };

    const r = await searchInternetFoodsDetailed("zzzznotrealfood123", 10);
    assert.equal(r.available, true, "providers answered → available");
    assert.equal(r.foods.length, 0, "no matches → empty array");
  } finally {
    globalThis.fetch = origFetch;
  }
});

test("available: false when all providers are unreachable", async () => {
  const origFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => { throw new Error("network down"); };
    const r = await searchInternetFoodsDetailed("apple", 10);
    assert.equal(r.available, false);
    assert.equal(r.foods.length, 0);
  } finally {
    globalThis.fetch = origFetch;
  }
});

test("USDA 429 triggers backoff retries, then falls back to OFF", async () => {
  const origFetch = globalThis.fetch;
  try {
    let usdaAttempts = 0;
    globalThis.fetch = async (_url: string | URL | Request) => {
      const u = String(_url);
      if (u.includes("nal.usda.gov")) {
        usdaAttempts++;
        if (usdaAttempts <= 2) return new Response("rate limited", { status: 429 });
        return mockResponse(usdaPayload("CHICKEN, RAW")); // succeeds on 3rd attempt
      }
      if (u.includes("openfoodfacts.org")) return mockResponse(offPayload("Chicken"));
      return new Response("not found", { status: 404 });
    };

    const r = await searchInternetFoodsDetailed("chicken", 10);
    assert.ok(r.available);
    assert.ok(r.foods.length >= 2, "should have foods from USDA (after retries) and OFF");
    assert.ok(usdaAttempts >= 3, `USDA should have been retried, attempts=${usdaAttempts}`);
  } finally {
    globalThis.fetch = origFetch;
  }
});

test("result is cached — repeated queries don't refetch", async () => {
  const origFetch = globalThis.fetch;
  try {
    let callCount = 0;
    globalThis.fetch = async (_url: string | URL | Request) => {
      callCount++;
      const u = String(_url);
      if (u.includes("nal.usda.gov")) return mockResponse(usdaPayload("RICE, WHITE"));
      if (u.includes("openfoodfacts.org")) return mockResponse(offPayload("White Rice"));
      return new Response("not found", { status: 404 });
    };

    await searchInternetFoodsDetailed("rice", 10);
    const firstCallCount = callCount;

    // Second call with the same query (within TTL) should hit cache.
    const r2 = await searchInternetFoodsDetailed("rice", 10);
    assert.equal(callCount, firstCallCount, "cache should prevent refetch");
    assert.ok(r2.foods.length > 0);
  } finally {
    globalThis.fetch = origFetch;
  }
});