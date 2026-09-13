import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch all favorite foods for a user
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  try {
    const favorites = await prisma.favoriteFood.findMany({
      where: { userId },
      include: { food: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(favorites.map((fav) => ({
      id: fav.id,
      foodId: fav.foodId,
      food: fav.food,
      createdAt: fav.createdAt,
    })));
  } catch (error) {
    console.error("Favorites GET error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST: Add a food to favorites
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, foodId } = body;

    if (!userId || !foodId) {
      return NextResponse.json({ error: "userId and foodId required" }, { status: 400 });
    }

    // Check if already favorited
    const existing = await prisma.favoriteFood.findUnique({
      where: { userId_foodId: { userId, foodId } },
    });

    if (existing) {
      return NextResponse.json({ success: true, favorite: existing });
    }

    const favorite = await prisma.favoriteFood.create({
      data: { userId, foodId },
    });

    return NextResponse.json({ success: true, favorite });
  } catch (error) {
    console.error("Favorites POST error:", error);
    return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 });
  }
}

// DELETE: Remove a food from favorites
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const foodId = searchParams.get("foodId");

  if (!userId || !foodId) {
    return NextResponse.json({ error: "userId and foodId required" }, { status: 400 });
  }

  try {
    await prisma.favoriteFood.deleteMany({
      where: { userId, foodId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Favorites DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 });
  }
}
