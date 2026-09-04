import { createCustomLinkMarkRenderer } from "@/components/portable-text/custom-link-mark";
import { simpleRichTextComponents } from "@/components/simple-rich-text";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getSafeLinkHref } from "@/lib/safe-href";
import { cn } from "@/lib/utils";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { ArrowUpRight, Plus } from "lucide-react";
import { stegaClean } from "next-sanity";
import Link from "next/link";
import styles from "./faq-accordion.module.css";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type FaqAccordionProps = Extract<PageBlock, { _type: "faqAccordion" }> & {
  dataAttribute?: (path: string) => string | undefined;
};

/*
 * FAQ accordion — intro and side link beside the questions.
 *
 * Desktop: 0.4fr sidebar (eyebrow, headline with the script aside, intro,
 * side link) and a 1fr accordion. Phones: intro, accordion, then the link.
 * Cream field by default (trust content lives on cream); the dark field is
 * for pages where the section before it is already cream.
 */

function hasText(value?: string | null) {
  return Boolean(stegaClean(value)?.trim());
}

export default function FaqAccordion({
  _key,
  dataAttribute,
  eyebrow,
  faqs,
  link,
  subtitle,
  title,
  useCreamBackground,
}: FaqAccordionProps) {
  const visibleFaqs =
    faqs?.filter((faq) => stegaClean(faq.title)?.trim()) ?? [];
  if (!title?.length || !visibleFaqs.length) return null;

  const cream = stegaClean(useCreamBackground) !== false;
  const sectionKey = stegaClean(_key);
  const headingId = `faq-accordion-${sectionKey}-title`;
  const defaultValue = visibleFaqs[0]?._key || visibleFaqs[0]?._id || undefined;

  const linkHref = getSafeLinkHref(link?.href);
  const linkText = stegaClean(link?.description)?.trim();
  const linkLabel = stegaClean(link?.title)?.trim();
  const sideLink = linkHref && linkText ? { href: linkHref, text: linkText } : null;

  const headingComponents: PortableTextComponents = {
    block: { normal: ({ children }) => <>{children}</> },
    marks: {
      strong: ({ children }) => <strong>{children}</strong>,
      em: ({ children }) => (
        <em
          className={cn(
            "font-accent not-italic",
            cream ? "text-cedar" : "text-campfire-amber",
          )}
        >
          {children}
        </em>
      ),
    },
  };

  const answerComponents: PortableTextComponents = {
    ...simpleRichTextComponents,
    marks: {
      ...simpleRichTextComponents?.marks,
      customLink: createCustomLinkMarkRenderer(
        cream
          ? "font-medium text-cedar underline decoration-cedar/30 underline-offset-4 hover:text-cedar-deep hover:decoration-cedar-deep"
          : "font-medium text-moss underline decoration-moss/30 underline-offset-4 hover:text-sunlit-moss hover:decoration-sunlit-moss",
      ),
    },
  };

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "scroll-mt-24 py-section",
        cream ? "bg-birch-bark text-pine-night" : "bg-forest-floor text-birch-bark",
      )}
      data-sanity={dataAttribute?.("useCreamBackground")}
      id={`faq-${sectionKey}`}
    >
      <div className="container-content">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)] lg:gap-x-16 lg:gap-y-10 xl:gap-x-24">
          <header className={cn("max-w-[30rem]", styles.reveal)}>
            {hasText(eyebrow) ? (
              <p
                className={cn(
                  "mb-5 text-eyebrow",
                  cream ? "text-cedar" : "text-campfire-amber",
                )}
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
            {hasText(subtitle) ? (
              <p
                className={cn(
                  "mt-6 text-pretty text-[17px] leading-[1.6]",
                  cream ? "text-pine-night/70" : "text-birch-bark/72",
                )}
                data-sanity={dataAttribute?.("subtitle")}
              >
                {subtitle}
              </p>
            ) : null}
          </header>

          <Accordion
            className={cn(
              "w-full border-t lg:row-span-2",
              cream ? "border-pine-night/14" : "border-birch-bark/16",
              styles.reveal,
            )}
            collapsible
            data-sanity={dataAttribute?.("faqs")}
            defaultValue={defaultValue}
            type="single"
          >
            {visibleFaqs.map((faq) => {
              const value = faq._key || faq._id;

              return (
                <AccordionItem
                  className={cn(
                    "border-b",
                    cream ? "border-pine-night/14" : "border-birch-bark/16",
                  )}
                  key={value}
                  value={value}
                >
                  <AccordionTrigger className="group items-center gap-6 py-6 font-display text-title hover:no-underline sm:py-7 sm:text-[24px] [&>svg]:hidden">
                    <span className="text-balance">{faq.title}</span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,color,transform] motion-base group-hover:border-campfire-amber group-data-[state=open]:rotate-45 group-data-[state=open]:border-campfire-amber group-data-[state=open]:bg-campfire-amber group-data-[state=open]:text-pine-night motion-reduce:transition-none",
                        cream ? "border-pine-night/18" : "border-birch-bark/25",
                      )}
                    >
                      <Plus className="size-4" strokeWidth={2} />
                    </span>
                  </AccordionTrigger>
                  {faq.answer?.length ? (
                    <AccordionContent
                      className={cn(
                        "pb-7 text-base",
                        cream ? "text-pine-night/72" : "text-birch-bark/72",
                      )}
                    >
                      <div className="grid max-w-[38rem] gap-4 text-pretty leading-[1.6]">
                        <PortableText
                          components={answerComponents}
                          value={faq.answer}
                        />
                      </div>
                    </AccordionContent>
                  ) : null}
                </AccordionItem>
              );
            })}
          </Accordion>

          {sideLink ? (
            <div
              className={cn("lg:col-start-1 lg:row-start-2 lg:self-start", styles.reveal)}
              data-sanity={dataAttribute?.("link")}
            >
              {linkLabel ? (
                <p
                  className={cn(
                    "text-label",
                    cream ? "text-pine-night/50" : "text-birch-bark/55",
                  )}
                >
                  {linkLabel}
                </p>
              ) : null}
              <Link
                className={cn(
                  "focus-ring mt-3 inline-flex w-fit items-center gap-2 font-semibold transition-colors motion-base motion-reduce:transition-none",
                  cream
                    ? "text-cedar hover:text-cedar-deep"
                    : "text-moss hover:text-sunlit-moss",
                )}
                href={sideLink.href}
                rel={link?.openInNewTab ? "noopener noreferrer" : undefined}
                target={link?.openInNewTab ? "_blank" : undefined}
              >
                {sideLink.text}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
