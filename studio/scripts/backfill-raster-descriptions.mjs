// Copy Raster's AI descriptions onto the matching Sanity image assets.
//
// Match key: Sanity `originalFilename` equals the Raster asset `name` (the
// import script uploaded each Raster asset under its Raster name). Dry-run by
// default; pass --apply to write. Only `description` is written, and only where
// Sanity has no description yet.
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

const RASTER_API_VERSION = "2026-05-20";
const RASTER_LIBRARY_ID = "old";
const PAGE_SIZE = 50;
const APPLY = process.argv.includes("--apply");

process.loadEnvFile(fileURLToPath(new URL("../.env.local", import.meta.url)));

for (const name of [
  "SANITY_STUDIO_PROJECT_ID",
  "SANITY_STUDIO_DATASET",
  "SANITY_AUTH_TOKEN",
  "SANITY_STUDIO_RASTER_API_KEY",
  "SANITY_STUDIO_RASTER_ORG_ID",
]) {
  if (!process.env[name]?.trim()) throw new Error(`Missing ${name}`);
}

const projectId = process.env.SANITY_STUDIO_PROJECT_ID.trim();
const dataset = process.env.SANITY_STUDIO_DATASET.trim();
const rasterOrgId = process.env.SANITY_STUDIO_RASTER_ORG_ID.trim();

const sanity = createClient({
  apiVersion: "2026-03-23",
  dataset,
  projectId,
  token: process.env.SANITY_AUTH_TOKEN.trim(),
  useCdn: false,
});

async function listRasterAssets() {
  const assets = [];
  for (let page = 1; ; page += 1) {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    const response = await fetch(
      `https://api.raster.app/organizations/${encodeURIComponent(rasterOrgId)}/libraries/${RASTER_LIBRARY_ID}/assets?${params}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SANITY_STUDIO_RASTER_API_KEY.trim()}`,
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
const descriptionByName = new Map();
const ambiguousNames = new Set();
for (const asset of rasterAssets) {
  const name = typeof asset.name === "string" ? asset.name.trim() : "";
  const description = typeof asset.description === "string" ? asset.description.trim() : "";
  if (!name || !description) continue;
  if (descriptionByName.has(name) && descriptionByName.get(name) !== description) {
    ambiguousNames.add(name);
  }
  descriptionByName.set(name, description);
}

const sanityAssets = await sanity.fetch(
  `*[_type == "sanity.imageAsset"]{_id, originalFilename, description}`,
);

const patches = [];
const unmatched = [];
let alreadyDescribed = 0;
for (const asset of sanityAssets) {
  const name = asset.originalFilename?.trim();
  const description = name && !ambiguousNames.has(name) ? descriptionByName.get(name) : undefined;
  if (!description) {
    unmatched.push(name ?? asset._id);
    continue;
  }
  if (asset.description?.trim()) {
    alreadyDescribed += 1;
    continue;
  }
  patches.push({ id: asset._id, description });
}

console.log(`Mode: ${APPLY ? "apply" : "dry-run"} (${projectId}/${dataset})`);
console.log(`Raster assets with descriptions: ${descriptionByName.size}`);
console.log(`Ambiguous Raster names (skipped): ${ambiguousNames.size}`);
console.log(`Sanity image assets: ${sanityAssets.length}`);
console.log(`To patch: ${patches.length}`);
console.log(`Already described: ${alreadyDescribed}`);
console.log(`Unmatched: ${unmatched.length}`);
if (unmatched.length) console.log(unmatched.map((name) => `  - ${name}`).join("\n"));

if (!APPLY) process.exit(0);

for (let index = 0; index < patches.length; index += 50) {
  const transaction = patches
    .slice(index, index + 50)
    .reduce(
      (current, { id, description }) =>
        current.patch(id, (patch) => patch.set({ description })),
      sanity.transaction(),
    );
  await transaction.commit({ visibility: "sync" });
  console.log(`Patched ${Math.min(index + 50, patches.length)}/${patches.length}`);
}
