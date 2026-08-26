import assert from "node:assert/strict";
import test from "node:test";

import {
  blocksField,
  contentBlocksField,
  contentPageBuilderBlockTypes,
  homePageBlocksField,
  homePagePageBuilderBlockTypes,
  getPageBuilderPreviewImageUrl,
  pageBuilderBlockTypes,
} from "./schemas/blocks/page-builder.ts";
import {
  singletonDocumentActions,
  singletonDocumentTypes,
} from "./singletons.ts";

test("the shared blocks field exactly matches its authoritative inventory", () => {
  assert.deepEqual(
    blocksField.of.filter(({ hidden }) => !hidden).map(({ type }) => type),
    [...pageBuilderBlockTypes],
  );
  assert.deepEqual([...pageBuilderBlockTypes], [
    "hero",
    "richTextBlock",
    "benefitCards",
    "storyFeature",
    "imageCollageFeature",
    "featureCards",
    "activitySchedule",
    "facilitiesMapSection",
    "latestArticles",
    "faqAccordion",
    "teamMembers",
    "ctaBanner",
  ]);
  assert.equal(blocksField.of.some(({ hidden }) => hidden), false);
  assert.equal(new Set(pageBuilderBlockTypes).size, pageBuilderBlockTypes.length);
});

test("the homepage alone offers the homepage hero", () => {
  assert.deepEqual(
    homePageBlocksField.of.filter(({ hidden }) => !hidden).map(({ type }) => type),
    [...homePagePageBuilderBlockTypes],
  );
  assert.equal(homePagePageBuilderBlockTypes.includes("homeHero"), true);
  assert.equal(pageBuilderBlockTypes.includes("homeHero"), false);
});

test("the blocks insert menu offers list and grid views with known previews", () => {
  assert.deepEqual(
    blocksField.options.insertMenu.views.map(({ name }) => name),
    ["list", "grid"],
  );
  assert.equal(
    getPageBuilderPreviewImageUrl("featureCards"),
    "/static/images/preview/featureCards.jpg",
  );
  assert.equal(
    getPageBuilderPreviewImageUrl("activitySchedule"),
    "/static/images/preview/activitySchedule.jpg",
  );
  assert.equal(getPageBuilderPreviewImageUrl("hero"), undefined);
});

test("blogIndex uses the singleton configuration", () => {
  assert.deepEqual(
    contentBlocksField.of
      .filter(({ hidden }) => !hidden)
      .map(({ type }) => type),
    [...contentPageBuilderBlockTypes],
  );
  assert.equal(contentPageBuilderBlockTypes.includes("hero"), false);
  assert.equal(singletonDocumentTypes.has("blogIndex"), true);
  assert.equal(singletonDocumentTypes.has("facilitiesMap"), true);
  assert.equal(singletonDocumentActions.has("duplicate"), false);
  assert.equal(singletonDocumentActions.has("delete"), false);
});
