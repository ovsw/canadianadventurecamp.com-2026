import { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
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
import StackedTimeline from "@/components/blocks/stacked-timeline";
// page-builder-generator:component-imports
import InternationalCampersSection from "@/components/blocks/international-campers-section";
import { dataset, projectId } from "@/sanity/lib/env";

type Block =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

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
  "testimonials",
  "stackedTimeline",
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
  stackedTimeline: StackedTimeline,
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
  return (
    <>
      {blocks?.map((block) => {
        const Component = componentMap[block._type] as
          | React.ComponentType<Block & BlockEditingProps>
          | undefined;
        if (!Component) return null;

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
              : block._type === "activitySchedule"
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
            key={block._key}
          >
            <Component {...block} {...editingProps} />
          </div>
        );
      })}
    </>
  );
}
