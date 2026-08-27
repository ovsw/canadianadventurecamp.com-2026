import { getSafeLinkHref } from "@/lib/safe-href";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { ArrowUpRight, Milestone } from "lucide-react";
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
      <em className="font-accent text-campfire-amber not-italic">
        {children}
      </em>
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
    const items = (row.items ?? []).filter((item) => hasText(item.label));

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

            return (
              <li
                className={`relative grid min-h-52 overflow-hidden border-b border-pine-night/15 px-5 py-10 last:border-b-0 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.4fr)] lg:items-center lg:gap-12 lg:py-8 ${styles.reveal}`}
                key={row._key}
              >
                <h3
                  className="relative z-10 font-display text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl"
                  data-sanity={dataAttribute?.(`${rowPath}.title`)}
                >
                  {row.title}
                </h3>

                <div className="relative z-10 mt-8 lg:mt-0">
                  <ul
                    className="grid list-none gap-3 p-0"
                    data-sanity={dataAttribute?.(`${rowPath}.items`)}
                  >
                    {items.map((item) => {
                      const itemPath = `${rowPath}.items[_key=="${item._key}"]`;

                      return (
                        <li className="flex items-center gap-3" key={item._key}>
                          <Milestone
                            aria-hidden="true"
                            className="size-5 shrink-0 text-moss"
                          />
                          <span
                            data-sanity={dataAttribute?.(`${itemPath}.label`)}
                          >
                            {item.label}
                          </span>
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
