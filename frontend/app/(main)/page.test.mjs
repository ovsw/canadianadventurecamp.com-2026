import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

test("homepage body renders only Page Builder sections", () => {
  assert.doesNotMatch(pageSource, /<header>/);
  assert.match(pageSource, /<Blocks[\s\S]*blocks=\{page\.blocks \?\? \[\]\}/);
});
