import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch all saved meals for a user
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  try {
    const savedMeals = await prisma.savedMeal.findMany({
      where: { userId },
      include: {
        items: {
          include: { food: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(savedMeals);
  } catch (error) {
    console.error("Saved meals GET error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST: Create a saved meal from a meal
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, foodItems } = body as {
      userId: string;
      name: string;
      foodItems: { foodId: string; quantity: number; unit: string }[];
    };

    if (!userId || !name || !foodItems || foodItems.length === 0) {
      return NextResponse.json({ error: "userId, name, and foodItems required" }, { status: 400 });
    }

    const savedMeal = await prisma.savedMeal.create({
      data: {
        userId,
        name,
        items: {
          create: foodItems.map((item) => ({
            foodId: item.foodId,
            quantity: item.quantity,
            unit: item.unit,
          })),
        },
      },
      include: {
        items: { include: { food: true } },
      },
    });

    return NextResponse.json({ success: true, savedMeal });
  } catch (error) {
    console.error("Saved meals POST error:", error);
    return NextResponse.json({ error: "Failed to create saved meal" }, { status: 500 });
  }
}

// DELETE: Remove a saved meal
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const savedMealId = searchParams.get("savedMealId");

  if (!savedMealId) {
    return NextResponse.json({ error: "savedMealId required" }, { status: 400 });
  }

  try {
    await prisma.savedMeal.delete({ where: { id: savedMealId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Saved meals DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete saved meal" }, { status: 500 });
  }
}
