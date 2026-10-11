import { test } from "node:test";
import assert from "node:assert/strict";

test("fallback module catalog stays usable when Prisma cannot reach the database", async () => {
  const { getFallbackModuleStatuses } = await import("./auth-actions");

  const modules = await getFallbackModuleStatuses(null);

  assert.equal(modules.length, 4);
  assert.deepEqual(
    modules.map((module) => ({ slug: module.slug, accessStatus: module.accessStatus })),
    [
      { slug: "calorie-calculator", accessStatus: "approved" },
      { slug: "nutrition", accessStatus: "approved" },
      { slug: "clients", accessStatus: "unauthenticated" },
      { slug: "daily-quests", accessStatus: "unauthenticated" },
    ],
  );
});
