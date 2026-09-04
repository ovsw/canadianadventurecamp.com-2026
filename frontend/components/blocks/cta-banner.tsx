import { Button } from "@/components/ui/button";
import { getSafeLinkHref } from "@/lib/safe-href";
import { cn } from "@/lib/utils";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import Link from "next/link";
import styles from "./cta-banner.module.css";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type CtaBannerBlock = Extract<PageBlock, { _type: "ctaBanner" }>;

type CtaBannerProps = CtaBannerBlock & {
  dataAttribute?: (path: string) => string | undefined;
};

/*
 * Call to action, two weights of one design.
 *
 * Closing: a full Pine Night band with the envelope tuck (rounded top
 * corners) that ends a page. Headline left, actions right on desktop;
 * stacked on phones.
 *
 * Nudge: a Forest Panel card on a Forest Floor field with shorter padding.
 * A quiet in-page prompt (the fit quiz) between two sections. Same grid,
 * smaller type.
 *
 * One Fire Rule: the first button is the only amber on the band. The second
 * button is the ghost-on-dark outline.
 */

function hasText(value?: string | null) {
  return Boolean(stegaClean(value)?.trim());
}

export default function CtaBanner({
  _key,
  buttons,
  dataAttribute,
  description,
  title,
  variant,
}: CtaBannerProps) {
  if (!title) return null;

  const sectionKey = stegaClean(_key);
  const titleId = `cta-banner-${sectionKey}-title`;
  const isNudge = stegaClean(variant) === "nudge";

  const links = (buttons ?? []).flatMap((button, index) => {
    const href = getSafeLinkHref(button.href);
    if (!href) return [];
    return [
      {
        href,
        key: button._key || `${href}-${index}`,
        label: stegaClean(button.text)?.trim() || "Learn more",
        openInNewTab: stegaClean(button.openInNewTab) === true,
        path: button._key ? `buttons[_key=="${button._key}"]` : `buttons[${index}]`,
      },
    ];
  });

  const actions = links.length ? (
    <div
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end"
      data-sanity={dataAttribute?.("buttons")}
    >
      {links.slice(0, 2).map((button, index) => (
        <Button
          asChild
          key={button.key}
          onDark
          size={isNudge ? "default" : "hero"}
          variant={index === 0 ? "primary" : "outline"}
        >
          <Link
            data-sanity={dataAttribute?.(button.path)}
            href={button.href}
            rel={button.openInNewTab ? "noopener noreferrer" : undefined}
            target={button.openInNewTab ? "_blank" : undefined}
          >
            {button.label}
          </Link>
        </Button>
      ))}
    </div>
  ) : null;

  if (isNudge) {
    return (
      <section
        aria-labelledby={titleId}
        className="bg-forest-floor py-16 text-birch-bark lg:py-24"
        id={`cta-banner-${sectionKey}`}
      >
        <div className="container-content">
          <div
            className={cn(
              "grid gap-8 rounded-xl border border-birch-bark/12 bg-forest-panel px-7 py-9 sm:px-10 sm:py-11 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-14",
              styles.reveal,
            )}
          >
            <div className="max-w-[38rem]">
              <h2
                className="text-balance font-display text-[1.75rem] font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-[2.125rem]"
                data-sanity={dataAttribute?.("title")}
                id={titleId}
              >
                {title}
              </h2>
              {hasText(description) ? (
                <p
                  className="mt-3 text-pretty text-[15px] leading-[1.55] text-birch-bark/72 sm:text-base"
                  data-sanity={dataAttribute?.("description")}
                >
                  {description}
                </p>
              ) : null}
            </div>
            {actions}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby={titleId}
      className="rounded-t-section bg-pine-night py-section text-birch-bark"
      id={`cta-banner-${sectionKey}`}
    >
      <div
        className={cn(
          "container-content grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16",
          styles.reveal,
        )}
      >
        <div className="max-w-[40rem]">
          <h2
            className="text-balance font-display text-headline"
            data-sanity={dataAttribute?.("title")}
            id={titleId}
          >
            {title}
          </h2>
          {hasText(description) ? (
            <p
              className="mt-6 max-w-[34rem] text-pretty text-[17px] leading-[1.6] text-birch-bark/72"
              data-sanity={dataAttribute?.("description")}
            >
              {description}
            </p>
          ) : null}
        </div>
        {actions}
      </div>
    </section>
  );
}
