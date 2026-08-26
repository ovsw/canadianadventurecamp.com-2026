import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./activity-schedule.ts", import.meta.url),
  "utf8",
);

test("limits projected featured Activities while preserving the total count", () => {
  assert.match(source, /count\(\*\[_type == "activity"\]\)/);
  assert.match(source, /featuredActivities\[0\.\.\.18\]/);
});
