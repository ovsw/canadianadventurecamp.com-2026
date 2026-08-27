import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./stacked-feature-rows.tsx", import.meta.url),
  "utf8",
);

test("keeps the stacked feature rows renderer on the server", () => {
  assert.doesNotMatch(source, /^\s*["']use client["'];/m);
  assert.match(source, /dataAttribute\?: \(path: string\)/);
});
