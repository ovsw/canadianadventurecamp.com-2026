import LargeSlidesTrack from "@/components/blocks/large-slides-track";
import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { stegaClean } from "next-sanity";
import styles from "./large-slides.module.css";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type LargeSlidesProps = Extract<PageBlock, { _type: "largeSlides" }> & {
  dataAttribute?: (path: string) => string | undefined;
};

/*
 * Large slides — one pinned photo, many slides.
 *
 * The header (eyebrow, heading, intro) sits in the content container. Below
 * it, on desktop, the photo bleeds from the viewport's left edge to the
 * container midline and pins one screen tall while the slides scroll past in
 * the right half; the photo crossfades to the slide nearest the middle of the
 * screen (large-slides-track.tsx). Each slide's copy is the Big Image List
 * text column: number, big time, label, one line. Phones stack each slide as
 * photo then copy, with no pinning.
 */

const headingComponents: PortableTextComponents = {
  block: { normal: ({ children }) => <>{children}</> },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => (
      <em className="font-accent text-campfire-amber not-italic">{children}</em>
    ),
  },
};

function hasText(value?: string | null) {
  return Boolean(stegaClean(value)?.trim());
}

export default function LargeSlides({
  _key,
  dataAttribute,
  eyebrow,
  intro,
  slides,
  title,
}: LargeSlidesProps) {
  const renderableSlides = (slides ?? []).filter(
    (slide) =>
      slide?._key &&
      hasText(slide.label) &&
      hasText(slide.time) &&
      hasText(slide.text),
  );
  if (!title?.length || renderableSlides.length < 2) return null;

  const sectionId = `large-slides-${stegaClean(_key)}`;
  const headingId = `${sectionId}-title`;

  const trackSlides = renderableSlides.map((slide, index) => {
    const slidePath = `slides[_key=="${slide._key}"]`;
    const key = stegaClean(slide._key) ?? String(index);
    const labelId = `${sectionId}-${key}-label`;
    const textId = `${sectionId}-${key}-text`;
    const time = stegaClean(slide.time) ?? "";
    // Keep the written time intact; only style a trailing am/pm separately.
    const suffix = time.match(/\s*[ap]m\s*$/i)?.[0];
    const number = String(index + 1).padStart(2, "0");
    const alt = stegaClean(slide.image?.alt)?.trim() ?? "";
    const lqip = slide.image?.asset?.metadata?.lqip || undefined;
    const hasImage = Boolean(slide.image?.asset?._id);

    return {
      key,
      labelId,
      textId,
      number,
      /**
       * Pinned desktop photo: half the viewport wide, one screen tall. The
       * frame is taller than most camp photos, so the source keeps its own
       * aspect at full width and the browser crops around the hotspot;
       * asking Sanity for a portrait crop would upscale a narrow slice.
       */
      photo: hasImage ? (
        <Image
          alt={alt}
          blurDataURL={lqip}
          className="object-cover"
          fill
          placeholder={lqip ? "blur" : undefined}
          sizes="(min-width: 1024px) 50vw, 100vw"
          src={urlFor(slide.image!).width(1600).url()}
          style={
            slide.image?.hotspot?.x != null && slide.image.hotspot.y != null
              ? {
                  objectPosition: `${slide.image.hotspot.x * 100}% ${slide.image.hotspot.y * 100}%`,
                }
              : undefined
          }
        />
      ) : null,
      /** Stacked phone photo, 3:2 like the Big Image List row. */
      stackedPhoto: (
        <figure
          className="relative aspect-[3/2] w-full overflow-hidden rounded-md bg-forest-panel shadow-media-rest"
          data-sanity={dataAttribute?.(`${slidePath}.image`)}
        >
          {hasImage ? (
            <Image
              alt={alt}
              blurDataURL={lqip}
              className="object-cover"
              fill
              loading="lazy"
              placeholder={lqip ? "blur" : undefined}
              sizes="100vw"
              src={urlFor(slide.image!).width(1242).height(828).url()}
            />
          ) : (
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center font-display text-6xl text-birch-bark/20"
            >
              {number}
            </span>
          )}
        </figure>
      ),
      copy: (
        <div className="min-w-0">
          <p className="mb-3.5 text-label text-birch-bark/60">{number}</p>
          <p
            className={styles.time}
            data-sanity={dataAttribute?.(`${slidePath}.time`)}
          >
            {suffix ? (
              <>
                {time.slice(0, -suffix.length)}
                <small>{suffix}</small>
              </>
            ) : (
              time
            )}
          </p>
          <h3
            className="max-w-[30rem] font-display text-[30px] leading-[1.1] font-bold tracking-[-0.01em] wrap-break-word"
            data-sanity={dataAttribute?.(`${slidePath}.label`)}
            id={labelId}
          >
            {slide.label}
          </h3>
          <p
            className="mt-2.5 max-w-[30rem] text-pretty text-[15px] leading-[1.55] text-birch-bark/72 wrap-break-word"
            data-sanity={dataAttribute?.(`${slidePath}.text`)}
            id={textId}
          >
            {slide.text}
          </p>
        </div>
      ),
    };
  });

  return (
    <section
      aria-labelledby={headingId}
      className={cn("bg-forest-floor text-birch-bark", styles.section)}
      id={sectionId}
    >
      <header className={cn("container-content", styles.header)}>
        <div>
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
        </div>
        {hasText(intro) ? (
          <p
            className="max-w-[38rem] text-pretty text-[17px] leading-[1.6] text-birch-bark/72 lg:mb-1.5"
            data-sanity={dataAttribute?.("intro")}
          >
            {intro}
          </p>
        ) : null}
      </header>
      <LargeSlidesTrack
        dataSanity={dataAttribute?.("slides")}
        slides={trackSlides}
      />
    </section>
  );
}
