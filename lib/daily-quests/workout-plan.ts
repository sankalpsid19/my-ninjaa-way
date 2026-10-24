import type { Discipline, WorkoutExerciseProgress, WorkoutExerciseUnit } from "./types";

export interface WorkoutExercise {
  id: string;
  name: string;
  instruction: string;
  target: number;
  unit: WorkoutExerciseUnit;
  step: number;
}

const WORKOUT_PLANS: Record<Exclude<Discipline, null>, readonly WorkoutExercise[]> = {
  strength: [
    { id: "pushups", name: "Push-ups", instruction: "Use a wall or incline variation if needed.", target: 20, unit: "reps", step: 5 },
    { id: "squats", name: "Bodyweight squats", instruction: "Keep the movement controlled and within a comfortable range.", target: 30, unit: "reps", step: 5 },
    { id: "glute-bridges", name: "Glute bridges", instruction: "Pause briefly at the top of each repetition.", target: 30, unit: "reps", step: 5 },
    { id: "plank", name: "Plank", instruction: "Break the hold into comfortable intervals.", target: 30, unit: "seconds", step: 10 },
  ],
  cardio: [
    { id: "walk-run", name: "Brisk walk or easy run", instruction: "Choose a conversational pace; walking counts.", target: 2000, unit: "meters", step: 500 },
    { id: "marching", name: "Marching or jumping jacks", instruction: "Choose low-impact marching if jumping is uncomfortable.", target: 40, unit: "reps", step: 10 },
    { id: "intervals", name: "Comfortable faster intervals", instruction: "Alternate easy movement with short, controlled faster efforts.", target: 3, unit: "reps", step: 1 },
  ],
  mobility: [
    { id: "cat-cow", name: "Cat-cow", instruction: "Move slowly through a comfortable range.", target: 10, unit: "reps", step: 5 },
    { id: "shoulder-circles", name: "Shoulder circles", instruction: "Use smooth circles in both directions.", target: 20, unit: "reps", step: 5 },
    { id: "hip-flexor", name: "Gentle hip-flexor stretch", instruction: "Hold each side for the target duration.", target: 60, unit: "seconds", step: 15 },
    { id: "hamstring", name: "Gentle hamstring stretch", instruction: "Hold each side for the target duration; do not force the stretch.", target: 60, unit: "seconds", step: 15 },
  ],
  endurance: [
    { id: "pushups", name: "Push-ups", instruction: "Split into sets; wall or incline push-ups are valid alternatives.", target: 30, unit: "reps", step: 5 },
    { id: "situps", name: "Sit-ups or crunches", instruction: "Use a comfortable range and stop if you feel pain.", target: 30, unit: "reps", step: 5 },
    { id: "squats", name: "Bodyweight squats", instruction: "Split into sets and keep each repetition controlled.", target: 30, unit: "reps", step: 5 },
    { id: "walk-run", name: "Walk or run", instruction: "Choose a comfortable pace; split the distance or take walk breaks.", target: 2000, unit: "meters", step: 500 },
  ],
};

export function getWorkoutPlan(discipline: Discipline, targetMinutes = 45): readonly WorkoutExercise[] {
  const multiplier = Math.min(2, Math.max(1, targetMinutes / 45));
  return WORKOUT_PLANS[discipline ?? "strength"].map((exercise) => ({
    ...exercise,
    target: Math.ceil((exercise.target * multiplier) / exercise.step) * exercise.step,
  }));
}

export function getWorkoutExerciseProgress(
  discipline: Discipline,
  savedProgress: unknown,
  targetMinutes = 45,
): WorkoutExerciseProgress[] {
  const progress =
    typeof savedProgress === "object" && savedProgress !== null && !Array.isArray(savedProgress)
      ? savedProgress as Record<string, unknown>
      : {};

  return getWorkoutPlan(discipline, targetMinutes).map((exercise) => {
    const saved = progress[exercise.id];
    const value = typeof saved === "number" && Number.isFinite(saved) ? saved : 0;
    return {
      ...exercise,
      progress: Math.min(exercise.target, Math.max(0, Math.floor(value))),
    };
  });
}

export function isWorkoutPlanComplete(exercises: readonly WorkoutExerciseProgress[]): boolean {
  return exercises.length > 0 && exercises.every((exercise) => exercise.progress >= exercise.target);
}

export function formatExerciseAmount(value: number, unit: WorkoutExerciseUnit): string {
  if (unit === "meters") return value >= 1000 ? `${value / 1000} km` : `${value} m`;
  if (unit === "seconds") return `${value}s`;
  return `${value}`;
}
