#!/usr/bin/env node
// Remove the retired button style fields from every document.
// Editors no longer choose a button's style: each section styles its buttons
// from their position. The schema no longer declares `variant` on `button`
// and `buttonLink`, nor the `link` type's `buttonVariant`, so stored values
// would show as unknown fields in the Studio.
//
// Dry run:  pnpm --dir studio migrate:remove-button-styles
// Apply:    pnpm --dir studio migrate:remove-button-styles --apply
//
// Apply first writes a raw dataset export to backups/ and stops unless it
// passes `gzip -t`. It unsets the fields under each document's own id, so
// drafts stay drafts and published documents stay published. It never
// publishes a draft.

import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { assertCacProductionTarget } from "./assert-cac-production-target.mjs";

const API_VERSION = "2026-03-23";
const studioDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const backupDirectory = resolve(studioDirectory, "../backups");

/** The style field each retired shape stored, keyed by the object's `_type`. */
const RETIRED_STYLE_FIELDS = { button: "variant", buttonLink: "variant", link: "buttonVariant" };

// JSON.stringify gives the double-quoted, escaped string JSONMatch expects.
const arraySegment = (item, index) =>
  typeof item?._key === "string" ? `[_key==${JSON.stringify(item._key)}]` : `[${index}]`;

/** Every patch path below `value` that holds a retired button style. */
export function findButtonStylePaths(value, path) {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      findButtonStylePaths(item, `${path}${arraySegment(item, index)}`),
    );
  }
  if (!value || typeof value !== "object") return [];
  const field = RETIRED_STYLE_FIELDS[value._type];
  const own = field && field in value ? [`${path}.${field}`] : [];
  return [
    ...own,
    ...Object.entries(value)
      .filter(([key]) => !key.startsWith("_"))
      .flatMap(([key, child]) => findButtonStylePaths(child, `${path}.${key}`)),
  ];
}

/**
 * Return one plan per document that still stores a button style. The caller
 * must apply `unset(plan.paths)` with `ifRevisionId(plan._rev)`. Nothing else
 * on the document is touched.
 */
export function createRemoveButtonStylePlans(documents) {
  return documents.flatMap((document) => {
    if (!document?._id || !document?._rev) {
      throw new Error("A document must include _id and _rev");
    }
    const paths = Object.entries(document)
      .filter(([key]) => !key.startsWith("_"))
      .flatMap(([key, value]) => findButtonStylePaths(value, key));
    return paths.length ? [{ _id: document._id, _rev: document._rev, paths }] : [];
  });
}

const exportVerifiedBackup = (dataset) => {
  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const backup = resolve(backupDirectory, `${dataset}-${stamp}-remove-button-styles.tar.gz`);
  mkdirSync(backupDirectory, { recursive: true });
  execFileSync("pnpm", ["exec", "sanity", "datasets", "export", dataset, backup, "--raw"], {
    cwd: studioDirectory,
    stdio: "inherit",
  });
  execFileSync("gzip", ["-t", backup], { stdio: "inherit" });
  console.log(`Backup verified: ${backup}`);
};

// Buttons live in pages, the home page, settings, and rich text anywhere, so
// read every content document. Raw documents keep keys GROQ would drop.
async function fetchRawDocuments(client) {
  const ids = await client.fetch(
    `*[!(_type match "sanity.*") && !(_id in path("_.**"))] | order(_id asc)._id`,
    {},
    { perspective: "raw" },
  );
  const documents = [];
  for (let index = 0; index < ids.length; index += 100) {
    documents.push(...(await client.getDocuments(ids.slice(index, index + 100))));
  }
  return documents.filter(Boolean);
}

async function run() {
  const apply = process.argv.includes("--apply");
  const { getCliClient } = await import("sanity/cli");
  const client = getCliClient({ apiVersion: API_VERSION });
  const { dataset, projectId } = client.config();
  assertCacProductionTarget({ dataset, projectId });

  const plans = createRemoveButtonStylePlans(await fetchRawDocuments(client));
  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        projectId,
        dataset,
        documents: plans.length,
        drafts: plans.filter(({ _id }) => _id.startsWith("drafts.")).length,
        fields: plans.reduce((total, { paths }) => total + paths.length, 0),
        ids: plans.map(({ _id }) => _id),
      },
      null,
      2,
    ),
  );
  if (!apply || plans.length === 0) return;

  exportVerifiedBackup(dataset);

  const transaction = client.transaction();
  for (const plan of plans) {
    transaction.patch(plan._id, (patch) => patch.ifRevisionId(plan._rev).unset(plan.paths));
  }
  await transaction.commit({ visibility: "sync" });

  const remaining = createRemoveButtonStylePlans(await fetchRawDocuments(client));
  if (remaining.length > 0) {
    throw new Error(`Documents still with button styles: ${remaining.map(({ _id }) => _id).join(", ")}`);
  }
  console.log(`Removed button styles from ${plans.length} document(s).`);
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectRun) await run();
