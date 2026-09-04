import { Button } from "@/components/ui/button";
import { getSafeLinkHref } from "@/lib/safe-href";
import { cn } from "@/lib/utils";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { stegaClean } from "next-sanity";
import Link from "next/link";
import type { ComponentProps } from "react";
import styles from "./cta-banner.module.css";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type CtaBannerBlock = Extract<PageBlock, { _type: "ctaBanner" }>;

type CtaBannerProps = CtaBannerBlock & {
  dataAttribute?: (path: string) => string | undefined;
};

/*
 * CTA Banner — the handoff block, in two weights.
 *
 * Closing band: the last thing before the footer. Forest Floor field with the
 * 44px tucked top corners, headline left, the two actions right, one amber
 * primary and one ghost. Nudge: a quiet Light card between sections on the
 * cream field, title-sized, for "not sure yet?" moments. Buttons stack on
 * phones in both weights. Both reveal on scroll; reduced motion skips it.
 */

type ButtonVariant = NonNullable<ComponentProps<typeof Button>["variant"]>;

/** An editor's stored button variant wins when it is one we render. */
function resolveCtaButtonVariant(
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
  return index === 0 ? "default" : "outline";
}

export function resolveCtaBannerVariant(variant?: string | null) {
  return stegaClean(variant) === "nudge" ? "nudge" : "closing";
}

function CtaButtons({
  buttons,
  dataAttribute,
  onDark,
}: Readonly<{
  buttons: CtaBannerProps["buttons"];
  dataAttribute?: CtaBannerProps["dataAttribute"];
  onDark: boolean;
}>) {
  const actions = (buttons ?? []).slice(0, 2).flatMap((button, index) => {
    const href = getSafeLinkHref(button.href);
    if (!href) return [];
    return [
      {
        href,
        key: button._key ?? `${href}-${index}`,
        label: stegaClean(button.text)?.trim() || "Learn more",
        openInNewTab: Boolean(stegaClean(button.openInNewTab)),
        path: `buttons[_key=="${button._key}"]`,
        variant: resolveCtaButtonVariant(button.variant, index),
      },
    ];
  }).map((action, index) => ({ ...action, primary: index === 0 }));

  if (!actions.length) return null;

  return (
    <div
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
      data-sanity={dataAttribute?.("buttons")}
    >
      {actions.map((action) => (
        <Button
          asChild
          className="w-full sm:w-auto"
          key={action.key}
          onDark={onDark}
          variant={action.variant}
        >
          <Link
            data-sanity={dataAttribute?.(action.path)}
            href={action.href}
            rel={action.openInNewTab ? "noopener noreferrer" : undefined}
            target={action.openInNewTab ? "_blank" : undefined}
          >
            {action.label}
            {action.openInNewTab ? (
              <ArrowUpRight aria-hidden="true" className="size-4" />
            ) : action.primary ? (
              <ArrowRight aria-hidden="true" className="size-4" />
            ) : null}
          </Link>
        </Button>
      ))}
    </div>
  );
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

  const cleanKey = stegaClean(_key);
  const titleId = `cta-banner-${cleanKey}-title`;
  const cleanDescription = stegaClean(description)?.trim();
  const weight = resolveCtaBannerVariant(variant);

  if (weight === "nudge") {
    return (
      <section
        aria-labelledby={titleId}
        className="bg-background py-10 text-pine-night sm:py-14"
        id={`cta-banner-${cleanKey}`}
      >
        <div className="container-content">
          <div
            className={cn(
              "grid gap-6 rounded-lg border border-pine-night/10 bg-birch-bark-bright px-6 py-7 sm:px-[30px] sm:py-[34px] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10",
              styles.reveal,
            )}
          >
            <div className="grid gap-2">
              <h2
                className="text-balance font-display text-2xl font-extrabold leading-tight tracking-[-0.01em] sm:text-3xl"
                data-sanity={dataAttribute?.("title")}
                id={titleId}
              >
                {title}
              </h2>
              {cleanDescription ? (
                <p
                  className="max-w-xl text-pretty text-base/relaxed text-pine-night/70"
                  data-sanity={dataAttribute?.("description")}
                >
                  {description}
                </p>
              ) : null}
            </div>
            <CtaButtons buttons={buttons} dataAttribute={dataAttribute} onDark={false} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "rounded-t-section bg-forest-floor py-section text-birch-bark",
      )}
      id={`cta-banner-${cleanKey}`}
    >
      <div
        className={cn(
          "container-content grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-14",
          styles.reveal,
        )}
      >
        <div className="lg:col-span-8">
          <h2
            className="max-w-3xl text-balance font-display text-headline"
            data-sanity={dataAttribute?.("title")}
            id={titleId}
          >
            {title}
          </h2>
          {cleanDescription ? (
            <p
              className="mt-6 max-w-xl text-pretty text-lg/relaxed text-birch-bark/75"
              data-sanity={dataAttribute?.("description")}
            >
              {description}
            </p>
          ) : null}
        </div>
        <div className="lg:col-span-4 lg:flex lg:justify-end">
          <CtaButtons buttons={buttons} dataAttribute={dataAttribute} onDark />
        </div>
      </div>
    </section>
  );
}
