import {
  type Block,
  hasEditorBackground,
  isEditorBackground,
  resolveSectionBoundaries,
} from "@/components/blocks/section-boundaries";
import { type LivePerspective } from "next-sanity/live";
import { createDataAttribute } from "next-sanity";
import LatestArticles from "@/components/blocks/latest-articles";
import FaqAccordion from "@/components/blocks/faq-accordion";
import StoryFeature from "@/components/blocks/story-feature";
import TeamMembers from "@/components/blocks/team-members";
import RichTextBlock from "@/components/blocks/rich-text-block";
import CtaBanner from "@/components/blocks/cta-banner";
import BenefitCards from "@/components/blocks/benefit-cards";
import Hero from "@/components/blocks/hero";
import HomeHero from "@/components/blocks/home-hero";
import ImageCollageFeature from "@/components/blocks/image-collage-feature";
import FeatureCards from "@/components/blocks/feature-cards";
import ActivitySchedule from "@/components/blocks/activity-schedule";
import FacilitiesMapSection from "@/components/blocks/facilities-map-section";
import DatesRatesSection from "@/components/blocks/dates-rates-section";
import StackedFeatureRows from "@/components/blocks/stacked-feature-rows";
import InnerHero from "@/components/blocks/inner-hero";
import Testimonials from "@/components/blocks/testimonials";
import Journey from "@/components/blocks/journey";
import StackedTimeline from "@/components/blocks/stacked-timeline";
import ActivityCatalogue from "@/components/blocks/activity-catalogue";
import IncludedExtras from "@/components/blocks/included-extras";
import PackingChecklist from "@/components/blocks/packing-checklist";
import BigImageList from "@/components/blocks/big-image-list";
import DirectorCta from "@/components/blocks/director-cta";
import LargeSlides from "@/components/blocks/large-slides";
// page-builder-generator:component-imports
import InternationalCampersSection from "@/components/blocks/international-campers-section";
import { dataset, projectId } from "@/sanity/lib/env";

type BlockEditingProps = {
  dataAttribute?: (path: string) => string | undefined;
  memberDataAttribute?: (
    documentId: string,
    path: string,
  ) => string | undefined;
  activityDataAttribute?: (
    documentId: string,
    path: string,
  ) => string | undefined;
  facilityDataAttribute?: (
    documentId: string,
    path: string,
  ) => string | undefined;
  mapDataAttribute?: (path: string) => string | undefined;
  seasonDataAttribute?: (
    documentId: string,
    path: string,
  ) => string | undefined;
  testimonialDataAttribute?: (
    documentId: string,
    path: string,
  ) => string | undefined;
};

const serverFieldEditingBlockTypes = new Set<Block["_type"]>([
  "faqAccordion",
  "storyFeature",
  "teamMembers",
  "richTextBlock",
  "ctaBanner",
  "benefitCards",
  "hero",
  "homeHero",
  "imageCollageFeature",
  "featureCards",
  "activitySchedule",
  "facilitiesMapSection",
  "datesRatesSection",
  "stackedFeatureRows",
  "innerHero",
  "journey",
  "testimonials",
  "stackedTimeline",
  "activityCatalogue",
  "includedExtras",
  "packingChecklist",
  "bigImageList",
  "directorCta",
  "largeSlides",
  // page-builder-generator:editing-types
  "internationalCampersSection",
]);

const componentMap: Partial<{
  [K in Block["_type"]]: React.ComponentType<
    Extract<Block, { _type: K }> & BlockEditingProps
  >;
}> = {
  latestArticles: LatestArticles,
  faqAccordion: FaqAccordion,
  storyFeature: StoryFeature,
  teamMembers: TeamMembers,
  richTextBlock: RichTextBlock,
  ctaBanner: CtaBanner,
  benefitCards: BenefitCards,
  hero: Hero,
  homeHero: HomeHero,
  imageCollageFeature: ImageCollageFeature,
  featureCards: FeatureCards,
  activitySchedule: ActivitySchedule,
  facilitiesMapSection: FacilitiesMapSection,
  datesRatesSection: DatesRatesSection,
  stackedFeatureRows: StackedFeatureRows,
  innerHero: InnerHero,
  testimonials: Testimonials,
  journey: Journey,
  stackedTimeline: StackedTimeline,
  activityCatalogue: ActivityCatalogue,
  includedExtras: IncludedExtras,
  packingChecklist: PackingChecklist,
  bigImageList: BigImageList,
  directorCta: DirectorCta,
  largeSlides: LargeSlides,
  // page-builder-generator:component-map
  internationalCampersSection: InternationalCampersSection,
};

export default function Blocks({
  blocks,
  documentId,
  documentType = "page",
  stega,
}: {
  blocks: Block[];
  documentId: string;
  documentType?: "blogIndex" | "homePage" | "page";
  perspective: LivePerspective;
  stega: boolean;
}) {
  // A stored block whose type has no renderer (a removed section type) is
  // skipped. Drop it before resolving boundaries so its neighbours meet
  // as if it were not there and the trait table is never read for it.
  const sections = (blocks ?? []).filter((block) => block._type in componentMap);
  const boundaries = resolveSectionBoundaries(sections);

  return (
    <>
      {sections.map((block, index) => {
        const Component = componentMap[block._type] as React.ComponentType<
          Block & BlockEditingProps
        >;

        const blockPath = `blocks[_key=="${block._key}"]`;
        const dataSanity = stega
          ? createDataAttribute({
              baseUrl: process.env.NEXT_PUBLIC_STUDIO_URL || "http://localhost:3333",
              dataset,
              id: documentId,
              path: blockPath,
              projectId,
              type: documentType,
            }).toString()
          : undefined;
        const dataAttribute = stega
          ? (path: string) =>
              createDataAttribute({
                baseUrl: process.env.NEXT_PUBLIC_STUDIO_URL || "http://localhost:3333",
                dataset,
                id: documentId,
                path: `${blockPath}.${path}`,
                projectId,
                type: documentType,
              }).toString()
          : undefined;
        const boundary = boundaries[index];
        // Fixed-background sections (heroes, night sections) render their own
        // colour and the query does not project `background` for them; every
        // other section receives the resolved editor background.
        const themedBlock: Block =
          hasEditorBackground(block) && isEditorBackground(boundary.background)
            ? { ...block, background: boundary.background }
            : block;
        const editingProps: BlockEditingProps =
          block._type === "teamMembers"
              ? {
                  dataAttribute,
                  memberDataAttribute: stega
                    ? (memberId: string, path: string) =>
                        createDataAttribute({
                          baseUrl:
                            process.env.NEXT_PUBLIC_STUDIO_URL ||
                            "http://localhost:3333",
                          dataset,
                          id: memberId,
                          path,
                          projectId,
                          type: "teamMember",
                        }).toString()
                    : undefined,
                }
              : block._type === "activitySchedule" ||
                  block._type === "activityCatalogue"
                ? {
                    dataAttribute,
                    activityDataAttribute: stega
                      ? (activityId: string, path: string) =>
                          createDataAttribute({
                            baseUrl:
                              process.env.NEXT_PUBLIC_STUDIO_URL ||
                              "http://localhost:3333",
                            dataset,
                            id: activityId,
                            path,
                            projectId,
                            type: "activity",
                          }).toString()
                      : undefined,
                  }
                : block._type === "facilitiesMapSection"
                  ? {
                      dataAttribute,
                      facilityDataAttribute: stega
                        ? (facilityId: string, path: string) =>
                            createDataAttribute({
                              baseUrl:
                                process.env.NEXT_PUBLIC_STUDIO_URL ||
                                "http://localhost:3333",
                              dataset,
                              id: facilityId,
                              path,
                              projectId,
                              type: "facility",
                            }).toString()
                        : undefined,
                      mapDataAttribute: stega
                        ? (path: string) =>
                            createDataAttribute({
                              baseUrl:
                                process.env.NEXT_PUBLIC_STUDIO_URL ||
                                "http://localhost:3333",
                              dataset,
                              id: "facilitiesMap",
                              path,
                              projectId,
                              type: "facilitiesMap",
                            }).toString()
                        : undefined,
                    }
                : block._type === "datesRatesSection"
                  ? {
                      dataAttribute,
                      seasonDataAttribute: stega
                        ? (seasonId: string, path: string) =>
                            createDataAttribute({
                              baseUrl:
                                process.env.NEXT_PUBLIC_STUDIO_URL ||
                                "http://localhost:3333",
                              dataset,
                              id: seasonId,
                              path,
                              projectId,
                              type: "season",
                            }).toString()
                        : undefined,
                    }
                : block._type === "testimonials"
                  ? {
                      dataAttribute,
                      testimonialDataAttribute: stega
                        ? (testimonialId: string, path: string) =>
                            createDataAttribute({
                              baseUrl:
                                process.env.NEXT_PUBLIC_STUDIO_URL ||
                                "http://localhost:3333",
                              dataset,
                              id: testimonialId,
                              path,
                              projectId,
                              type: "testimonial",
                            }).toString()
                        : undefined,
                    }
                : serverFieldEditingBlockTypes.has(block._type)
              ? { dataAttribute }
              : {};

        return (
          <div
            data-sanity={dataSanity}
            data-seam-top={boundary.seamTop ? "" : undefined}
            data-seam-bottom={boundary.seamBottom ? "" : undefined}
            data-tuck={boundary.tuck ? "" : undefined}
            data-tuck-below={boundary.tuckBelow ? "" : undefined}
            key={block._key}
          >
            <Component {...themedBlock} {...editingProps} />
          </div>
        );
      })}
    </>
  );
}
