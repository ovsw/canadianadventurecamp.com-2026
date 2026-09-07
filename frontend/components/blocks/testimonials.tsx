import { simpleRichTextComponents } from "@/components/simple-rich-text";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import {
  PortableText,
  toPlainText,
  type PortableTextComponents,
} from "@portabletext/react";
import { stegaClean } from "next-sanity";
import TestimonialsCarousel from "./testimonials-carousel";
import styles from "./testimonials.module.css";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type TestimonialsBlock = Extract<PageBlock, { _type: "testimonials" }>;
type TestimonialReference = NonNullable<TestimonialsBlock["testimonials"]>[number];
type TestimonialDocument = NonNullable<TestimonialReference["document"]>;

type TestimonialsProps = TestimonialsBlock & {
  dataAttribute?: (path: string) => string | undefined;
  testimonialDataAttribute?: (
    documentId: string,
    path: string,
  ) => string | undefined;
};

/** Heading rich text: italic gets the handwritten cedar accent (cream field). */
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

function TestimonialCard({
  referenceDataAttribute,
  testimonial,
  testimonialDataAttribute,
}: Readonly<{
  referenceDataAttribute?: string;
  testimonial: TestimonialDocument;
  testimonialDataAttribute?: TestimonialsProps["testimonialDataAttribute"];
}>) {
  const role = stegaClean(testimonial.title)?.trim();
  const origin = stegaClean(testimonial.origin)?.trim();

  return (
    <figure
      className={styles.quote}
      data-sanity={referenceDataAttribute}
    >
      <span
        aria-hidden="true"
        className={styles.quoteMark}
      >
        &ldquo;
      </span>
      <blockquote
        className={styles.quoteBody}
        data-sanity={testimonialDataAttribute?.(testimonial._id, "body")}
      >
        <PortableText
          components={simpleRichTextComponents}
          value={testimonial.body ?? []}
        />
      </blockquote>
      <figcaption className={styles.attribution}>
        <span
          className="font-display text-lg font-bold leading-snug"
          data-sanity={testimonialDataAttribute?.(testimonial._id, "name")}
        >
          {testimonial.name}
        </span>
        {role || origin ? (
          <span className="text-label leading-relaxed opacity-80">
            {role ? (
              <span data-sanity={testimonialDataAttribute?.(testimonial._id, "title")}>
                {testimonial.title}
              </span>
            ) : null}
            {role && origin ? <span aria-hidden="true"> · </span> : null}
            {origin ? (
              <span data-sanity={testimonialDataAttribute?.(testimonial._id, "origin")}>
                {testimonial.origin}
              </span>
            ) : null}
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}

export default function Testimonials({
  _key,
  dataAttribute,
  eyebrow,
  heading,
  testimonialDataAttribute,
  testimonials,
}: TestimonialsProps) {
  const cards = (testimonials ?? []).flatMap((reference, index) => {
    const document = reference.document;
    if (!document || !hasText(document.name) || !document.body?.length) {
      return [];
    }
    if (!hasText(toPlainText(document.body))) return [];

    const path = reference._key
      ? `testimonials[_key=="${reference._key}"]`
      : `testimonials[${index}]`;

    return [{ document, key: reference._key ?? document._id, path }];
  });

  if (!heading?.length || !cards.length) return null;

  const headingText = stegaClean(toPlainText(heading)).trim();
  const headingId = `testimonials-${stegaClean(_key)}-title`;

  return (
    <section
      aria-labelledby={headingId}
      className="bg-birch-bark-bright py-section text-pine-night"
      id={`testimonials-${stegaClean(_key)}`}
    >
      <div className="container-content grid gap-12 lg:gap-16">
        <header className="grid max-w-3xl gap-5">
          {hasText(eyebrow) ? (
            <p
              className="text-eyebrow text-cedar"
              data-sanity={dataAttribute?.("eyebrow")}
            >
              {eyebrow}
            </p>
          ) : null}
          <h2
            className="text-balance font-display text-headline"
            data-sanity={dataAttribute?.("heading")}
            id={headingId}
          >
            <PortableText components={headingComponents} value={heading} />
          </h2>
        </header>

        <TestimonialsCarousel
          count={cards.length}
          dataSanity={dataAttribute?.("testimonials")}
          label={headingText ? `Testimonials: ${headingText}` : "Testimonials"}
        >
          {cards.map(({ document, key, path }) => (
            <TestimonialCard
              key={key}
              referenceDataAttribute={dataAttribute?.(path)}
              testimonial={document}
              testimonialDataAttribute={testimonialDataAttribute}
            />
          ))}
        </TestimonialsCarousel>
      </div>
    </section>
  );
}
