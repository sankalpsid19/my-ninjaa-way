import { NextRequest, NextResponse } from "next/server";
import { searchInternetFoodsDetailed } from "@/lib/nutrition/internet-foods";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  try {
    // Internet-only search: USDA FoodData Central + Open Food Facts (with
    // regional mirror fallback). Foods are persisted into the local library
    // when the user logs them (see app/api/meals/route.ts).
    const { foods, available } = await searchInternetFoodsDetailed(query, 12);

    const response = NextResponse.json(foods);
    // Tell the client when the internet providers are down/rate-limited so it
    // can show "search unavailable" instead of a misleading "no foods found".
    if (!available && query.trim().length >= 2) {
      response.headers.set("x-internet-unavailable", "1");
    }
    return response;
  } catch (error) {
    console.error("Food search error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
