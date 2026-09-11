import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { ReactNode } from "react";
import { stegaClean } from "next-sanity";
import { getSafeLinkHref } from "@/lib/safe-href";
import {
  Bus,
  CalendarClock,
  Check,
  ClipboardList,
  Info,
  ReceiptText,
  ShoppingBag,
  UsersRound,
} from "lucide-react";
import DatesRatesBrowser from "./dates-rates-browser";
import styles from "./dates-rates-section.module.css";
import { prepareLengths } from "./dates-rates-model";

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

const conditionIcons = {
  savings: UsersRound,
  payment: CalendarClock,
  transport: Bus,
  shop: ShoppingBag,
  tax: ReceiptText,
  waitlist: ClipboardList,
  normal: Info,
};

const headingComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <>{children}</>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => (
      <em className="font-accent text-[clamp(2.75rem,5vw,4.5rem)] font-semibold not-italic leading-none text-cedar">
        {children}
      </em>
    ),
  },
};

const introductionComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
  },
};

const conditionComponents: PortableTextComponents = {
  block: ({ children }: { children?: ReactNode }) => (
    <p className="max-w-[65ch] text-pretty">{children}</p>
  ),
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-pine-night/85">{children}</strong>
    ),
    em: ({ children }) => <em>{children}</em>,
  },
};

export default function DatesRatesSection({
  _key,
  activeSeason,
  conditions,
  dataAttribute,
  detailsLinkText,
  eyebrow,
  heading,
  introduction,
  seasonDataAttribute,
  secondaryLink,
  sessionIncludes,
}: DatesRatesSectionProps) {
  if (!activeSeason?._id || !activeSeason.startDate) return null;

  const seasonStart = stegaClean(activeSeason.startDate);
  const lengths = prepareLengths({
    season: activeSeason,
    seasonDataAttribute,
  });
  if (lengths.length === 0) return null;
  if (!seasonStart) return null;
  if (!sessionIncludes || sessionIncludes.length === 0) return null;
  if (!conditions || conditions.length === 0) return null;

  const sectionId = `dates-rates-${stegaClean(_key)}`;

  // Both links are optional: the details link points at the Dates & Rates
  // page and is hidden there; the secondary link renders only when its text
  // and destination are both set.
  const detailsText = stegaClean(detailsLinkText)?.trim();
  const secondaryHref = getSafeLinkHref(secondaryLink?.href);
  const secondaryText = stegaClean(secondaryLink?.text)?.trim();
  const portalLink =
    secondaryHref && secondaryText
      ? {
          dataSanity: dataAttribute?.("secondaryLink"),
          href: secondaryHref,
          openInNewTab: Boolean(stegaClean(secondaryLink?.openInNewTab)),
          text: secondaryText,
        }
      : undefined;

  return (
    <section
      aria-labelledby={sectionId}
      className="relative z-0 -mt-11 rounded-t-[2.75rem] bg-birch-bark px-content-x py-section text-pine-night"
      id={`dates-rates-${stegaClean(_key)}`}
    >
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-12 grid gap-8 lg:grid-cols-[1fr_400px] lg:items-end">
          <header>
            <p
              className={`mb-5 text-eyebrow text-cedar ${styles.reveal}`}
              data-sanity={dataAttribute?.("eyebrow")}
            >
              {eyebrow}
            </p>
            <h2
              className={`text-balance font-display text-headline font-extrabold ${styles.reveal}`}
              data-sanity={dataAttribute?.("heading")}
              id={sectionId}
            >
              <PortableText components={headingComponents} value={heading} />
            </h2>
          </header>
          <div className={`max-w-xl ${styles.reveal}`}>
            <div
              className="text-pretty text-base/relaxed text-pine-night/72 [&_p]:m-0"
              data-sanity={dataAttribute?.("introduction")}
            >
              <PortableText
                components={introductionComponents}
                value={introduction}
              />
            </div>
            {detailsText ? (
              <a
                className={`focus-ring mt-4 inline-flex w-fit items-center gap-[9px] border-b-2 border-campfire-amber pb-1 font-semibold text-cedar transition-colors hover:text-cedar-deep motion-reduce:transition-none ${styles.detailsLink}`}
                data-sanity={dataAttribute?.("detailsLinkText")}
                href={detailsHref}
              >
                {detailsText}
                <span aria-hidden="true">&rarr;</span>
              </a>
            ) : null}
          </div>
        </div>

        <DatesRatesBrowser
          lengths={lengths}
          portalLink={portalLink}
          seasonStart={seasonStart}
        />

        <div className="mt-10 grid gap-10 md:px-8 lg:mt-12 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-14">
          <section aria-labelledby={`${sectionId}-included`}>
            <h3
              className="mb-6 text-balance font-display text-title-lg font-bold"
              id={`${sectionId}-included`}
            >
              Included in your rate
            </h3>
            <ul
              className="divide-y divide-pine-night/16 border-y border-pine-night/16"
              data-sanity={dataAttribute?.("sessionIncludes")}
              role="list"
            >
              {sessionIncludes.map((item) => (
                <li
                  className="flex items-start gap-3 py-5"
                  data-sanity={dataAttribute?.(
                    `sessionIncludes[_key=="${item._key}"]`,
                  )}
                  key={item._key}
                >
                  <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-cedar" />
                  <span className="text-pretty text-base/relaxed font-semibold text-pine-night/85 [overflow-wrap:anywhere]">
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby={`${sectionId}-conditions`}>
            <h3
              className="mb-6 text-balance font-display text-title-lg font-bold"
              id={`${sectionId}-conditions`}
            >
              Discounts, payments &amp; extras
            </h3>
            <ul
              className="min-w-0 divide-y divide-pine-night/16 border-y border-pine-night/16 text-base/relaxed text-pine-night/75"
              data-sanity={dataAttribute?.("conditions")}
              role="list"
            >
              {conditions.map((condition) => {
                const Icon =
                  conditionIcons[stegaClean(condition.style) ?? "normal"] ?? Info;
                return (
                  <li
                    className="flex items-start gap-3 py-5 [overflow-wrap:anywhere]"
                    data-sanity={dataAttribute?.(
                      `conditions[_key=="${condition._key}"]`,
                    )}
                    key={condition._key}
                  >
                    <Icon
                      aria-hidden="true"
                      className="mt-1 size-5 shrink-0 text-cedar"
                    />
                    <div className="min-w-0">
                      <PortableText
                        components={conditionComponents}
                        value={[condition]}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </section>
  );
}
