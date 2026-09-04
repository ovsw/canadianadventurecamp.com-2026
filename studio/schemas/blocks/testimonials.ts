import { MessageSquareQuote } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

const richTextToPlainText = (value: unknown): string => {
  if (!Array.isArray(value)) return "";
  return value
    .map((block) => {
      const children = (block as { children?: { text?: string }[] })?.children;
      if (!Array.isArray(children)) return "";
      return children.map((child) => child?.text ?? "").join("");
    })
    .join(" ")
    .trim();
};

export default defineType({
  name: "testimonials",
  title: "Testimonials",
  type: "object",
  icon: MessageSquareQuote,
  description:
    "Quotes from selected Testimonial documents. Three cards on desktop, one card wide with swipe on phones.",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: "Short label shown above the heading.",
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "minimalRichText",
      description: "Use italic for the phrase that gets the handwritten style.",
      validation: (rule) => rule.required().max(1),
    }),
    defineField({
      name: "testimonials",
      title: "Testimonials",
      type: "array",
      description: "The quotes to show, in the order listed here.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "testimonial" }],
        }),
      ],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .unique()
          .error("Add at least one testimonial to this section."),
    }),
  ],
  preview: {
    select: { eyebrow: "eyebrow", heading: "heading", testimonials: "testimonials" },
    prepare: ({ eyebrow, heading, testimonials }) => {
      const count = Array.isArray(testimonials) ? testimonials.length : 0;
      return {
        title: richTextToPlainText(heading) || eyebrow || "Testimonials",
        subtitle: `Testimonials · ${count} ${count === 1 ? "quote" : "quotes"}`,
      };
    },
  },
});
