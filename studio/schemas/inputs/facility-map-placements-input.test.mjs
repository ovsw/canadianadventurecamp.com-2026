import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createFacilitiesMapPath } from "../../../shared/facilities-map-path.ts";

const inputSource = await readFile(
  new URL("./facility-map-placements-input.tsx", import.meta.url),
  "utf8",
);

test("uses the shared Facilities Map route generator", () => {
  assert.match(inputSource, /shared\/facilities-map-path\.ts/);
  assert.doesNotMatch(inputSource, /from "d3-shape"/);
  assert.doesNotMatch(inputSource, /function createPath/);
});

test("preserves two-stop and multi-stop routes", () => {
  assert.equal(
    createFacilitiesMapPath([
      { x: 20, y: 30 },
      { x: 70, y: 60 },
    ]),
    "M20,30L70,60",
  );

  const points = [
    { x: 15, y: 20 },
    { x: 45, y: 65 },
    { x: 80, y: 30 },
  ];
  assert.notEqual(
    createFacilitiesMapPath(points),
    createFacilitiesMapPath([points[0], points[2], points[1]]),
  );
});
