import { NavigationIcon } from "@/components/header/navigation-icon";
import { createCustomLinkMarkRenderer } from "@/components/portable-text/custom-link-mark";
import { simpleRichTextComponents } from "@/components/simple-rich-text";
import { getSafeLinkHref } from "@/lib/safe-href";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import { stegaClean } from "next-sanity";
import styles from "./stacked-feature-rows.module.css";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type StackedFeatureRowsProps = Extract<
  PageBlock,
  { _type: "stackedFeatureRows" }
> & {
  dataAttribute?: (path: string) => string | undefined;
};

const headingComponents: PortableTextComponents = {
  block: { normal: ({ children }) => <>{children}</> },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => (
      <em className="font-accent text-cedar not-italic">
        {children}
      </em>
    ),
  },
};

const rowItemComponents: PortableTextComponents = {
  ...simpleRichTextComponents,
  marks: {
    ...simpleRichTextComponents?.marks,
    customLink: createCustomLinkMarkRenderer(
      "font-medium text-cedar underline decoration-cedar/30 underline-offset-4 hover:text-cedar-deep hover:decoration-cedar-deep",
    ),
  },
};

function hasText(value?: string | null) {
  return Boolean(stegaClean(value)?.trim());
}

export default function StackedFeatureRows({
  _key,
  dataAttribute,
  eyebrow,
  rows,
  title,
}: StackedFeatureRowsProps) {
  if (!title?.length || !rows?.length) return null;

  const renderableRows = rows.flatMap((row) => {
    const href = getSafeLinkHref(row.link?.href);
    const items = (row.items ?? []).filter((item) => item.body?.length);

    if (
      !hasText(row.title) ||
      !hasText(row.link?.text) ||
      !href ||
      !items.length
    ) {
      return [];
    }

    return [{ href, items, row }];
  });

  if (!renderableRows.length) return null;

  const headingId = `stacked-feature-rows-${stegaClean(_key)}`;

  return (
    <section
      aria-labelledby={headingId}
      className="bg-birch-bark py-section text-pine-night"
      id={`stacked-features-${stegaClean(_key)}`}
    >
      <div className="container-content">
        <header className="grid gap-8 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)] lg:gap-16">
          {hasText(eyebrow) ? (
            <p
              className="pt-2 text-eyebrow text-pine-night/55"
              data-sanity={dataAttribute?.("eyebrow")}
            >
              {eyebrow}
            </p>
          ) : (
            <span aria-hidden="true" />
          )}

          <h2
            className="max-w-4xl text-balance font-display text-headline"
            data-sanity={dataAttribute?.("title")}
            id={headingId}
          >
            <PortableText components={headingComponents} value={title} />
          </h2>
        </header>

        <ol
          className="mt-16 list-none p-0"
          data-sanity={dataAttribute?.("rows")}
        >
          {renderableRows.map(({ href, items, row }) => {
            const rowPath = `rows[_key=="${row._key}"]`;
            const iconName = stegaClean(row.icon?.name)?.trim();
            const iconSvg = stegaClean(row.icon?.svg)?.trim() || null;

            return (
              <li
                className={`relative grid min-h-52 overflow-hidden border-b border-pine-night/15 px-5 py-10 last:border-b-0 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.4fr)] lg:items-center lg:gap-12 lg:py-8 ${styles.reveal}`}
                key={row._key}
              >
                <div className="relative z-10 flex items-start gap-4">
                  {iconName && iconSvg ? (
                    <span
                      aria-hidden="true"
                      className="mt-1.5 flex size-10 shrink-0 items-center justify-center text-cedar [&_svg]:size-10"
                      data-sanity={dataAttribute?.(`${rowPath}.icon`)}
                    >
                      <NavigationIcon icon={{ name: iconName, svg: iconSvg }} />
                    </span>
                  ) : null}
                  <h3
                    className="font-display text-headline"
                    data-sanity={dataAttribute?.(`${rowPath}.title`)}
                  >
                    {row.title}
                  </h3>
                </div>

                <div className="relative z-10 mt-8 lg:mt-0">
                  <ul
                    className="grid list-none gap-3 p-0"
                    data-sanity={dataAttribute?.(`${rowPath}.items`)}
                  >
                    {items.map((item) => {
                      const itemPath = `${rowPath}.items[_key=="${item._key}"]`;

                      return (
                        <li className="flex items-center gap-3" key={item._key}>
                          <Check
                            aria-hidden="true"
                            className="mt-0.5 size-5 shrink-0 text-cedar"
                          />
                          <div
                            className="grid min-w-0 gap-2"
                            data-sanity={dataAttribute?.(`${itemPath}.body`)}
                          >
                            <PortableText
                              components={rowItemComponents}
                              value={item.body}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  <Link
                    className="focus-ring mt-6 inline-flex w-fit items-center gap-2 font-semibold text-ember-red hover:text-campfire-amber-deep"
                    data-sanity={dataAttribute?.(`${rowPath}.link`)}
                    href={href}
                    rel={
                      stegaClean(row.link?.openInNewTab)
                        ? "noopener noreferrer"
                        : undefined
                    }
                    target={
                      stegaClean(row.link?.openInNewTab) ? "_blank" : undefined
                    }
                  >
                    <span
                      data-sanity={dataAttribute?.(`${rowPath}.link.text`)}
                    >
                      {row.link?.text}
                    </span>
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
