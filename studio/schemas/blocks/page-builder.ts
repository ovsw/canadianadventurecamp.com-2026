import { defineField } from "sanity";

export const generalPageBuilderBlockTypes = [
  "hero",
  "homeHero",
  "richTextBlock",
  "benefitCards",
  "storyFeature",
  "latestArticles",
  "faqAccordion",
  "teamMembers",
  "ctaBanner",
] as const;

export const contentPageBuilderBlockTypes = [
  "richTextBlock",
  "benefitCards",
  "storyFeature",
  "latestArticles",
  "faqAccordion",
  "teamMembers",
  "ctaBanner",
] as const;

export const pageBuilderBlockTypes = generalPageBuilderBlockTypes;
export const homePagePageBuilderBlockTypes = generalPageBuilderBlockTypes;

type PageBuilderBlockType = (typeof generalPageBuilderBlockTypes)[number];

function validateBlocks(
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
        views: [{ name: "list" }],
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
