import { getSafeLinkHref } from "@/lib/safe-href";
import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { stegaClean } from "next-sanity";
import styles from "./feature-cards.module.css";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type FeatureCardsProps = Extract<PageBlock, { _type: "featureCards" }> & {
  dataAttribute?: (path: string) => string | undefined;
};

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

export function getFeatureCardColumnCount(
  cardCount: number,
  singleRowUpToFour = true,
) {
  if (cardCount === 4 && singleRowUpToFour) return 4;
  return cardCount === 3 || cardCount === 5 || cardCount === 6 ? 3 : 2;
}

export default function FeatureCards({
  _key,
  dataAttribute,
  description,
  eyebrow,
  groups,
  title,
}: FeatureCardsProps) {
  if (!title?.length || !groups?.length) return null;

  const headingId = `feature-cards-${stegaClean(_key)}`;
  const numberedGroups = groups.map((group, groupIndex) => ({
    group,
    startNumber: groups
      .slice(0, groupIndex)
      .reduce((total, precedingGroup) => total + (precedingGroup.cards?.length ?? 0), 0),
  }));

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-t-section bg-forest-floor py-section text-birch-bark"
      id={`features-${stegaClean(_key)}`}
    >
      <div className="container-content">
        <header className={cn("mb-14 max-w-3xl", styles.reveal)}>
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

          {hasText(description) ? (
            <p
              className="mt-5 max-w-xl text-pretty text-lg/relaxed text-birch-bark/70"
              data-sanity={dataAttribute?.("description")}
            >
              {description}
            </p>
          ) : null}
        </header>

        <div className="grid gap-16">
          {numberedGroups.map(({ group, startNumber }) => {
            const groupPath = `groups[_key=="${group._key}"]`;

            if (!group.cards?.length || !hasText(group.heading)) return null;

            const columnCount = getFeatureCardColumnCount(
              group.cards.length,
              stegaClean(group.singleRowUpToFour) !== false,
            );

            return (
              <section
                aria-labelledby={`${headingId}-${group._key}`}
                className={styles.reveal}
                data-sanity={dataAttribute?.(
                  `${groupPath}.singleRowUpToFour`,
                )}
                key={group._key}
              >
                <header className="mb-6 max-w-2xl">
                  <h3
                    className="font-display text-3xl font-extrabold tracking-tight"
                    data-sanity={dataAttribute?.(`${groupPath}.heading`)}
                    id={`${headingId}-${group._key}`}
                  >
                    {group.heading}
                  </h3>
                  {hasText(group.description) ? (
                    <p
                      className="mt-2 text-pretty text-base/relaxed text-birch-bark/65"
                      data-sanity={dataAttribute?.(`${groupPath}.description`)}
                    >
                      {group.description}
                    </p>
                  ) : null}
                </header>

                <ol
                  className={cn(
                    "grid list-none gap-px overflow-hidden rounded-lg bg-birch-bark/15 p-0 md:grid-cols-2",
                    columnCount === 3 && "lg:grid-cols-3",
                    columnCount === 4 && "lg:grid-cols-4",
                  )}
                  data-sanity={dataAttribute?.(`${groupPath}.cards`)}
                >
                  {group.cards.map((card, cardIndex) => {
                    const cardPath = `${groupPath}.cards[_key=="${card._key}"]`;
                    const href = getSafeLinkHref(card.link?.href);
                    const linkText = stegaClean(card.link?.text)?.trim();
                    const cardTitle = stegaClean(card.title)?.trim();
                    const cardText = stegaClean(card.text)?.trim();
                    const number = String(startNumber + cardIndex + 1).padStart(
                      2,
                      "0",
                    );

                    if (!cardTitle || !cardText || !href || !linkText) return null;

                    return (
                      <li
                        className="group/card flex min-w-0 flex-col bg-forest-floor transition-colors duration-300 hover:bg-white/5"
                        key={card._key}
                      >
                        <div
                          className="relative aspect-video overflow-hidden bg-forest-panel"
                          data-sanity={dataAttribute?.(`${cardPath}.image`)}
                        >
                          {card.image?.asset?._id ? (
                            <Image
                              alt={stegaClean(card.image.alt) || ""}
                              blurDataURL={
                                card.image.asset.metadata?.lqip || undefined
                              }
                              className="object-cover saturate-90 transition-[scale,filter] duration-300 group-hover/card:scale-[1.03] group-hover/card:saturate-100 motion-reduce:transition-none"
                              fill
                              placeholder={
                                card.image.asset.metadata?.lqip
                                  ? "blur"
                                  : undefined
                              }
                              sizes={
                                columnCount === 4
                                  ? "(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                                  : columnCount === 3
                                  ? "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                                  : "(min-width: 768px) 50vw, 100vw"
                              }
                              src={urlFor(card.image).width(1000).url()}
                            />
                          ) : null}
                          <span
                            aria-hidden="true"
                            className="absolute left-5 top-5 rounded-pill bg-pine-night/55 px-3 py-1.5 font-mono text-xs tracking-[0.2em] text-birch-bark backdrop-blur-sm transition-colors duration-300 group-hover/card:text-campfire-amber"
                          >
                            {number}
                          </span>
                        </div>

                        <div className="flex flex-1 flex-col p-6">
                          <h4
                            className="font-display text-2xl font-extrabold tracking-tight"
                            data-sanity={dataAttribute?.(`${cardPath}.title`)}
                          >
                            {card.title}
                          </h4>
                          <p
                            className="mt-3 text-pretty text-base/relaxed text-birch-bark/65"
                            data-sanity={dataAttribute?.(`${cardPath}.text`)}
                          >
                            {card.text}
                          </p>
                          <Link
                            className="focus-ring mt-5 inline-flex w-fit items-center gap-2 font-semibold text-moss hover:text-sunlit-moss"
                            data-sanity={dataAttribute?.(`${cardPath}.link`)}
                            href={href}
                            rel={
                              stegaClean(card.link?.openInNewTab)
                                ? "noopener noreferrer"
                                : undefined
                            }
                            target={
                              stegaClean(card.link?.openInNewTab)
                                ? "_blank"
                                : undefined
                            }
                          >
                            <span
                              data-sanity={dataAttribute?.(
                                `${cardPath}.link.text`,
                              )}
                            >
                              {card.link?.text}
                            </span>
                            <ArrowRight
                              aria-hidden="true"
                              className="size-4 transition-transform duration-200 group-hover/card:translate-x-1 motion-reduce:transition-none"
                            />
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
