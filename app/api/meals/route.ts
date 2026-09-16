import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Add food item to meal
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, date, mealType, foodId, quantity, unit, foodData } = body;

    if (!userId || !date || !mealType || !foodId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Look up food; if not found and web food payload provided, persist first.
    let food = await prisma.foodItem.findUnique({ where: { id: foodId } });

    if (!food && foodData && typeof foodData === "object") {
      // Try to reuse an existing row with the same name to avoid duplicates.
      const existingByName = await prisma.foodItem.findFirst({
        where: { name: { equals: foodData.name, mode: "insensitive" } },
      });
      if (existingByName) {
        food = existingByName;
      } else {
        food = await prisma.foodItem.create({
          data: {
            name: foodData.name,
            category: foodData.category || "General",
            servingSize: foodData.servingSize || 100,
            servingUnit: foodData.servingUnit || "g",
            calories: foodData.calories || 0,
            protein: foodData.protein || 0,
            carbs: foodData.carbs || 0,
            fat: foodData.fat || 0,
            fiber: foodData.fiber || 0,
            sugar: foodData.sugar || 0,
            saturatedFat: foodData.saturatedFat || 0,
            sodium: foodData.sodium || 0,
            potassium: foodData.potassium || 0,
            calcium: foodData.calcium || 0,
            iron: foodData.iron || 0,
            magnesium: foodData.magnesium || 0,
            zinc: foodData.zinc || 0,
            vitaminA: foodData.vitaminA || 0,
            vitaminC: foodData.vitaminC || 0,
            vitaminD: foodData.vitaminD || 0,
            vitaminB12: foodData.vitaminB12 || 0,
            folate: foodData.folate || 0,
            isVerified: false,
          },
        });
      }
    }

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
