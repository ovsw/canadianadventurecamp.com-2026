import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { contentPageBuilderBlockTypes } from "./schemas/blocks/page-builder.ts";
import { singletonDocumentTypes } from "./singletons.ts";

test("Facilities Map is shared and its configuration is a singleton", () => {
  assert.equal(contentPageBuilderBlockTypes.includes("facilitiesMapSection"), true);
  assert.equal(singletonDocumentTypes.has("facilitiesMap"), true);
});

test("the map editor keeps native array editing and opens markers by key", async () => {
  const source = await readFile(
    new URL(
      "./schemas/inputs/facility-map-placements-input.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(source, /props\.renderDefault\(props\)/);
  assert.match(source, /props\.onItemOpen\(\[\{ _key: placement\._key \}\]\)/);
  assert.match(source, /set\(current\.x, \[\{ _key: current\.key \}, "x"\]\)/);
  assert.match(source, /set\(current\.y, \[\{ _key: current\.key \}, "y"\]\)/);
});
