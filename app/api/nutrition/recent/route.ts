import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch recently logged foods for a user
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  try {
    // Get the most recent meal items for this user, grouped by food
    const recentItems = await prisma.mealItem.findMany({
      where: {
        meal: { userId },
      },
      include: {
        food: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Deduplicate by foodId, keeping only the most recent entry per food
    const seen = new Set<string>();
    const recentFoods = recentItems
      .filter((item) => {
        if (seen.has(item.foodId)) return false;
        seen.add(item.foodId);
        return true;
      })
      .slice(0, 10)
      .map((item) => ({
        foodId: item.foodId,
        food: item.food,
        lastUsed: item.createdAt,
        lastQuantity: item.quantity,
        lastUnit: item.unit,
      }));

    return NextResponse.json(recentFoods);
  } catch (error) {
    console.error("Recent foods error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
