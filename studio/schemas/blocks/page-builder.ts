import { defineField } from "sanity";

export const contentPageBuilderBlockTypes = [
  "richTextBlock",
  "benefitCards",
  "storyFeature",
  "imageCollageFeature",
  "featureCards",
  "activitySchedule",
  "facilitiesMapSection",
  "datesRatesSection",
  "stackedFeatureRows",
  "internationalCampersSection",
  "latestArticles",
  "faqAccordion",
  "teamMembers",
  "ctaBanner",
  // page-builder-generator:content-types
] as const;

const generalOnlyPageBuilderBlockTypes = [
  // page-builder-generator:general-types
] as const;

const homeOnlyPageBuilderBlockTypes = [
  "homeHero",
  // page-builder-generator:home-types
] as const;

export const generalPageBuilderBlockTypes = [
  "hero",
  ...generalOnlyPageBuilderBlockTypes,
  ...contentPageBuilderBlockTypes,
] as const;

export const pageBuilderBlockTypes = generalPageBuilderBlockTypes;
export const homePagePageBuilderBlockTypes = [
  "hero",
  ...homeOnlyPageBuilderBlockTypes,
  ...contentPageBuilderBlockTypes,
] as const;

type PageBuilderBlockType =
  | (typeof generalPageBuilderBlockTypes)[number]
  | (typeof homePagePageBuilderBlockTypes)[number];

const pageBuilderPreviewBlockTypes = new Set<PageBuilderBlockType>([
  "homeHero",
  "richTextBlock",
  "benefitCards",
  "storyFeature",
  "imageCollageFeature",
  "featureCards",
  "activitySchedule",
  "facilitiesMapSection",
  "datesRatesSection",
  "stackedFeatureRows",
  "latestArticles",
  "faqAccordion",
  "teamMembers",
  "ctaBanner",
  // page-builder-generator:preview-types
]);

export function getPageBuilderPreviewImageUrl(schemaTypeName: string) {
  return pageBuilderPreviewBlockTypes.has(schemaTypeName as PageBuilderBlockType)
    ? `/static/images/preview/${schemaTypeName}.jpg`
    : undefined;
}

export function validateBlocks(
  blocks: Array<{ _type?: string }> | undefined,
): true | string {
  const heroTypes = new Set(["hero", "homeHero"]);
  const heroIndexes = (blocks ?? []).flatMap((block, index) =>
    heroTypes.has(block?._type ?? "") ? [index] : [],
  );
  if (heroIndexes.length > 1) return "Add no more than one Hero section";
  if (heroIndexes.length === 1 && heroIndexes[0] !== 0) {
    return "The Hero section must be the first section";
  }
  const faqCount =
    blocks?.filter((block) => block?._type === "faqAccordion").length ?? 0;
  if (faqCount > 1) return "Add no more than one FAQ section";
  const teamCount =
    blocks?.filter((block) => block?._type === "teamMembers").length ?? 0;
  if (teamCount > 1) return "Add no more than one Team Members section";
  return true;
}

function createBlocksField(blockTypes: readonly PageBuilderBlockType[]) {
  const heroTypeNames = new Set(["hero", "homeHero"]);
  const heroTypes = blockTypes.filter((type) => heroTypeNames.has(type));
  const contentTypes = blockTypes.filter((type) => !heroTypeNames.has(type));

  return defineField({
    name: "blocks",
    title: "Page sections",
    type: "array",
    group: "content",
    of: blockTypes.map((type) => ({ type })),
    validation: (rule) => rule.custom(validateBlocks),
    options: {
      insertMenu: {
        groups: [
          { name: "hero", title: "Hero", of: heroTypes },
          { name: "content", title: "Content", of: contentTypes },
        ],
        views: [
          { name: "list" },
          {
            name: "grid",
            previewImageUrl: getPageBuilderPreviewImageUrl,
          },
        ],
      },
    },
  });
}

export const blocksField = createBlocksField(generalPageBuilderBlockTypes);
export const contentBlocksField = createBlocksField(
  contentPageBuilderBlockTypes,
);
export const homePageBlocksField = createBlocksField(
  homePagePageBuilderBlockTypes,
);
