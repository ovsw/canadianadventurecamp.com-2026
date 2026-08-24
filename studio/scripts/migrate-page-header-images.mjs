#!/usr/bin/env node

import process from "node:process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { getCliClient } from "sanity/cli";

const APPLY = process.argv.includes("--apply");
const API_VERSION = "2026-03-23";
const EXPECTED_DATASET = "production";
const EXPECTED_PROJECT_ID = "bf76qlx9";
const LEGACY_PATH = "migration.legacy.content.headerImage";

function normalizeHeaderImage(value, documentId) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${documentId}: legacy header image is not an object`);
  }

  const { _type, ...image } = value;
  if (
    !image.asset ||
    typeof image.asset !== "object" ||
    typeof image.asset._ref !== "string"
  ) {
    throw new Error(`${documentId}: legacy header image has no asset._ref`);
  }

  return { _type: "image", ...image };
}

export function createHeaderImageMigrationPlan(page) {
  const headerImage = normalizeHeaderImage(page.legacyHeaderImage, page._id);
  const existingHeaderImage = page.headerImage
    ? normalizeHeaderImage(page.headerImage, page._id)
    : undefined;

  if (
    existingHeaderImage &&
    !isDeepStrictEqual(existingHeaderImage, headerImage)
  ) {
    throw new Error(`${page._id}: root headerImage already has a different value`);
  }

  return {
    _id: page._id,
    _rev: page._rev,
    headerImage,
    needsSet: !existingHeaderImage,
  };
}

async function run() {
  const client = getCliClient({ apiVersion: API_VERSION });
  const { dataset, projectId } = client.config();

  if (projectId !== EXPECTED_PROJECT_ID) {
    throw new Error(`Expected project ${EXPECTED_PROJECT_ID}, received ${projectId}`);
  }
  if (dataset !== EXPECTED_DATASET) {
    throw new Error(`Expected ${EXPECTED_DATASET} dataset, received ${dataset}`);
  }

  const pages = await client.fetch(
    `*[
      _type == "page" &&
      defined(migration.legacy.content.headerImage.asset._ref)
    ] | order(_id asc) {
      _id,
      _rev,
      title,
      "slug": slug.current,
      headerImage,
      "legacyHeaderImage": migration.legacy.content.headerImage
    }`,
    {},
    { perspective: "raw" },
  );
  const plans = pages.map(createHeaderImageMigrationPlan);

  console.log(
    JSON.stringify(
      {
        mode: APPLY ? "apply" : "dry-run",
        projectId,
        dataset,
        documents: plans.length,
        setRootHeaderImage: plans.filter(({ needsSet }) => needsSet).length,
        unsetLegacyHeaderImage: plans.length,
        ids: plans.map(({ _id }) => _id),
      },
      null,
      2,
    ),
  );

  if (!APPLY || plans.length === 0) return;

  for (let index = 0; index < plans.length; index += 20) {
    let transaction = client.transaction();
    for (const plan of plans.slice(index, index + 20)) {
      let patch = client.patch(plan._id).ifRevisionId(plan._rev);
      if (plan.needsSet) patch = patch.set({ headerImage: plan.headerImage });
      transaction = transaction.patch(patch.unset([LEGACY_PATH]));
    }
    await transaction.commit({ visibility: "sync" });
  }

  const finalPages = await client.fetch(
    `*[_id in $ids] | order(_id asc) {
      _id,
      headerImage,
      "hasLegacyHeaderImage": defined(migration.legacy.content.headerImage)
    }`,
    { ids: plans.map(({ _id }) => _id) },
    { perspective: "raw" },
  );
  const finalById = new Map(finalPages.map((page) => [page._id, page]));

  for (const plan of plans) {
    const finalPage = finalById.get(plan._id);
    if (!finalPage) throw new Error(`${plan._id}: missing after migration`);
    if (finalPage.hasLegacyHeaderImage) {
      throw new Error(`${plan._id}: legacy header image still exists`);
    }
    if (!isDeepStrictEqual(finalPage.headerImage, plan.headerImage)) {
      throw new Error(`${plan._id}: root headerImage differs from migration plan`);
    }
  }

  console.log(`Migrated ${plans.length} page header images.`);
}

const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectRun) await run();
