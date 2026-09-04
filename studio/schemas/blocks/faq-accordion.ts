import { MessageCircle } from "lucide-react";
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
  name: "faqAccordion",
  title: "FAQ Section",
  type: "object",
  icon: MessageCircle,
  description:
    "Intro and a side link beside an accordion of selected FAQ documents. Cream by default; switch to the dark field when the section before it is cream.",
  initialValue: {
    useCreamBackground: true,
    eyebrow: "FAQ",
    subtitle: "Replace this sample with the questions visitors ask most often.",
  },
  fields: [
    defineField({
      name: "useCreamBackground",
      title: "Cream background",
      type: "boolean",
      description:
        "On: cream field (Birch Bark). Off: dark forest field. Alternate with the sections around it.",
      initialValue: true,
    }),
    defineField({
      name: "eyebrow",
      type: "string",
      description: "Optional short label above the heading.",
    }),
    defineField({
      name: "title",
      title: "Heading",
      type: "minimalRichText",
      description: "Use italic for the phrase that gets the handwritten style.",
      validation: (rule) => rule.required().max(1),
    }),
    defineField({
      name: "subtitle",
      type: "text",
      rows: 2,
      title: "Intro line",
      description: "Optional. One or two sentences under the heading.",
    }),
    defineField({
      name: "link",
      title: "Side link",
      type: "object",
      description:
        'Optional. A small label and a link under the intro, e.g. "Still unsure?" / "Talk to the Directors".',
      fields: [
        defineField({
          name: "title",
          type: "string",
          title: "Label",
          description: 'Small line above the link, e.g. "Still unsure?"',
        }),
        defineField({
          name: "description",
          type: "string",
          title: "Link text",
          description: 'The link itself, e.g. "Talk to the Directors".',
        }),
        defineField({
          name: "url",
          type: "customUrl",
          title: "Destination",
        }),
      ],
    }),
    defineField({
      name: "faqs",
      type: "array",
      title: "FAQs",
      description: "Select the FAQ items to display in this accordion",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "faq" }],
          options: { disableNew: true },
        }),
      ],
      validation: (rule) => [rule.required(), rule.unique()],
    }),
  ],
  preview: {
    select: { title: "title", faqs: "faqs" },
    prepare: ({ title, faqs }) => {
      const count = Array.isArray(faqs) ? faqs.length : 0;
      return {
        title: richTextToPlainText(title) || "Untitled FAQ Section",
        subtitle: `FAQ Section · ${count} ${count === 1 ? "question" : "questions"}`,
      };
    },
  },
});
