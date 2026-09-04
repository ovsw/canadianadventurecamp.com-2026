import { Button } from "@/components/ui/button";
import { getSafeLinkHref } from "@/lib/safe-href";
import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import { stegaClean } from "next-sanity";
import type { ComponentProps } from "react";
import styles from "./stacked-timeline.module.css";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type StackedTimelineProps = Extract<PageBlock, { _type: "stackedTimeline" }> & {
  dataAttribute?: (path: string) => string | undefined;
};

type TimelineItem = NonNullable<StackedTimelineProps["items"]>[number];
type ButtonVariant = NonNullable<ComponentProps<typeof Button>["variant"]>;

const headingComponents: PortableTextComponents = {
  block: { normal: ({ children }) => <>{children}</> },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => (
      <em className="font-accent text-campfire-amber not-italic">
        {children}
      </em>
    ),
  },
};

function hasText(value?: string | null) {
  return Boolean(stegaClean(value)?.trim());
}

function formatNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

function getButtonVariant(variant?: string | null): ButtonVariant {
  const cleanVariant = stegaClean(variant);
  return cleanVariant === "secondary" || cleanVariant === "outline"
    ? "outline"
    : "primary";
}

/**
 * Cards the renderer can show: title and one line are required by the schema
 * and by the renderer, so a half-filled card never breaks the sequence.
 */
export function getRenderableItems(items: StackedTimelineProps["items"]) {
  return (items ?? []).filter(
    (item): item is TimelineItem =>
      Boolean(item?._key) && hasText(item.title) && hasText(item.text),
  );
}

function TimelineButtons({
  buttons,
  dataAttribute,
}: Readonly<Pick<StackedTimelineProps, "buttons" | "dataAttribute">>) {
  const links = (buttons ?? []).flatMap((button, index) => {
    const href = getSafeLinkHref(button.href);
    if (!href) return [];
    return [{ ...button, href, key: button._key || `${href}-${index}` }];
  });

  if (!links.length) return null;

  return (
    <div
      className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
      data-sanity={dataAttribute?.("buttons")}
    >
      {links.slice(0, 2).map((button) => (
        <Button
          asChild
          key={button.key}
          onDark
          variant={getButtonVariant(button.variant)}
        >
          <Link
            href={button.href}
            rel={stegaClean(button.openInNewTab) ? "noopener noreferrer" : undefined}
            target={stegaClean(button.openInNewTab) ? "_blank" : undefined}
          >
            {stegaClean(button.text)?.trim() || "Continue"}
          </Link>
        </Button>
      ))}
    </div>
  );
}

export default function StackedTimeline({
  _key,
  buttons,
  dataAttribute,
  eyebrow,
  intro,
  items,
  title,
}: StackedTimelineProps) {
  const renderableItems = getRenderableItems(items);

  if (!title?.length || renderableItems.length < 2) return null;

  const sectionKey = stegaClean(_key);
  const headingId = `stacked-timeline-${sectionKey}-title`;
  const imageSizes = "(min-width: 1320px) 620px, (min-width: 1024px) 50vw, 100vw";

  return (
    <section
      aria-labelledby={headingId}
      className="bg-forest-floor py-section text-birch-bark"
      id={`stacked-timeline-${sectionKey}`}
    >
      <div className="container-content">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-24">
          <header className={cn("max-w-[34rem]", styles.intro)}>
            {hasText(eyebrow) ? (
              <p
                className="mb-5 text-eyebrow text-campfire-amber"
                data-sanity={dataAttribute?.("eyebrow")}
              >
                {eyebrow}
              </p>
            ) : null}
            <h2
              className="text-balance font-display text-headline"
              data-sanity={dataAttribute?.("title")}
              id={headingId}
            >
              <PortableText components={headingComponents} value={title} />
            </h2>
            {hasText(intro) ? (
              <p
                className="mt-6 max-w-[38rem] text-pretty text-[17px] leading-[1.6] text-birch-bark/72"
                data-sanity={dataAttribute?.("intro")}
              >
                {intro}
              </p>
            ) : null}
            <TimelineButtons buttons={buttons} dataAttribute={dataAttribute} />
          </header>

          <ol
            aria-label="Cards, in order"
            className="flex list-none flex-col gap-8 p-0 lg:gap-12"
            data-sanity={dataAttribute?.("items")}
          >
            {renderableItems.map((item, index) => {
              const itemPath = `items[_key=="${item._key}"]`;
              const itemKey = stegaClean(item._key);
              const labelId = `stacked-timeline-${sectionKey}-${itemKey}-title`;
              const textId = `stacked-timeline-${sectionKey}-${itemKey}-text`;
              const number = formatNumber(index);
              const meta = stegaClean(item.meta)?.trim();
              const imageAlt = stegaClean(item.image?.alt)?.trim() ?? "";

              return (
                <li
                  aria-describedby={textId}
                  aria-labelledby={labelId}
                  className={cn(
                    "focus-ring rounded-xl border border-birch-bark/12 bg-forest-panel p-2",
                    styles.reveal,
                  )}
                  data-timeline-item={number}
                  key={item._key}
                  tabIndex={0}
                >
                  {item.image?.asset?._id ? (
                    <figure
                      className="relative aspect-video w-full overflow-hidden rounded-lg bg-pine-night"
                      data-sanity={dataAttribute?.(`${itemPath}.image`)}
                    >
                      <Image
                        alt={imageAlt}
                        blurDataURL={item.image.asset.metadata?.lqip || undefined}
                        className="object-cover"
                        fill
                        placeholder={
                          item.image.asset.metadata?.lqip ? "blur" : undefined
                        }
                        sizes={imageSizes}
                        src={urlFor(item.image).width(1280).height(720).url()}
                      />
                    </figure>
                  ) : (
                    <div
                      aria-hidden="true"
                      className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-birch-bark/18 bg-pine-night/60"
                      data-sanity={dataAttribute?.(`${itemPath}.image`)}
                    >
                      <span className="font-display text-[4.5rem] font-extrabold leading-none tracking-[-0.03em] text-birch-bark/20">
                        {number}
                      </span>
                    </div>
                  )}

                  <div className="p-6 sm:p-7">
                    <p className="flex items-center gap-2 text-label text-birch-bark/60">
                      <span>{number}</span>
                      {meta ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span data-sanity={dataAttribute?.(`${itemPath}.meta`)}>
                            {meta}
                          </span>
                        </>
                      ) : null}
                    </p>
                    <h3
                      className="mt-3 font-display text-title sm:text-[26px]"
                      data-sanity={dataAttribute?.(`${itemPath}.title`)}
                      id={labelId}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="mt-2 max-w-[34rem] text-pretty text-[15px] leading-[1.55] text-birch-bark/72"
                      data-sanity={dataAttribute?.(`${itemPath}.text`)}
                      id={textId}
                    >
                      {item.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
