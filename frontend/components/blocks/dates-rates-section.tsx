import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { stegaClean } from "next-sanity";
import DatesRatesBrowser from "./dates-rates-browser";
import {
  formatShortDate,
  prepareLengths,
  seasonLabel,
} from "./dates-rates-model";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type DatesRatesSectionProps = Extract<
  PageBlock,
  { _type: "datesRatesSection" }
> & {
  dataAttribute?: (path: string) => string | undefined;
  seasonDataAttribute?: (
    documentId: string,
    path: string,
  ) => string | undefined;
};

const detailsHref = "/dates-and-rates/";

const headingComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <>{children}</>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => (
      <em className="block font-accent text-[clamp(2.75rem,5vw,4.5rem)] font-semibold not-italic leading-none text-cedar">
        {children}
      </em>
    ),
  },
};

export default function DatesRatesSection({
  _key,
  activeSeason,
  dataAttribute,
  detailsLinkText,
  heading,
  introduction,
  seasonDataAttribute,
}: DatesRatesSectionProps) {
  if (!activeSeason?._id || !activeSeason.startDate) return null;

  const seasonStart = stegaClean(activeSeason.startDate);
  const lengths = prepareLengths({
    season: activeSeason,
    seasonDataAttribute,
  });
  if (lengths.length === 0) return null;

  const sectionId = `dates-rates-${stegaClean(_key)}`;
  const cleanSeasonStart = seasonStart ?? "";
  const seasonYear = new Date(`${cleanSeasonStart}T00:00:00.000Z`).getUTCFullYear();

  return (
    <section
      aria-labelledby={sectionId}
      className="bg-birch-bark px-content-x py-section text-pine-night"
      id={`dates-rates-${stegaClean(_key)}`}
    >
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-12 grid gap-8 lg:grid-cols-[1fr_400px] lg:items-end">
          <header>
            <p className="mb-5 text-eyebrow text-cedar">Dates & rates</p>
            <h2
              className="text-balance font-display text-headline font-extrabold"
              data-sanity={dataAttribute?.("heading")}
              id={sectionId}
            >
              <PortableText components={headingComponents} value={heading} />
            </h2>
          </header>
          <div className="max-w-xl">
            <p
              className="text-pretty text-base/relaxed text-pine-night/72"
              data-sanity={dataAttribute?.("introduction")}
            >
              {introduction}
            </p>
            <a
              className="focus-ring mt-4 inline-flex w-fit items-center gap-2 border-b-2 border-campfire-amber pb-1 font-semibold text-cedar transition-colors hover:text-cedar-deep motion-reduce:transition-none"
              data-sanity={dataAttribute?.("detailsLinkText")}
              href={detailsHref}
            >
              {detailsLinkText}
              <span aria-hidden="true">-&gt;</span>
            </a>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <p className="text-label text-pine-night/55">
            {seasonLabel(activeSeason.name, cleanSeasonStart)}
          </p>
          <p className="text-label text-pine-night/35">
            {formatShortDate(cleanSeasonStart)} to{" "}
            {formatShortDate(
              new Date(
                Date.parse(`${cleanSeasonStart}T00:00:00.000Z`) +
                  55 * 24 * 60 * 60 * 1000,
              )
                .toISOString()
                .slice(0, 10),
            )}
          </p>
        </div>

        <DatesRatesBrowser lengths={lengths} seasonYear={seasonYear} />
      </div>
    </section>
  );
}
