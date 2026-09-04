import { Button } from "@/components/ui/button";
import { createCustomLinkMarkRenderer } from "@/components/portable-text/custom-link-mark";
import { getSafeLinkHref } from "@/lib/safe-href";
import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import type { PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { stegaClean } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";
import styles from "./story-feature.module.css";

type StoryFeatureBlock = Extract<
  NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number],
  { _type: "storyFeature" }
>;

type StoryFeatureProps = StoryFeatureBlock & {
  dataAttribute?: (path: string) => string | undefined;
};

type ButtonVariant = NonNullable<ComponentProps<typeof Button>["variant"]>;

/*
 * Story feature — one photo, one story, one or two actions.
 *
 * A closing or mid-page section: the photo sits in a soft slab on the left,
 * the eyebrow, heading, narrative, "at a glance" chips and buttons on the
 * right. Default field is Forest Floor (the site's default dark field);
 * `useCreamBackground` swaps to Birch Bark so the block can alternate with
 * its neighbours (The Dusk Alternation Rule). Phones stack: photo first,
 * then the copy.
 */

/** Field-dependent colour recipes so the two variants stay in one component. */
const fields = {
  dark: {
    section: "bg-forest-floor text-birch-bark",
    eyebrow: "text-campfire-amber",
    body: "text-birch-bark/72",
    quote: "text-birch-bark",
    caption: "text-birch-bark/60",
    chipTitle: "text-birch-bark/60",
    chip: "border-birch-bark/22 text-birch-bark/85",
    link: "text-campfire-amber decoration-campfire-amber/40 hover:text-campfire-amber-deep hover:decoration-campfire-amber-deep",
    media: "bg-pine-night shadow-[var(--shadow-media-rest)]",
    onDark: true,
  },
  cream: {
    section: "bg-birch-bark text-pine-night",
    eyebrow: "text-cedar",
    body: "text-pine-night/70",
    quote: "text-pine-night",
    caption: "text-pine-night/60",
    chipTitle: "text-pine-night/55",
    chip: "border-pine-night/18 text-pine-night/75",
    link: "text-cedar decoration-cedar/30 hover:text-cedar-deep hover:decoration-cedar-deep",
    media: "bg-pine-night/10 shadow-[var(--shadow-card-rest-cream)]",
    onDark: false,
  },
} as const;

type Field = (typeof fields)[keyof typeof fields];

function richTextComponents(field: Field): Partial<PortableTextComponents> {
  return {
    block: {
      normal: ({ children }) => <p>{children}</p>,
      blockquote: ({ children }) => (
        <blockquote
          className={cn(
            "my-2 border-l-2 border-campfire-amber pl-5 font-display text-title sm:text-[26px]",
            field.quote,
          )}
        >
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }) => (
        <ul className="list-disc space-y-2 pl-6 marker:text-campfire-amber">
          {children}
        </ul>
      ),
      number: ({ children }) => (
        <ol className="list-decimal space-y-2 pl-6 marker:font-mono marker:text-[13px]">
          {children}
        </ol>
      ),
    },
    marks: {
      strong: ({ children }) => (
        <strong className={cn("font-semibold", field.quote)}>{children}</strong>
      ),
      em: ({ children }) => <em>{children}</em>,
      customLink: createCustomLinkMarkRenderer(
        cn("font-medium underline underline-offset-4", field.link),
      ),
    },
  };
}

function getButtonVariant(variant?: string | null): ButtonVariant {
  const cleanVariant = stegaClean(variant);
  return cleanVariant === "secondary" || cleanVariant === "outline"
    ? "outline"
    : "primary";
}

function StoryButtons({
  buttons,
  dataAttribute,
  field,
}: Readonly<Pick<StoryFeatureProps, "buttons" | "dataAttribute"> & { field: Field }>) {
  const links = (buttons ?? []).flatMap((button, index) => {
    const href = getSafeLinkHref(button.href);
    const label = stegaClean(button.text)?.trim();
    if (!href || !label) return [];
    return [{ ...button, href, label, key: button._key || `${href}-${index}` }];
  });

  if (!links.length) return null;

  return (
    <div
      className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
      data-sanity={dataAttribute?.("buttons")}
    >
      {links.slice(0, 2).map((button) => (
        <Button
          asChild
          key={button.key}
          onDark={field.onDark}
          variant={getButtonVariant(button.variant)}
        >
          <Link
            data-sanity={dataAttribute?.(`buttons[_key=="${button._key}"]`)}
            href={button.href}
            rel={stegaClean(button.openInNewTab) ? "noopener noreferrer" : undefined}
            target={stegaClean(button.openInNewTab) ? "_blank" : undefined}
          >
            {button.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}

function KeyDetails({
  dataAttribute,
  details,
  field,
}: Readonly<{
  dataAttribute?: StoryFeatureProps["dataAttribute"];
  details?: StoryFeatureProps["keyDetails"];
  field: Field;
}>) {
  const title = stegaClean(details?.title)?.trim();
  const items = (details?.items ?? [])
    .map((item, index) => ({ index, value: stegaClean(item)?.trim() }))
    .filter((item): item is { index: number; value: string } => Boolean(item.value))
    .slice(0, 8);

  if (!items.length) return null;

  return (
    <div>
      {title ? (
        <p
          className={cn("mb-3 text-label", field.chipTitle)}
          data-sanity={dataAttribute?.("keyDetails.title")}
        >
          {title}
        </p>
      ) : null}
      <ul
        className="flex list-none flex-wrap gap-2 p-0"
        data-sanity={dataAttribute?.("keyDetails.items")}
      >
        {items.map((item) => (
          <li
            className={cn(
              "rounded-pill border px-3 py-[7px] text-label",
              field.chip,
            )}
            data-sanity={dataAttribute?.(`keyDetails.items[${item.index}]`)}
            key={`${item.value}-${item.index}`}
          >
            {item.value}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function StoryFeature({
  _key,
  buttons,
  dataAttribute,
  eyebrow,
  image,
  imageCaption,
  keyDetails,
  richText,
  title,
  useCreamBackground,
}: StoryFeatureProps) {
  const displayTitle = stegaClean(title)?.trim();
  if (!displayTitle) return null;

  const field = stegaClean(useCreamBackground) ? fields.cream : fields.dark;
  const displayEyebrow = stegaClean(eyebrow)?.trim();
  const displayCaption = stegaClean(imageCaption)?.trim();
  const sectionKey = stegaClean(_key);
  const headingId = `story-feature-${sectionKey}-title`;
  const hasImage = Boolean(image?.asset?._id);

  return (
    <section
      aria-labelledby={headingId}
      className={cn("py-section", field.section)}
      id={`story-feature-${sectionKey}`}
    >
      <div className="container-content">
        <div
          className={cn(
            "grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 xl:gap-24",
            styles.reveal,
          )}
        >
          {hasImage ? (
            <figure className="m-0 min-w-0">
              <div
                className={cn(
                  "relative aspect-[4/3] w-full overflow-hidden rounded-xl",
                  field.media,
                )}
                data-sanity={dataAttribute?.("image")}
              >
                <Image
                  alt={stegaClean(image?.alt)?.trim() || ""}
                  blurDataURL={image?.asset?.metadata?.lqip || undefined}
                  className="object-cover"
                  fill
                  placeholder={image?.asset?.metadata?.lqip ? "blur" : undefined}
                  sizes="(min-width: 1320px) 560px, (min-width: 1024px) 45vw, 100vw"
                  src={urlFor(image!).width(1200).height(900).url()}
                />
              </div>
              {displayCaption ? (
                <figcaption
                  className={cn("mt-4 text-label", field.caption)}
                  data-sanity={dataAttribute?.("imageCaption")}
                >
                  {displayCaption}
                </figcaption>
              ) : null}
            </figure>
          ) : null}

          <div className="flex min-w-0 max-w-[38rem] flex-col gap-7">
            <header>
              {displayEyebrow ? (
                <p
                  className={cn("mb-5 text-eyebrow", field.eyebrow)}
                  data-sanity={dataAttribute?.("eyebrow")}
                >
                  {displayEyebrow}
                </p>
              ) : null}
              <h2
                className="text-balance font-display text-headline"
                data-sanity={dataAttribute?.("title")}
                id={headingId}
              >
                {displayTitle}
              </h2>
            </header>

            {richText?.length ? (
              <div
                className={cn(
                  "flex flex-col gap-4 text-pretty text-[17px] leading-[1.6]",
                  field.body,
                )}
                data-sanity={dataAttribute?.("richText")}
              >
                <PortableText components={richTextComponents(field)} value={richText} />
              </div>
            ) : null}

            <KeyDetails dataAttribute={dataAttribute} details={keyDetails} field={field} />
            <StoryButtons buttons={buttons} dataAttribute={dataAttribute} field={field} />
          </div>
        </div>
      </div>
    </section>
  );
}
