import { Button } from "@/components/ui/button";
import { createCustomLinkMarkRenderer } from "@/components/portable-text/custom-link-mark";
import { getSafeLinkHref } from "@/lib/safe-href";
import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { Check } from "lucide-react";
import { stegaClean } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import styles from "./story-feature.module.css";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type StoryFeatureProps = Extract<PageBlock, { _type: "storyFeature" }> & {
  dataAttribute?: (path: string) => string | undefined;
};

/*
 * Image and Text: one photo beside a short story.
 *
 * The section opens with the eyebrow, headline, script triad inside the text
 * column so the photo sits beside the whole story. Below the narrative an
 * optional checklist ("The first-night plan") and up to two buttons.
 *
 * Two fields: forest dark (default) and cream, chosen by the editor so the
 * page keeps the Dusk Alternation Rule. Photo left by default; the editor can
 * flip it for the next Image and Text on the same page.
 *
 * Desktop: two equal columns, photo in a 4:5 slab. Phones: photo as a 4:3
 * poster, then the text.
 */

type Surface = {
  accent: string;
  body: string;
  check: string;
  eyebrow: string;
  figure: string;
  hairline: string;
  link: string;
  muted: string;
  quote: string;
  section: string;
  strong: string;
};

const darkSurface: Surface = {
  accent: "text-campfire-amber",
  body: "text-birch-bark/72",
  check: "text-moss",
  eyebrow: "text-campfire-amber",
  figure: "border-birch-bark/12 bg-forest-panel shadow-[var(--shadow-media-rest)]",
  hairline: "border-birch-bark/15",
  link: "font-medium text-birch-bark underline decoration-campfire-amber/50 underline-offset-4 hover:decoration-campfire-amber",
  muted: "text-birch-bark/60",
  quote: "border-campfire-amber text-birch-bark",
  section: "bg-forest-floor text-birch-bark",
  strong: "[&_strong]:text-birch-bark",
};

const creamSurface: Surface = {
  accent: "text-cedar",
  body: "text-pine-night/70",
  check: "text-cedar",
  eyebrow: "text-cedar",
  figure: "border-pine-night/10 bg-birch-bark-bright shadow-[var(--shadow-card-rest-cream)]",
  hairline: "border-pine-night/12",
  link: "font-medium text-cedar underline decoration-cedar/30 underline-offset-4 hover:text-cedar-deep hover:decoration-cedar-deep",
  muted: "text-pine-night/60",
  quote: "border-cedar text-pine-night",
  section: "bg-birch-bark text-pine-night",
  strong: "[&_strong]:text-pine-night",
};

function hasText(value?: string | null) {
  return Boolean(stegaClean(value)?.trim());
}

function createHeadingComponents(surface: Surface): PortableTextComponents {
  return {
    block: { normal: ({ children }) => <>{children}</> },
    marks: {
      strong: ({ children }) => <strong>{children}</strong>,
      em: ({ children }) => (
        <em className={cn("font-accent not-italic", surface.accent)}>{children}</em>
      ),
    },
  };
}

function createStoryComponents(surface: Surface): PortableTextComponents {
  return {
    block: {
      normal: ({ children }) => <p>{children}</p>,
      blockquote: ({ children }) => (
        <blockquote
          className={cn(
            "my-1 border-l-2 pl-6 font-display text-[1.375rem] font-bold leading-[1.3] tracking-[-0.01em] sm:text-2xl",
            surface.quote,
          )}
        >
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }) => <ul className="list-disc space-y-2 pl-6">{children}</ul>,
      number: ({ children }) => (
        <ol className="list-decimal space-y-2 pl-6">{children}</ol>
      ),
    },
    marks: {
      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
      em: ({ children }) => <em>{children}</em>,
      customLink: createCustomLinkMarkRenderer(surface.link),
    },
  };
}

function KeyDetails({
  dataAttribute,
  details,
  surface,
}: Readonly<{
  dataAttribute?: StoryFeatureProps["dataAttribute"];
  details?: StoryFeatureProps["keyDetails"];
  surface: Surface;
}>) {
  const title = stegaClean(details?.title)?.trim();
  const items = (details?.items ?? [])
    .map((item, index) => ({ index, value: stegaClean(item)?.trim() }))
    .filter((item): item is { index: number; value: string } => Boolean(item.value))
    .slice(0, 8);

  if (!items.length) return null;

  return (
    <div className={cn("border-t pt-7", surface.hairline)}>
      {title ? (
        <p
          className={cn("mb-5 text-eyebrow", surface.muted)}
          data-sanity={dataAttribute?.("keyDetails.title")}
        >
          {title}
        </p>
      ) : null}
      <ul className="grid list-none gap-3 p-0">
        {items.map((item) => (
          <li
            className="flex items-start gap-3 text-[15px] leading-[1.55]"
            data-sanity={dataAttribute?.(`keyDetails.items[${item.index}]`)}
            key={`${item.value}-${item.index}`}
          >
            <Check
              aria-hidden="true"
              className={cn("mt-0.5 size-5 shrink-0", surface.check)}
            />
            <span>{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StoryButtons({
  buttons,
  dataAttribute,
  onDark,
}: Readonly<Pick<StoryFeatureProps, "buttons" | "dataAttribute"> & { onDark: boolean }>) {
  const links = (buttons ?? []).flatMap((button, index) => {
    const href = getSafeLinkHref(button.href);
    if (!href) return [];
    return [{ ...button, href, key: button._key || `${href}-${index}` }];
  });

  if (!links.length) return null;

  return (
    <div
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap"
      data-sanity={dataAttribute?.("buttons")}
    >
      {links.slice(0, 2).map((button, index) => (
        <Button
          asChild
          key={button.key}
          onDark={onDark}
          variant={index === 0 ? "primary" : "outline"}
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

export default function StoryFeature({
  _key,
  buttons,
  dataAttribute,
  eyebrow,
  flipLayout,
  image,
  imageCaption,
  keyDetails,
  richText,
  title,
  useCreamBackground,
}: StoryFeatureProps) {
  if (!title?.length) return null;

  const isCream = stegaClean(useCreamBackground) === true;
  const surface = isCream ? creamSurface : darkSurface;
  const photoOnRight = stegaClean(flipLayout) === true;
  const sectionKey = stegaClean(_key);
  const headingId = `story-feature-${sectionKey}-title`;
  const caption = stegaClean(imageCaption)?.trim();
  const hasImage = Boolean(image?.asset?._id);

  return (
    <section
      aria-labelledby={headingId}
      className={cn("py-section", surface.section)}
      id={`story-feature-${sectionKey}`}
    >
      <div className="container-content grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-x-16 xl:gap-x-24">
        <figure
          className={cn("m-0 flex flex-col gap-3", photoOnRight && "lg:order-2", styles.reveal)}
        >
          <div
            className={cn(
              "relative aspect-[4/3] w-full overflow-hidden rounded-xl border lg:aspect-[4/5]",
              surface.figure,
            )}
            data-sanity={dataAttribute?.("image")}
          >
            {hasImage && image ? (
              <Image
                alt={stegaClean(image.alt) || ""}
                blurDataURL={image.asset?.metadata?.lqip || undefined}
                className="object-cover"
                fill
                placeholder={image.asset?.metadata?.lqip ? "blur" : undefined}
                sizes="(min-width: 1320px) 620px, (min-width: 1024px) 50vw, 100vw"
                src={urlFor(image).width(1400).fit("max").url()}
                style={
                  image.hotspot?.x != null && image.hotspot.y != null
                    ? {
                        objectPosition: `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%`,
                      }
                    : undefined
                }
              />
            ) : null}
          </div>
          {caption ? (
            <figcaption
              className={cn("text-label", surface.muted)}
              data-sanity={dataAttribute?.("imageCaption")}
            >
              {caption}
            </figcaption>
          ) : null}
        </figure>

        <div className={cn("flex min-w-0 max-w-[36rem] flex-col gap-7", styles.reveal)}>
          <header>
            {hasText(eyebrow) ? (
              <p
                className={cn("mb-5 text-eyebrow", surface.eyebrow)}
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
              <PortableText components={createHeadingComponents(surface)} value={title} />
            </h2>
          </header>

          {richText?.length ? (
            <div
              className={cn(
                "grid gap-5 text-pretty text-[17px] leading-[1.6]",
                surface.body,
                surface.strong,
              )}
              data-sanity={dataAttribute?.("richText")}
            >
              <PortableText components={createStoryComponents(surface)} value={richText} />
            </div>
          ) : null}

          <KeyDetails dataAttribute={dataAttribute} details={keyDetails} surface={surface} />
          <StoryButtons buttons={buttons} dataAttribute={dataAttribute} onDark={!isCream} />
        </div>
      </div>
    </section>
  );
}
