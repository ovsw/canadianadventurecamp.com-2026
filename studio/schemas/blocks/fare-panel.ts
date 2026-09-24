import { Ticket } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionBackgroundField } from "./shared/section-background";

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

const fare = defineArrayMember({
  name: "farePanelFare",
  title: "Fare",
  type: "object",
  fields: [
    defineField({
      name: "name",
      type: "string",
      description: 'The switch label, e.g. "Round trip" or "One way". Keep it to two or three words.',
      validation: (rule) => rule.required().max(24),
    }),
    defineField({
      name: "price",
      type: "string",
      description: 'The number as written, e.g. "$265".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "unit",
      type: "string",
      description: 'Shown beside the number, e.g. "CAD, plus HST".',
    }),
    defineField({
      name: "note",
      type: "string",
      description: 'One line under the price box for this fare, e.g. "Toronto or Huntsville to the dock and back".',
    }),
  ],
  preview: { select: { title: "name", subtitle: "price" } },
});

const fact = defineArrayMember({
  name: "farePanelFact",
  title: "Fact",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      description: 'What the fare includes, e.g. "CAC staff on board, there and back".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "detail",
      type: "string",
      description: "Optional one-line note under the label.",
    }),
  ],
  preview: { select: { title: "label", subtitle: "detail" } },
});

export default defineType({
  name: "farePanel",
  title: "Fare Panel",
  type: "object",
  icon: Ticket,
  description:
    "One offer, split in two: a dark art panel with the heading beside a price box with a fare switch, a check list, and one button.",
  fields: [
    sectionBackgroundField,
    defineField({
      name: "eyebrow",
      type: "string",
      description: "Optional short label above the heading inside the panel.",
    }),
    defineField({
      name: "title",
      title: "Heading",
      type: "minimalRichText",
      description: "Shown inside the art panel. Use italic for the phrase that gets the handwritten style.",
      validation: (rule) => rule.required().max(1),
    }),
    defineField({
      name: "image",
      type: "image",
      title: "Panel artwork",
      description: "Optional small photo in the top corner of the panel. Add alt text.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alt Text",
          description: "The text that describes the image for screen readers and search engines",
        }),
      ],
    }),
    defineField({
      name: "intro",
      title: "Intro line",
      type: "text",
      rows: 2,
      description: "Optional. One or two sentences above the price box.",
    }),
    defineField({
      name: "fares",
      title: "Fares",
      type: "array",
      of: [fare],
      description:
        "The fares the reader can switch between, e.g. round trip and one way. The first is selected on load.",
      validation: (rule) => rule.required().min(1).max(3),
    }),
    defineField({
      name: "facts",
      title: "What the fare includes",
      type: "array",
      of: [fact],
      validation: (rule) => rule.required().min(2).max(8),
    }),
    defineField({
      name: "button",
      title: "Button",
      type: "button",
      description: "Optional. The one action under the list.",
    }),
    defineField({
      name: "footnote",
      type: "text",
      rows: 2,
      description: "Optional small print under the button.",
    }),
  ],
  preview: {
    select: { title: "title", fares: "fares", facts: "facts", media: "image" },
    prepare: ({ title, fares, facts, media }) => ({
      title: richTextToPlainText(title) || "Fare Panel",
      subtitle: `${Array.isArray(fares) ? fares.length : 0} fares · ${Array.isArray(facts) ? facts.length : 0} facts`,
      media,
    }),
  },
});
