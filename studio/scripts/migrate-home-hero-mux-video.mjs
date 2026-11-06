#!/usr/bin/env node
// Move the home hero's background video from a pasted mp4 link (videoUrl)
// to a Mux video picked in Studio (video: mux.video).
//
// 1. Imports the Mux asset into the dataset as a `mux.videoAsset` document,
//    in the same shape the plugin's "Import from Mux" button writes. Skipped
//    when a document for that Mux asset already exists.
// 2. Writes the change to the home page DRAFT: sets the hero's `video`
//    reference and removes `videoUrl`. The published document is untouched.
//
// Needs CAC_MUX_TOKEN_ID and CAC_MUX_TOKEN_SECRET in the environment.
//
// Dry run (default):  node --env-file=.env.local scripts/migrate-home-hero-mux-video.mjs
// Apply:              add --apply

import { randomUUID } from "node:crypto";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { createClient } from "@sanity/client";
import { assertCacProductionTarget } from "./assert-cac-production-target.mjs";

const API_VERSION = "2026-03-23";
const MUX_ASSET_ID = "HgQv2RAvevwPkdGShAQY00lMKUZuhgu7h2i4BUy3POiY";
const FILENAME = "cac-new-intro-2024-2025.mp4";
const HOME_ID = "homePage";
const DRAFT_ID = `drafts.${HOME_ID}`;

const apply = process.argv.includes("--apply");

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

async function fetchMuxAsset(assetId) {
  const auth = Buffer.from(
    `${requireEnv("CAC_MUX_TOKEN_ID")}:${requireEnv("CAC_MUX_TOKEN_SECRET")}`,
  ).toString("base64");
  const response = await fetch(
    `https://api.mux.com/video/v1/assets/${assetId}`,
    { headers: { Authorization: `Basic ${auth}` } },
  );
  if (!response.ok) {
    throw new Error(`Mux asset ${assetId}: HTTP ${response.status}`);
  }
  return (await response.json()).data;
}

/** Same shape as the plugin's muxAssetToSanityDocument(). */
export function muxAssetToSanityDocument(asset, filename, id = randomUUID()) {
  const playbackId = (asset.playback_ids ?? []).find(
    (playback) => playback.policy === "public",
  )?.id;
  if (!playbackId) throw new Error(`Mux asset ${asset.id} has no public playback ID`);
  return {
    _id: id,
    _type: "mux.videoAsset",
    assetId: asset.id,
    playbackId,
    filename,
    status: asset.status,
    data: asset,
  };
}

/** Returns the home doc with the hero moved to the Mux reference. */
export function withMuxHeroVideo(doc, videoAssetId) {
  let found = false;
  const blocks = (doc.blocks ?? []).map((block) => {
    if (block._type !== "homeHero") return block;
    found = true;
    const rest = { ...block };
    delete rest.videoUrl;
    return {
      ...rest,
      video: {
        _type: "mux.video",
        asset: { _type: "reference", _weak: true, _ref: videoAssetId },
      },
    };
  });
  if (!found) throw new Error(`${doc._id} has no homeHero block`);
  return { ...doc, blocks };
}

async function run() {
  const projectId = requireEnv("SANITY_STUDIO_PROJECT_ID");
  const dataset = requireEnv("SANITY_STUDIO_DATASET");
  assertCacProductionTarget({ projectId, dataset });

  const client = createClient({
    projectId,
    dataset,
    apiVersion: API_VERSION,
    token: requireEnv("SANITY_AUTH_TOKEN"),
    useCdn: false,
    perspective: "raw",
  });

  const asset = await fetchMuxAsset(MUX_ASSET_ID);
  if (asset.status !== "ready") throw new Error(`Mux asset is ${asset.status}`);

  const existing = await client.fetch(
    `*[_type == "mux.videoAsset" && assetId == $assetId][0]{_id}`,
    { assetId: MUX_ASSET_ID },
  );
  const videoDoc = existing
    ? null
    : muxAssetToSanityDocument(asset, FILENAME);
  const videoAssetId = existing?._id ?? videoDoc._id;

  const [published, draft] = await Promise.all([
    client.getDocument(HOME_ID),
    client.getDocument(DRAFT_ID),
  ]);
  const base = draft ?? published;
  if (!base) throw new Error("homePage not found");
  const next = withMuxHeroVideo({ ...base, _id: DRAFT_ID }, videoAssetId);

  console.log(
    JSON.stringify(
      {
        apply,
        videoAsset: existing ? `exists ${videoAssetId}` : `create ${videoAssetId}`,
        homeDraft: draft ? `patch ${DRAFT_ID} (rev ${draft._rev})` : `create ${DRAFT_ID} from published`,
        hero: next.blocks.find((block) => block._type === "homeHero").video,
      },
      null,
      2,
    ),
  );
  if (!apply) return;

  const transaction = client.transaction();
  if (videoDoc) transaction.createIfNotExists(videoDoc);
  const draftBody = { ...next };
  for (const field of ["_rev", "_createdAt", "_updatedAt"]) delete draftBody[field];
  if (draft) {
    transaction.patch(DRAFT_ID, (patch) =>
      patch.ifRevisionId(draft._rev).set({ blocks: draftBody.blocks }),
    );
  } else {
    transaction.create(draftBody);
  }
  const result = await transaction.commit();
  console.log("Committed transaction", result.transactionId);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
