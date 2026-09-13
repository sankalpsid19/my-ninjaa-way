import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Add food item to meal
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, date, mealType, foodId, quantity, unit } = body;

    if (!userId || !date || !mealType || !foodId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const food = await prisma.foodItem.findUnique({ where: { id: foodId } });
    if (!food) {
      return NextResponse.json({ error: "Food item not found" }, { status: 404 });
    }

    const mult = (quantity || 1) / (food.servingSize || 1);
    const calories = food.calories * mult;
    const protein = food.protein * mult;
    const carbs = food.carbs * mult;
    const fat = food.fat * mult;
    const fiber = (food.fiber || 0) * mult;

    let meal = await prisma.meal.findFirst({
      where: { userId, date, mealType },
    });

    if (!meal) {
      meal = await prisma.meal.create({
        data: { userId, date, mealType },
      });
    }

    const mealItem = await prisma.mealItem.create({
      data: {
        mealId: meal.id,
        foodId: food.id,
        quantity: quantity || 1,
        unit: unit || food.servingUnit,
        calories,
        protein,
        carbs,
        fat,
        fiber,
      },
    });

    return NextResponse.json({ success: true, mealItem });
  } catch (error) {
    console.error("Meal POST error:", error);
    return NextResponse.json({ error: "Failed to log meal" }, { status: 500 });
  }
}

// Edit meal item (update quantity, unit, food)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemId, quantity, unit, foodId } = body;

    if (!itemId) {
      return NextResponse.json({ error: "itemId required" }, { status: 400 });
    }

    const existingItem = await prisma.mealItem.findUnique({
      where: { id: itemId },
      include: { food: true },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Meal item not found" }, { status: 404 });
    }

    // If changing food, look up the new food
    const food = foodId
      ? await prisma.foodItem.findUnique({ where: { id: foodId } })
      : existingItem.food;

    if (!food) {
      return NextResponse.json({ error: "Food item not found" }, { status: 404 });
    }

    const newQuantity = quantity || existingItem.quantity;
    const newUnit = unit || existingItem.unit;
    const mult = newQuantity / (food.servingSize || 1);

    const updatedItem = await prisma.mealItem.update({
      where: { id: itemId },
      data: {
        foodId: food.id,
        quantity: newQuantity,
        unit: newUnit,
        calories: food.calories * mult,
        protein: food.protein * mult,
        carbs: food.carbs * mult,
        fat: food.fat * mult,
        fiber: (food.fiber || 0) * mult,
      },
    });

    return NextResponse.json({ success: true, mealItem: updatedItem });
  } catch (error) {
    console.error("Meal PUT error:", error);
    return NextResponse.json({ error: "Failed to edit meal item" }, { status: 500 });
  }
}

// Delete meal item
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");

  if (!itemId) {
    return NextResponse.json({ error: "Item ID required" }, { status: 400 });
  }

  try {
    await prisma.mealItem.delete({
      where: { id: itemId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Meal DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete meal item" }, { status: 500 });
  }
}
