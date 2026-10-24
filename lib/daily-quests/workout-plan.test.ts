import assert from "node:assert/strict";
import test from "node:test";
import {
  formatExerciseAmount,
  getWorkoutExerciseProgress,
  getWorkoutPlan,
  isWorkoutPlanComplete,
} from "./workout-plan";

test("workout plans provide actionable exercises and measurable targets for every discipline", () => {
  for (const discipline of ["strength", "cardio", "mobility", "endurance"] as const) {
    const plan = getWorkoutPlan(discipline);
    assert.ok(plan.length >= 3, `${discipline} should contain multiple concrete exercises`);
    assert.ok(plan.every((exercise) => exercise.name && exercise.instruction && exercise.target > 0));
  }

  const endurance = getWorkoutPlan("endurance");
  assert.deepEqual(endurance.map(({ id }) => id), ["pushups", "situps", "squats", "walk-run"]);
  assert.deepEqual(endurance.map(({ target, unit }) => [target, unit]), [
    [30, "reps"],
    [30, "reps"],
    [30, "reps"],
    [2000, "meters"],
  ]);
});

test("saved workout progress is clamped to valid exercise targets", () => {
  const progress = getWorkoutExerciseProgress("endurance", {
    pushups: 15,
    situps: -2,
    squats: 100,
    "walk-run": 750.8,
    unknown: 8,
  });

  test("workout objectives increase with the existing quest ladder and heavy-day target", () => {
    const baseline = getWorkoutPlan("endurance", 45);
    const heavier = getWorkoutPlan("endurance", 60);

    assert.equal(baseline[0].target, 30);
    assert.equal(heavier[0].target, 40);
    assert.equal(heavier[3].target, 3000);
    assert.equal(getWorkoutPlan("endurance", 180)[0].target, 60);
  });

  assert.deepEqual(progress.map(({ id, progress: value }) => [id, value]), [
    ["pushups", 15],
    ["situps", 0],
    ["squats", 30],
    ["walk-run", 750],
  ]);
  assert.equal(isWorkoutPlanComplete(progress), false);
  assert.equal(isWorkoutPlanComplete(getWorkoutExerciseProgress("endurance", {
    pushups: 30,
    situps: 30,
    squats: 30,
    "walk-run": 2000,
  })), true);
});

test("exercise quantities use readable units", () => {
  assert.equal(formatExerciseAmount(25, "reps"), "25");
  assert.equal(formatExerciseAmount(60, "seconds"), "60s");
  assert.equal(formatExerciseAmount(500, "meters"), "500 m");
  assert.equal(formatExerciseAmount(2000, "meters"), "2 km");
});
