import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./international-campers-section.tsx", import.meta.url),
  "utf8",
);

test("keeps the section renderer on the server", () => {
  assert.doesNotMatch(source, /^\s*["']use client["'];/m);
  assert.match(source, /dataAttribute\?: \(path: string\)/);
});

const globeSource = readFileSync(
  new URL("./international-campers-globe.tsx", import.meta.url),
  "utf8",
);

test("globe component is a client component", () => {
  assert.match(globeSource, /^\s*["']use client["'];/m);
});
