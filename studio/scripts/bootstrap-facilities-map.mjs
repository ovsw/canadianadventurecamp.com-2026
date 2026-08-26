#!/usr/bin/env node

import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { getCliClient } from "sanity/cli";
import { assertCacProductionTarget } from "./assert-cac-production-target.mjs";

const APPLY = process.argv.includes("--apply");
const API_VERSION = "2026-03-23";
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));

const assets = [
  {
    id: "image-6314d3d94fb1c1159ced6b3412a8c0b032a05b65-1268x1074-jpg",
    path: resolve(SCRIPT_DIR, "../../frontend/prototype/uploads/map-restyled-mockup.jpg"),
    filename: "adventure-island-facilities-map.jpg",
  },
  {
    id: "image-646c22c68a934c70840abd41d5797c2740e31f22-1656x950-png",
    path: resolve(SCRIPT_DIR, "../../frontend/prototype/uploads/big-top-panorama (1).png"),
    filename: "big-top-aerials.png",
  },
  {
    id: "image-96cd4851a7648f704d1b5e7222056b5f3c61d0a4-800x800-avif",
    path: resolve(SCRIPT_DIR, "../../frontend/prototype/uploads/gym-facility.avif"),
    filename: "big-top-training-floor.avif",
  },
  {
    id: "image-14a658794b7aaf86dd1f0fcbd13c7085a827c35d-800x800-avif",
    path: resolve(SCRIPT_DIR, "../../frontend/prototype/uploads/facility-2.avif"),
    filename: "big-top-tumbling-floor.avif",
  },
];

const facilitySeeds = [
  {
    key: "canoes",
    name: "Canoes",
    description:
      "Canoes and kayaks in the quiet bay. Flat-water strokes today, around-the-island trips by August.",
    x: 27.5,
    y: 21.6,
    labelPosition: "auto",
    prominent: false,
  },
  {
    key: "cabins",
    name: "Cabins",
    description:
      "Home base. Open-concept cabins with a counsellor always within arm's reach.",
    x: 27.2,
    y: 40.9,
    labelPosition: "above",
    prominent: true,
  },
  {
    key: "play-area",
    name: "Play Area",
    description:
      "Open grass, swings and pickup games between periods. The unofficial hangout.",
    x: 30.5,
    y: 44,
    labelPosition: "left",
    prominent: false,
  },
  {
    key: "big-top",
    name: "The Big Top",
    description:
      "9,000 square feet of gymnastics, aerials and trampoline under one open-sided canopy.",
    x: 34.7,
    y: 33.6,
    labelPosition: "above",
    prominent: true,
  },
  {
    key: "hub",
    name: "The Hub",
    description:
      "Tuck shop, mail call and the noticeboard. Everyone swings past on the way to somewhere else.",
    x: 36.6,
    y: 43.2,
    labelPosition: "auto",
    prominent: false,
  },
  {
    key: "flintstone-field",
    name: "Flintstone Field",
    description:
      "The heart of camp. Every woodchip path crosses here a dozen times a day.",
    x: 37.7,
    y: 38.5,
    labelPosition: "left",
    prominent: true,
  },
  {
    key: "arts-and-crafts",
    name: "Arts & Crafts",
    description: "Paint, paracord and friendship bracelets by the hundred.",
    x: 42.4,
    y: 45,
    labelPosition: "right",
    prominent: false,
  },
  {
    key: "dining-hall",
    name: "Dining Hall",
    description:
      "Three meals a day and the loudest ten minutes of announcements on the island.",
    x: 45.3,
    y: 41.5,
    labelPosition: "above",
    prominent: false,
  },
  {
    key: "campfire-circle",
    name: "Campfire Circle",
    description:
      "Skits, songs and s'mores. Every session ends here, under the pines.",
    x: 40.8,
    y: 33.6,
    labelPosition: "above",
    prominent: false,
  },
  {
    key: "treehouse",
    name: "Treehouse",
    description: "A proper treehouse in the woods. Climb up, look out.",
    x: 45.7,
    y: 28.3,
    labelPosition: "above",
    prominent: false,
  },
  {
    key: "archery-range",
    name: "Archery Range",
    description:
      "Bullseyes optional, focus mandatory. Bows down when the horn sounds.",
    x: 53.5,
    y: 34,
    labelPosition: "auto",
    prominent: false,
  },
  {
    key: "low-ropes-course",
    name: "Low Ropes Course",
    description: "Balance, nerve and teamwork. One wobbly element at a time.",
    x: 56.3,
    y: 43,
    labelPosition: "auto",
    prominent: false,
  },
  {
    key: "tarzan-swing",
    name: "Tarzan Swing",
    description:
      "Hold tight, swing wide, let go. The scream is traditional.",
    x: 65,
    y: 48.1,
    labelPosition: "auto",
    prominent: false,
  },
  {
    key: "sandy-swim-beach",
    name: "Sandy Swim Beach",
    description:
      "Sandy bottom, shallow entry, in the main swimming area. Buddy checks every ten minutes.",
    x: 77.5,
    y: 47,
    labelPosition: "auto",
    prominent: false,
  },
  {
    key: "swim-dock",
    name: "Swim Dock",
    description:
      "The big dock complex has a diving board, swim lanes and the deep-water test.",
    x: 70,
    y: 32,
    labelPosition: "auto",
    prominent: false,
  },
  {
    key: "sailing-dock",
    name: "Sailing Dock",
    description:
      "Boats rigged and ready on the north shore. Wind lessons leave right after breakfast.",
    x: 56.1,
    y: 17.3,
    labelPosition: "auto",
    prominent: false,
  },
];

const heading = [
  {
    _key: "facilities-heading",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "facilities-heading-main",
        _type: "span",
        text: "State of the art,\n",
        marks: [],
      },
      {
        _key: "facilities-heading-accent",
        _type: "span",
        text: "on Adventure Island.",
        marks: ["em"],
      },
    ],
  },
];

const mapHeading = [
  {
    _key: "facilities-map-heading",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "facilities-map-heading-main",
        _type: "span",
        text: "Everything else is ",
        marks: [],
      },
      {
        _key: "facilities-map-heading-accent",
        _type: "span",
        text: "a wander away.",
        marks: ["em"],
      },
    ],
  },
];

const bigTopBody = [
  {
    _key: "big-top-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      { _key: "open", _type: "span", text: "Our open-sided ", marks: [] },
      {
        _key: "programs",
        _type: "span",
        text: "Gymnastics, Aerials and Trampoline Centre",
        marks: ["strong"],
      },
      {
        _key: "middle",
        _type: "span",
        text: " anchors the very centre of camp. Fully ",
        marks: [],
      },
      {
        _key: "upgrade",
        _type: "span",
        text: "upgraded in 2019",
        marks: ["strong"],
      },
      {
        _key: "close",
        _type: "span",
        text: ", it's the first place campers visit when they arrive on the island, and the last place they want to leave.",
        marks: [],
      },
    ],
  },
];

const gallery = [
  {
    _key: "big-top-aerials",
    _type: "image",
    asset: { _type: "reference", _ref: assets[1].id },
    alt: "Aerialists practicing inside the Big Top",
    caption: "INSIDE THE BIG TOP · AERIALS",
  },
  {
    _key: "big-top-training-floor",
    _type: "image",
    asset: { _type: "reference", _ref: assets[2].id },
    alt: "Gymnastics training floor inside the Big Top",
    caption: "THE TRAINING FLOOR · GYMNASTICS",
  },
  {
    _key: "big-top-tumbling",
    _type: "image",
    asset: { _type: "reference", _ref: assets[3].id },
    alt: "Tumbling and spring floor inside the Big Top",
    caption: "TUMBLING & SPRING FLOOR",
  },
];

function createSectionBlock() {
  return {
    _key: "facilities-map",
    _type: "facilitiesMapSection",
    eyebrow: "03 · THE FACILITIES",
    heading,
    introduction:
      "World-class training facilities don't usually come with a lake view. Ours do, and everything is a short woodchip path from everything else.",
    showBigTop: true,
    bigTopHeading: "The Big Top",
    bigTopArea: 9000,
    bigTopUnit: "sqft",
    bigTopTagline: "under one open-sided canopy",
    bigTopBody,
    bigTopGallery: gallery,
    bigTopGalleryAutoplay: true,
    mapHeading,
    mapLocationLabel: "ADVENTURE ISLAND · LAKE TEMAGAMI",
    stopLabel: "STOP",
  };
}

function comparableFacility(document) {
  return {
    name: document.name,
    description: document.description,
  };
}

async function ensureAssets(client) {
  for (const asset of assets) {
    await access(asset.path);
    const existing = await client.getDocument(asset.id);
    if (existing) continue;
    const uploaded = await client.assets.upload("image", createReadStream(asset.path), {
      filename: asset.filename,
    });
    if (uploaded._id !== asset.id) {
      throw new Error(
        `${asset.filename}: uploaded as ${uploaded._id}, expected ${asset.id}`,
      );
    }
  }
}

async function loadState(client) {
  const [facilities, facilitiesMap, homePage, homePageDraft] = await Promise.all([
    client.fetch(
      `*[_type == "facility"]{_id, _rev, name, description}`,
      {},
      { perspective: "raw" },
    ),
    client.fetch(
      `*[_id == "facilitiesMap"][0]`,
      {},
      { perspective: "raw" },
    ),
    client.fetch(
      `*[_id == "homePage" && _type == "homePage"][0]{_id, _rev, blocks}`,
      {},
      { perspective: "raw" },
    ),
    client.fetch(
      `*[_id == "drafts.homePage" && _type == "homePage"][0]{_id, _rev, blocks}`,
      {},
      { perspective: "raw" },
    ),
  ]);
  if (!homePage) throw new Error("Published homePage document not found");
  return { facilities, facilitiesMap, homePage, homePageDraft };
}

async function ensureFacilities(client, existingFacilities) {
  const byName = new Map();
  for (const facility of existingFacilities) {
    if (byName.has(facility.name)) {
      throw new Error(`Duplicate Facility name: ${facility.name}`);
    }
    byName.set(facility.name, facility);
  }

  const results = [];
  for (const seed of facilitySeeds) {
    const existing = byName.get(seed.name);
    const content = { name: seed.name, description: seed.description };
    if (existing) {
      if (!isDeepStrictEqual(comparableFacility(existing), content)) {
        throw new Error(`${seed.name}: existing Facility content differs`);
      }
      results.push({ ...seed, _id: existing._id });
      continue;
    }
    const created = await client.create({ _type: "facility", ...content });
    results.push({ ...seed, _id: created._id });
  }
  return results;
}

function createMapDocument(facilities) {
  return {
    _id: "facilitiesMap",
    _type: "facilitiesMap",
    title: "Facilities Map",
    mapImage: {
      _type: "image",
      asset: { _type: "reference", _ref: assets[0].id },
      alt: "Aerial map of Adventure Island on Lake Temagami",
    },
    websiteAutoplay: true,
    placements: facilities.map((facility) => ({
      _key: facility.key,
      _type: "facilityMapPlacement",
      facility: { _type: "reference", _ref: facility._id },
      x: facility.x,
      y: facility.y,
      labelPosition: facility.labelPosition,
      prominent: facility.prominent,
    })),
  };
}

const hasFacilitiesMapSection = (document) =>
  (document?.blocks ?? []).some(
    (block) => block?._type === "facilitiesMapSection",
  );

const facilitiesMapSectionNeedsLabels = (document) => {
  const section = (document?.blocks ?? []).find(
    (block) => block?._type === "facilitiesMapSection",
  );
  return Boolean(section && (!section.mapLocationLabel || !section.stopLabel));
};

async function ensureHomepageSection(client, document) {
  if (!document) return false;
  const section = (document.blocks ?? []).find(
    (block) => block?._type === "facilitiesMapSection",
  );
  const patch = client.patch(document._id).ifRevisionId(document._rev);

  if (!section) {
    await patch
      .setIfMissing({ blocks: [] })
      .append("blocks", [createSectionBlock()])
      .commit({ visibility: "sync" });
    return true;
  }

  const missingLabels = {};
  if (!section.mapLocationLabel) {
    missingLabels[
      `blocks[_key=="${section._key}"].mapLocationLabel`
    ] = "ADVENTURE ISLAND · LAKE TEMAGAMI";
  }
  if (!section.stopLabel) {
    missingLabels[`blocks[_key=="${section._key}"].stopLabel`] = "STOP";
  }
  if (!Object.keys(missingLabels).length) return false;

  await patch.setIfMissing(missingLabels).commit({ visibility: "sync" });
  return true;
}

async function run() {
  const client = getCliClient({ apiVersion: API_VERSION, perspective: "raw" });
  const { dataset, projectId } = client.config();
  assertCacProductionTarget({ dataset, projectId });
  const state = await loadState(client);
  const publishedHasSection = hasFacilitiesMapSection(state.homePage);
  const draftHasSection = hasFacilitiesMapSection(state.homePageDraft);

  console.log(
    JSON.stringify(
      {
        mode: APPLY ? "apply" : "dry-run",
        projectId,
        dataset,
        facilitiesToCreate: facilitySeeds.filter(
          (seed) =>
            !state.facilities.some((facility) => facility.name === seed.name),
        ).length,
        facilityNames: facilitySeeds.map(({ name }) => name),
        assetsToUpload: assets.map(({ id, filename }) => ({ id, filename })),
        createFacilitiesMap: !state.facilitiesMap,
        appendHomepageSection: {
          draft: Boolean(state.homePageDraft && !draftHasSection),
          published: !publishedHasSection,
        },
        updateHomepageSectionLabels: {
          draft: facilitiesMapSectionNeedsLabels(state.homePageDraft),
          published: facilitiesMapSectionNeedsLabels(state.homePage),
        },
      },
      null,
      2,
    ),
  );

  if (!APPLY) return;
  await ensureAssets(client);
  const facilities = await ensureFacilities(client, state.facilities);
  if (!state.facilitiesMap) {
    await client.create(createMapDocument(facilities));
  }
  await ensureHomepageSection(client, state.homePage);
  await ensureHomepageSection(client, state.homePageDraft);

  const final = await loadState(client);
  if (
    !facilitySeeds.every((seed) =>
      final.facilities.some((facility) => facility.name === seed.name),
    )
  ) {
    throw new Error("One or more seeded Facilities failed post-write audit");
  }
  if (!final.facilitiesMap || final.facilitiesMap.placements?.length !== facilitySeeds.length) {
    throw new Error("Facilities Map singleton failed post-write audit");
  }
  const finalPublishedSection = (final.homePage.blocks ?? []).find(
    (block) => block?._type === "facilitiesMapSection",
  );
  const finalDraftSection = (final.homePageDraft?.blocks ?? []).find(
    (block) => block?._type === "facilitiesMapSection",
  );
  if (
    !finalPublishedSection ||
    !isDeepStrictEqual(finalPublishedSection, createSectionBlock())
  ) {
    throw new Error("Homepage Facilities Map section failed post-write audit");
  }
  if (final.homePageDraft && !finalDraftSection) {
    throw new Error("Homepage draft Facilities Map section failed post-write audit");
  }
  console.log("Facilities Map data is present on the published homepage and its draft.");
}

await run();
