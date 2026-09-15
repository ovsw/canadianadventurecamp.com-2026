// Copy Raster's AI descriptions onto matching Sanity image assets.
//
// Workflow: upload the same image files to a Raster library and to the Sanity
// media library, wait for Raster to describe them, then run this script.
// See docs/agents/raster-descriptions.md.
//
// Match key: the Sanity asset `originalFilename` without its extension, compared
// case-insensitively against the Raster asset `name` (Raster strips extensions
// on upload). Raster names that map to more than one description are skipped.
//
// Dry-run by default. `--apply` writes. Only `description` is written, and only
// where Sanity has none, unless `--overwrite` is passed.
//
//   node --env-file=.env.local scripts/sync-raster-descriptions.mjs --library latest
//   node --env-file=.env.local scripts/sync-raster-descriptions.mjs --library latest --apply
import { createClient } from "@sanity/client";
import { assertCacProductionTarget } from "./assert-cac-production-target.mjs";

const RASTER_API_VERSION = "2026-05-20";
const PAGE_SIZE = 50;
const TRANSACTION_SIZE = 50;

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const OVERWRITE = args.includes("--overwrite");
const libraryIndex = args.indexOf("--library");
const RASTER_LIBRARY_ID = libraryIndex === -1 ? "" : (args[libraryIndex + 1] ?? "");
if (!RASTER_LIBRARY_ID) {
  throw new Error("Usage: sync-raster-descriptions.mjs --library <raster-library-id> [--apply] [--overwrite]");
}

for (const name of [
  "SANITY_STUDIO_PROJECT_ID",
  "SANITY_STUDIO_DATASET",
  "SANITY_AUTH_TOKEN",
  "RASTER_API_KEY",
  "RASTER_ORG_ID",
]) {
  if (!process.env[name]?.trim()) throw new Error(`Missing ${name} in studio/.env.local`);
}

const projectId = process.env.SANITY_STUDIO_PROJECT_ID.trim();
const dataset = process.env.SANITY_STUDIO_DATASET.trim();
const rasterOrgId = process.env.RASTER_ORG_ID.trim();
const rasterApiKey = process.env.RASTER_API_KEY.trim();
assertCacProductionTarget({ dataset, projectId });

const sanity = createClient({
  apiVersion: "2026-03-23",
  dataset,
  projectId,
  token: process.env.SANITY_AUTH_TOKEN.trim(),
  useCdn: false,
});

const stem = (filename) =>
  filename
    .replace(/\.[a-z0-9]+$/i, "")
    .trim()
    .toLowerCase();

async function listRasterAssets() {
  const assets = [];
  for (let page = 1; ; page += 1) {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    const response = await fetch(
      `https://api.raster.app/organizations/${encodeURIComponent(rasterOrgId)}/libraries/${encodeURIComponent(RASTER_LIBRARY_ID)}/assets?${params}`,
      {
        headers: {
          Authorization: `Bearer ${rasterApiKey}`,
          "Api-Version": RASTER_API_VERSION,
        },
      },
    );
    if (!response.ok) throw new Error(`Raster ${response.status}: ${await response.text()}`);
    const { data } = await response.json();
    assets.push(...(Array.isArray(data) ? data : []));
    if (!Array.isArray(data) || data.length < PAGE_SIZE) break;
  }
  return assets;
}

const rasterAssets = await listRasterAssets();
const descriptionByStem = new Map();
const ambiguousStems = new Set();
let undescribedInRaster = 0;
for (const asset of rasterAssets) {
  const name = typeof asset.name === "string" ? stem(asset.name) : "";
  const description = typeof asset.description === "string" ? asset.description.trim() : "";
  if (!name) continue;
  if (!description) {
    undescribedInRaster += 1;
    continue;
  }
  if (descriptionByStem.has(name) && descriptionByStem.get(name) !== description) {
    ambiguousStems.add(name);
  }
  descriptionByStem.set(name, description);
}

const sanityAssets = await sanity.fetch(
  `*[_type == "sanity.imageAsset"]{_id, originalFilename, description}`,
);

const patches = [];
const skippedDescribed = [];
const matchedStems = new Set();
for (const asset of sanityAssets) {
  const key = asset.originalFilename ? stem(asset.originalFilename) : "";
  const description = key && !ambiguousStems.has(key) ? descriptionByStem.get(key) : undefined;
  if (!description) continue;
  matchedStems.add(key);
  if (asset.description?.trim() && !OVERWRITE) {
    skippedDescribed.push(asset.originalFilename);
    continue;
  }
  if (asset.description?.trim() === description) continue;
  patches.push({ id: asset._id, filename: asset.originalFilename, description });
}
const unmatchedRaster = [...descriptionByStem.keys()].filter((key) => !matchedStems.has(key));

console.log(`Mode: ${APPLY ? "apply" : "dry-run"} (${projectId}/${dataset}, Raster library "${RASTER_LIBRARY_ID}")`);
console.log(`Raster assets: ${rasterAssets.length} (${descriptionByStem.size} described, ${undescribedInRaster} still undescribed, ${ambiguousStems.size} ambiguous names skipped)`);
console.log(`Sanity image assets: ${sanityAssets.length}`);
console.log(`To patch: ${patches.length}`);
if (patches.length) console.log(patches.map((patch) => `  - ${patch.filename}`).join("\n"));
console.log(`Matched but already described (kept): ${skippedDescribed.length}`);
console.log(`Raster assets with no Sanity match: ${unmatchedRaster.length}`);
if (unmatchedRaster.length) console.log(unmatchedRaster.map((name) => `  - ${name}`).join("\n"));

if (!APPLY) {
  console.log("Dry run. Re-run with --apply to write.");
  process.exit(0);
}

for (let index = 0; index < patches.length; index += TRANSACTION_SIZE) {
  const transaction = patches
    .slice(index, index + TRANSACTION_SIZE)
    .reduce(
      (current, { id, description }) => current.patch(id, (patch) => patch.set({ description })),
      sanity.transaction(),
    );
  await transaction.commit({ visibility: "sync" });
  console.log(`Patched ${Math.min(index + TRANSACTION_SIZE, patches.length)}/${patches.length}`);
}
