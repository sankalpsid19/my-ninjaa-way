import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserTargets, DEFAULT_TARGETS } from "@/lib/nutrition/engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const profile = await prisma.userNutritionProfile.findUnique({
      where: { userId },
    });

    const targets: UserTargets = profile
      ? {
          ...DEFAULT_TARGETS,
          calories: profile.targetCalories,
          protein: profile.targetProtein,
          carbs: profile.targetCarbs,
          fat: profile.targetFat,
          fiber: profile.targetFiber,
        }
      : DEFAULT_TARGETS;

    return NextResponse.json({
      profile: profile || null,
      targets,
    });
  } catch (error) {
    console.error("Failed to get targets:", error);
    return NextResponse.json({ error: "Failed to get targets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      age,
      gender,
      heightCm,
      weightKg,
      activityLevel,
      goal,
    } = body as {
      userId?: string;
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      fiber?: number;
      age?: number | null;
      gender?: string | null;
      heightCm?: number | null;
      weightKg?: number | null;
      activityLevel?: string | null;
      goal?: string | null;
    };

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }
    if (calories == null) {
      return NextResponse.json({ error: "calories required" }, { status: 400 });
    }

    const dataToSave: {
      targetCalories: number;
      targetProtein: number;
      targetCarbs: number;
      targetFat: number;
      targetFiber: number;
      age?: number | null;
      gender?: string | null;
      heightCm?: number | null;
      weightKg?: number | null;
      activityLevel?: string | null;
      goal?: string | null;
    } = {
      targetCalories: Math.round(calories),
      targetProtein: Math.round(protein ?? DEFAULT_TARGETS.protein),
      targetCarbs: Math.round(carbs ?? DEFAULT_TARGETS.carbs),
      targetFat: Math.round(fat ?? DEFAULT_TARGETS.fat),
      targetFiber: Math.round(fiber ?? DEFAULT_TARGETS.fiber),
    };

    if (age !== undefined) dataToSave.age = age ? Number(age) : null;
    if (gender !== undefined) dataToSave.gender = gender;
    if (heightCm !== undefined) dataToSave.heightCm = heightCm ? Number(heightCm) : null;
    if (weightKg !== undefined) dataToSave.weightKg = weightKg ? Number(weightKg) : null;
    if (activityLevel !== undefined) dataToSave.activityLevel = activityLevel;
    if (goal !== undefined) dataToSave.goal = goal;

    // Upsert the user's nutrition profile with all macro targets and optional stats
    const profile = await prisma.userNutritionProfile.upsert({
      where: { userId },
      update: dataToSave,
      create: {
        userId,
        ...dataToSave,
      },
    });

    const updatedTargets: UserTargets = {
      ...DEFAULT_TARGETS,
      calories: profile.targetCalories,
      protein: profile.targetProtein,
      carbs: profile.targetCarbs,
      fat: profile.targetFat,
      fiber: profile.targetFiber,
    };

    return NextResponse.json({
      success: true,
      profile,
      targets: updatedTargets,
    });
  } catch (error) {
    console.error("Nutrition targets update error:", error);
    return NextResponse.json({ error: "Failed to update targets" }, { status: 500 });
  }
}
