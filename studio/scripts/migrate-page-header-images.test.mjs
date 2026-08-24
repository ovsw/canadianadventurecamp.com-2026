import assert from "node:assert/strict";
import test from "node:test";
import { createHeaderImageMigrationPlan } from "./migrate-page-header-images.mjs";

const asset = {
  _type: "reference",
  _ref: "image-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-1200x800-jpg",
};

test("moves legacy header image data to a root Sanity image", () => {
  const plan = createHeaderImageMigrationPlan({
    _id: "about",
    _rev: "rev",
    legacyHeaderImage: {
      _type: "mainImage",
      alt: "Camp island",
      caption: "Lake view",
      asset,
      crop: { _type: "sanity.imageCrop", bottom: 0, left: 0, right: 0, top: 0 },
      hotspot: {
        _type: "sanity.imageHotspot",
        height: 0.5,
        width: 0.5,
        x: 0.5,
        y: 0.5,
      },
    },
  });

  assert.equal(plan.needsSet, true);
  assert.deepEqual(plan.headerImage, {
    _type: "image",
    alt: "Camp island",
    caption: "Lake view",
    asset,
    crop: { _type: "sanity.imageCrop", bottom: 0, left: 0, right: 0, top: 0 },
    hotspot: {
      _type: "sanity.imageHotspot",
      height: 0.5,
      width: 0.5,
      x: 0.5,
      y: 0.5,
    },
  });
});

test("only unsets legacy data when the root image already matches", () => {
  const page = {
    _id: "about",
    _rev: "rev",
    headerImage: { _type: "image", asset },
    legacyHeaderImage: { _type: "mainImage", asset },
  };

  const plan = createHeaderImageMigrationPlan(page);

  assert.equal(plan.needsSet, false);
  assert.deepEqual(plan.headerImage, { _type: "image", asset });
});

test("refuses to overwrite a different root header image", () => {
  assert.throws(
    () =>
      createHeaderImageMigrationPlan({
        _id: "about",
        _rev: "rev",
        headerImage: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: "image-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb-1200x800-jpg",
          },
        },
        legacyHeaderImage: { _type: "mainImage", asset },
      }),
    /root headerImage already has a different value/,
  );
});
