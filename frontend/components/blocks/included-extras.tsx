import { getSafeLinkHref } from "@/lib/safe-href";
import { cn } from "@/lib/utils";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import Link from "next/link";
import { stegaClean } from "next-sanity";
import styles from "./included-extras.module.css";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type IncludedExtrasProps = Extract<PageBlock, { _type: "includedExtras" }> & {
  dataAttribute?: (path: string) => string | undefined;
};

/*
 * Included & Extras — a two-plan comparison on a cream field.
 *
 * Desktop: two cards side by side. The included card is a cream check list;
 * the extras card is a pine-night panel of priced rows, price on the right
 * in the mono legend. Phones: the cards stack, price stays on the row.
 */

const headingComponents: PortableTextComponents = {
  block: { normal: ({ children }) => <>{children}</> },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => (
      <em className="font-accent text-cedar not-italic">{children}</em>
    ),
  },
};

function hasText(value?: string | null) {
  return Boolean(stegaClean(value)?.trim());
}

export default function IncludedExtras({
  _key,
  dataAttribute,
  extras,
  eyebrow,
  footnote,
  included,
  intro,
  title,
}: IncludedExtrasProps) {
  const includedItems = (included?.items ?? []).filter((item) =>
    hasText(item.label),
  );
  const extraItems = (extras?.items ?? []).filter(
    (item) => hasText(item.label) && hasText(item.price),
  );

  if (
    !title?.length ||
    !hasText(included?.heading) ||
    !hasText(extras?.heading) ||
    includedItems.length < 2 ||
    extraItems.length < 1
  ) {
    return null;
  }

  const sectionKey = stegaClean(_key);
  const headingId = `included-extras-${sectionKey}-title`;
  const includedId = `included-extras-${sectionKey}-included`;
  const extrasId = `included-extras-${sectionKey}-extras`;

  return (
    <section
      aria-labelledby={headingId}
      className="bg-birch-bark py-section text-pine-night"
      id={`included-extras-${sectionKey}`}
    >
      <div className="container-content">
        <header className={cn("max-w-3xl", styles.reveal)}>
          {hasText(eyebrow) ? (
            <p
              className="mb-5 text-eyebrow text-cedar"
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
              className="mt-6 max-w-xl text-pretty text-[17px] leading-[1.6] text-pine-night/70"
              data-sanity={dataAttribute?.("intro")}
            >
              {intro}
            </p>
          ) : null}
        </header>

        <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Included: cream card, check list */}
          <section
            aria-labelledby={includedId}
            className={cn(
              "flex flex-col rounded-[1.625rem] border border-pine-night/10 bg-birch-bark-bright p-7 sm:p-10",
              styles.reveal,
            )}
            data-sanity={dataAttribute?.("included")}
          >
            <p className="text-label text-cedar">Included</p>
            <h3
              className="mt-4 font-display text-[1.75rem] font-extrabold leading-[1.05] tracking-tight sm:text-[2rem]"
              data-sanity={dataAttribute?.("included.heading")}
              id={includedId}
            >
              {included?.heading}
            </h3>
            {hasText(included?.note) ? (
              <p
                className="mt-2 text-[15px] leading-snug text-pine-night/65"
                data-sanity={dataAttribute?.("included.note")}
              >
                {included?.note}
              </p>
            ) : null}
            <ul
              className="mt-8 divide-y divide-pine-night/10 border-t border-pine-night/10"
              data-sanity={dataAttribute?.("included.items")}
            >
              {includedItems.map((item) => (
                <li
                  className="flex items-start gap-4 py-4"
                  data-sanity={dataAttribute?.(
                    `included.items[_key=="${item._key}"]`,
                  )}
                  key={item._key}
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-cedar text-birch-bark"
                  >
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[17px] font-semibold leading-snug">
                      {item.label}
                    </span>
                    {hasText(item.detail) ? (
                      <span className="mt-1 block text-[15px] leading-snug text-pine-night/65">
                        {item.detail}
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Extras: pine panel, priced rows */}
          <section
            aria-labelledby={extrasId}
            className={cn(
              "flex flex-col rounded-[1.625rem] bg-pine-night p-7 text-birch-bark sm:p-10",
              styles.reveal,
            )}
            data-sanity={dataAttribute?.("extras")}
          >
            <p className="text-label text-campfire-amber">Extra</p>
            <h3
              className="mt-4 font-display text-[1.75rem] font-extrabold leading-[1.05] tracking-tight sm:text-[2rem]"
              data-sanity={dataAttribute?.("extras.heading")}
              id={extrasId}
            >
              {extras?.heading}
            </h3>
            {hasText(extras?.note) ? (
              <p
                className="mt-2 text-[15px] leading-snug text-birch-bark/65"
                data-sanity={dataAttribute?.("extras.note")}
              >
                {extras?.note}
              </p>
            ) : null}
            <ul
              className="mt-8 divide-y divide-birch-bark/14 border-t border-birch-bark/14"
              data-sanity={dataAttribute?.("extras.items")}
            >
              {extraItems.map((item) => {
                const itemPath = `extras.items[_key=="${item._key}"]`;
                const href = getSafeLinkHref(item.link?.href);
                const linkText = stegaClean(item.link?.text)?.trim();
                const link = href && linkText ? { href, text: linkText } : null;

                return (
                  <li
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-4 py-4"
                    data-sanity={dataAttribute?.(itemPath)}
                    key={item._key}
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-birch-bark/30 text-birch-bark"
                    >
                      <Plus className="size-3.5" strokeWidth={2.5} />
                    </span>
                    <span className="min-w-0">
                      <span
                        className="block text-[17px] font-semibold leading-snug"
                        data-sanity={dataAttribute?.(`${itemPath}.label`)}
                      >
                        {item.label}
                      </span>
                      {hasText(item.detail) ? (
                        <span
                          className="mt-1 block text-[15px] leading-snug text-birch-bark/65"
                          data-sanity={dataAttribute?.(`${itemPath}.detail`)}
                        >
                          {item.detail}
                        </span>
                      ) : null}
                      {link ? (
                        <Link
                          className="focus-ring mt-2 inline-flex items-center gap-1.5 text-[15px] font-semibold text-moss transition-colors hover:text-sunlit-moss motion-reduce:transition-none"
                          data-sanity={dataAttribute?.(`${itemPath}.link`)}
                          href={link.href}
                          rel={
                            stegaClean(item.link?.openInNewTab)
                              ? "noopener noreferrer"
                              : undefined
                          }
                          target={
                            stegaClean(item.link?.openInNewTab)
                              ? "_blank"
                              : undefined
                          }
                        >
                          {link.text}
                          <ArrowUpRight aria-hidden="true" className="size-4" />
                        </Link>
                      ) : null}
                    </span>
                    <span
                      className="whitespace-nowrap pt-1 text-right font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-birch-bark/85"
                      data-sanity={dataAttribute?.(`${itemPath}.price`)}
                    >
                      {item.price}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {hasText(footnote) ? (
          <p
            className="mt-6 max-w-3xl text-sm leading-relaxed text-pine-night/60"
            data-sanity={dataAttribute?.("footnote")}
          >
            {footnote}
          </p>
        ) : null}
      </div>
    </section>
  );
}
