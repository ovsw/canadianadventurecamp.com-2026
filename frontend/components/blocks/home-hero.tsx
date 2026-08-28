import Image from "next/image";
import Link from "next/link";
import { stegaClean } from "next-sanity";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import HomeHeroBackgroundVideo from "@/components/blocks/home-hero-background-video";
import { Button } from "@/components/ui/button";
import { NavigationIcon } from "@/components/header/navigation-icon";
import HomeHeroVideoLightbox from "@/components/blocks/home-hero-video-lightbox";
import { getHomeHeroVideoEmbedUrl } from "@/components/blocks/home-hero-video";
import { simpleRichTextComponents } from "@/components/simple-rich-text";
import { getSafeLinkHref } from "@/lib/safe-href";
import { urlFor } from "@/sanity/lib/image";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import type { ComponentProps } from "react";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type HomeHeroBlock = Extract<PageBlock, { _type: "homeHero" }>;

type HomeHeroProps = HomeHeroBlock & {
  dataAttribute?: (path: string) => string | undefined;
};

type ButtonVariant = NonNullable<ComponentProps<typeof Button>["variant"]>;

export function resolveHomeHeroButtonVariant(
  variant: string | null | undefined,
  index: number,
): ButtonVariant {
  const cleanVariant = stegaClean(variant);

  if (
    cleanVariant === "default" ||
    cleanVariant === "secondary" ||
    cleanVariant === "outline" ||
    cleanVariant === "ghost" ||
    cleanVariant === "link"
  ) {
    return cleanVariant;
  }

  return index === 0 ? "outline" : "ghost";
}

/** Minimal rich text: bold/italic only, italic gets the accent (handwritten) style. */
const headingComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <>{children}</>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => (
      <em className="font-accent not-italic text-accent">{children}</em>
    ),
  },
};

export default function HomeHero({
  _key,
  badge,
  body,
  buttons,
  dataAttribute,
  image,
  shortBody,
  stats,
  title,
  videoUrl,
}: HomeHeroProps) {
  if (!title?.length) return null;

  const headingId = `home-hero-${stegaClean(_key)}-title`;
  const cleanVideoUrl = stegaClean(videoUrl)?.trim();
  const posterUrl =
    image?.asset?._id
      ? urlFor(image).width(1920).height(1080).fit("crop").url()
      : undefined;

  return (
    <section
      aria-labelledby={headingId}
      className="relative min-h-dvh overflow-hidden bg-forest-900"
      id={`hero-${stegaClean(_key)}`}
    >
      {/* Background media */}
      {image?.asset?._id ? (
        <Image
          alt={stegaClean(image.alt) || ""}
          blurDataURL={image.asset.metadata?.lqip || undefined}
          className="object-cover"
          data-sanity={dataAttribute?.("image")}
          fill
          placeholder={image.asset.metadata?.lqip ? "blur" : undefined}
          priority
          sizes="100vw"
          src={urlFor(image).width(1920).height(1080).fit("crop").url()}
        />
      ) : null}
      {cleanVideoUrl ? (
        <HomeHeroBackgroundVideo poster={posterUrl} src={cleanVideoUrl} />
      ) : null}

      {/* Gradient overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/70"
      />

      {/* Hero copy */}
      <div className="relative z-10 flex min-h-dvh flex-col justify-end px-content-x pb-40 pt-32">
        {/* Badge */}
        {stegaClean(badge)?.trim() ? (
          <p
            className="mb-6 inline-flex w-fit items-center gap-2.5 rounded-full border border-white/35 bg-pine-night/60 px-5 py-2 font-mono text-xs tracking-[0.18em] text-white/90"
            data-sanity={dataAttribute?.("badge")}
          >
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-accent"
            />
            {badge}
          </p>
        ) : null}

        {/* Title */}
        <h1
          className="mb-6 max-w-[65rem] font-display text-display-hero leading-[0.96] tracking-tight text-cream"
          data-sanity={dataAttribute?.("title")}
          id={headingId}
        >
          <PortableText components={headingComponents} value={title} />
        </h1>

        {/* Body + CTAs row */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-12">
          {/* Full body (desktop) */}
          {body?.length ? (
            <div
              className="hidden max-w-xl text-lg leading-relaxed text-white/85 lg:block"
              data-sanity={dataAttribute?.("body")}
            >
              <PortableText components={simpleRichTextComponents} value={body} />
            </div>
          ) : null}

          {/* Short body (mobile) */}
          {stegaClean(shortBody)?.trim() ? (
            <p
              className="max-w-md text-base leading-normal text-white/85 lg:hidden"
              data-sanity={dataAttribute?.("shortBody")}
            >
              {shortBody}
            </p>
          ) : body?.length ? (
            <div className="max-w-md text-base leading-normal text-white/85 lg:hidden">
              <PortableText components={simpleRichTextComponents} value={body} />
            </div>
          ) : null}

          {/* CTAs */}
          {buttons?.length ? (
            <div
              className="flex flex-none gap-4 lg:ml-auto"
              data-sanity={dataAttribute?.("buttons")}
            >
              {buttons.slice(0, 2).map((button, index) => {
                const href = getSafeLinkHref(button.href);
                const label = stegaClean(button.text) || "Learn more";
                const variant = resolveHomeHeroButtonVariant(
                  button.variant,
                  index,
                );
                const iconName = stegaClean(button.icon?.name)?.trim();
                const iconSvg = stegaClean(button.icon?.svg)?.trim();
                if (!href) return null;

                if (getHomeHeroVideoEmbedUrl(href)) {
                  return (
                    <HomeHeroVideoLightbox
                      buttonKey={button._key}
                      href={href}
                      icon={button.icon}
                      key={button._key}
                      label={label}
                      variant={variant}
                    />
                  );
                }

                return (
                  <Button
                    asChild
                    key={button._key}
                    lift={false}
                    onDark
                    size="hero"
                    variant={variant}
                  >
                    <Link
                      href={href}
                      rel={
                        stegaClean(button.openInNewTab)
                          ? "noopener noreferrer"
                          : undefined
                      }
                      target={
                        stegaClean(button.openInNewTab) ? "_blank" : undefined
                      }
                    >
                      {iconName && iconSvg ? (
                        <NavigationIcon
                          icon={{ name: iconName, svg: iconSvg }}
                        />
                      ) : null}
                      {label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {/* Stats bar */}
      {stats?.length ? (
        <div
          className="relative z-10 flex gap-0 border-t border-white/20 px-content-x"
          data-sanity={dataAttribute?.("stats")}
        >
          {stats.map((stat) => {
            const statPath = `stats[_key=="${stat._key}"]`;
            return (
              <div
                className="flex flex-1 flex-col gap-1 border-l border-white/20 py-5 pl-8 first:border-l-0 first:pl-0"
                key={stat._key}
              >
                <span
                  className="font-display text-xl font-bold leading-none text-cream"
                  data-sanity={dataAttribute?.(`${statPath}.value`)}
                >
                  {stat.value}
                </span>
                <span
                  className="text-[13px] leading-snug text-white/60"
                  data-sanity={dataAttribute?.(`${statPath}.label`)}
                >
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
