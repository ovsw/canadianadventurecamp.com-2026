import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

test("homepage renders Page Builder sections and a title fallback without a hero", () => {
  assert.doesNotMatch(pageSource, /<header>/);
  assert.match(
    pageSource,
    /block\._type === "homeHero" \|\| block\._type === "hero"/,
  );
  assert.match(pageSource, /!hasHero \? <h1>\{page\.title\}<\/h1> : null/);
  assert.match(pageSource, /<Blocks[\s\S]*blocks=\{blocks\}/);
});
