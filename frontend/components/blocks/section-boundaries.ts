import { stegaClean } from "next-sanity";
import { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";

/**
 * Section boundary resolver.
 *
 * Walks a page's block list once on the server and decides, for each
 * section, whether its top and bottom meet the neighbour at a seam (same
 * resolved background, nothing tucks, no hero above) or at an edge. The
 * global stylesheet maps the resulting boolean data attributes to the
 * `--section-pad-top` / `--section-pad-bottom` custom properties that the
 * `py-section` utility reads. This module never reads the DOM.
 */

export type Block =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

/** The three values editors can pick in Studio. */
export type EditorBackground = "white" | "cream" | "green";

/** Editor values plus the two backgrounds only the trait table can assign. */
export type SectionBackground = EditorBackground | "night" | "photo";

export type SectionTrait = {
  /** Fixed background. When set, the editor field is ignored for this type. */
  background?: SectionBackground;
  /**
   * Rounded-top section that overlaps the section above by
   * `--section-overlap`. It only tucks when its background differs from the
   * section above; on a matching background the curve is invisible, so the
   * two meet at a seam instead.
   */
  tuck?: boolean;
  /** Full-bleed hero. The boundary below a hero is always an edge. */
  hero?: boolean;
};

/**
 * Static trait table. `Record` (not `Partial`) so that a new block type in
 * the union fails typecheck until it gets an entry here.
 *
 * Heroes are declared `photo`: `homeHero` and `innerHero` always render a
 * photo, and `hero` renders a photo when one is set and a pine-night glow
 * otherwise. Because a hero forces an edge below it regardless, the exact
 * value never changes a boundary; `photo` records what the design intends.
 */
export const sectionTraits: Record<Block["_type"], SectionTrait> = {
  activityCatalogue: {},
  activitySchedule: {},
  benefitCards: {},
  bigImageList: {},
  ctaBanner: { tuck: true },
  datesRatesSection: { tuck: true },
  directorCta: { tuck: true },
  facilitiesMapSection: { background: "night", tuck: true },
  faqAccordion: {},
  featureCards: { tuck: true },
  hero: { background: "photo", hero: true },
  homeHero: { background: "photo", hero: true },
  imageCollageFeature: {},
  includedExtras: {},
  innerHero: { background: "photo", hero: true },
  internationalCampersSection: { background: "night", tuck: true },
  journey: {},
  largeSlides: {},
  latestArticles: {},
  packingChecklist: {},
  richTextBlock: {},
  stackedFeatureRows: {},
  stackedTimeline: {},
  storyFeature: {},
  teamMembers: {},
  testimonials: {},

};

export type SectionBoundary = {
  background: SectionBackground;
  /** Top meets the section above at a seam (half rhythm). */
  seamTop: boolean;
  /** Bottom meets the section below at a seam (half rhythm). */
  seamBottom: boolean;
  /** This section overlaps the one above. */
  tuck: boolean;
  /** The next section (or the footer) tucks under this one's bottom edge. */
  tuckBelow: boolean;
};

/**
 * Block types with a fixed background in the trait table. The GROQ projection
 * omits `background` for these, so the type guard below has to exclude them
 * by `_type`; keep this list and the table's `background` entries in step.
 */
type FixedBackgroundType =
  | "hero"
  | "homeHero"
  | "innerHero"
  | "facilitiesMapSection"
  | "internationalCampersSection";

/** Blocks whose GROQ projection carries the editor `background` field. */
export type EditorBackgroundBlock = Exclude<Block, { _type: FixedBackgroundType }>;

export function hasEditorBackground(block: Block): block is EditorBackgroundBlock {
  return sectionTraits[block._type].background === undefined;
}

export function isEditorBackground(
  background: SectionBackground,
): background is EditorBackground {
  return background === "white" || background === "cream" || background === "green";
}

/**
 * Editor-chosen background with the legacy fallback ladder for documents
 * that predate the `background` field. A final Green section renders as
 * Cream so the page does not end on green against the night footer.
 */
export function resolveEditorBackground(block: Block, isFinal: boolean): EditorBackground {
  const background = "background" in block ? stegaClean(block.background) : undefined;
  if (background === "cream" || background === "green" || background === "white") {
    return isFinal && background === "green" ? "cream" : background;
  }

  const legacyBlock = block as Block & { useCreamBackground?: boolean | null; variant?: string | null };
  const cream = legacyBlock.useCreamBackground === true;
  const legacyBackground: EditorBackground =
    block._type === "teamMembers"
      ? cream
        ? "cream"
        : "white"
      : block._type === "faqAccordion"
        ? legacyBlock.useCreamBackground === false
          ? "green"
          : "cream"
        : ["benefitCards", "storyFeature", "featureCards", "stackedTimeline"].includes(block._type)
          ? cream
            ? "cream"
            : "green"
          : block._type === "ctaBanner"
            ? stegaClean(legacyBlock.variant) === "nudge"
              ? "white"
              : "green"
            : [
                  "activitySchedule",
                  "activityCatalogue",
                  "bigImageList",
                  "directorCta",
                  "journey",
                  "largeSlides",
                  "packingChecklist",
                ].includes(block._type)
              ? "green"
              : [
                    "datesRatesSection",
                    "imageCollageFeature",
                    "includedExtras",
                    "stackedFeatureRows",
                  ].includes(block._type)
                ? "cream"
                : "white";

  return isFinal && legacyBackground === "green" ? "cream" : legacyBackground;
}

export function resolveSectionBackground(block: Block, isFinal: boolean): SectionBackground {
  return sectionTraits[block._type].background ?? resolveEditorBackground(block, isFinal);
}

/**
 * Rules:
 * - the first section's top is an edge;
 * - a tucker tucks only when its background differs from the section above;
 * - two neighbours meet at a seam when they resolve to the same background
 *   and the upper one is not a hero;
 * - the last section's bottom is an edge, and the footer tucks under it.
 */
export function resolveSectionBoundaries(blocks: readonly Block[]): SectionBoundary[] {
  const sections = blocks.map((block, index) => {
    const trait = sectionTraits[block._type];
    return {
      background: resolveSectionBackground(block, index === blocks.length - 1),
      tucker: trait.tuck === true,
      hero: trait.hero === true,
    };
  });
  const tucks = sections.map(
    (section, index) =>
      section.tucker && index > 0 && sections[index - 1].background !== section.background,
  );

  return sections.map((section, index) => {
    const above = sections[index - 1];
    const below = sections[index + 1];
    const seamTop =
      above !== undefined && !above.hero && above.background === section.background;
    const seamBottom =
      below !== undefined && !section.hero && below.background === section.background;
    return {
      background: section.background,
      seamTop,
      seamBottom,
      tuck: tucks[index],
      tuckBelow: below === undefined || tucks[index + 1],
    };
  });
}
