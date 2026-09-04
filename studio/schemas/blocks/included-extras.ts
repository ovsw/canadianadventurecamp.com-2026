import { Scale } from "lucide-react";
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

const includedItem = defineArrayMember({
  name: "includedExtrasIncludedItem",
  title: "Item",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      description: 'What is included, e.g. "All 35 activities".',
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

const extraItem = defineArrayMember({
  name: "includedExtrasExtraItem",
  title: "Extra",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      description: 'The extra, e.g. "Camp bus from Yorkdale".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "detail",
      type: "string",
      description: "Optional one-line note. Explain camp words here.",
    }),
    defineField({
      name: "price",
      type: "string",
      description: 'Shown as written, e.g. "$265 + tax" or "Camp to confirm".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "object",
      description: "Optional. Shown under the note when both fields are set.",
      fields: [
        defineField({ name: "text", title: "Link Text", type: "string" }),
        defineField({ name: "url", title: "Destination", type: "customUrl" }),
      ],
    }),
  ],
  preview: { select: { title: "label", subtitle: "price" } },
});

export default defineType({
  name: "includedExtras",
  title: "Included & Extras",
  type: "object",
  icon: Scale,
  description:
    "Two columns on a cream field: a check list of what the price includes beside a priced list of what is extra.",
  fields: [
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
      name: "intro",
      title: "Intro line",
      type: "text",
      rows: 2,
      description: "Optional. One or two sentences under the heading.",
    }),
    defineField({
      name: "included",
      title: "Included column",
      type: "object",
      fields: [
        defineField({
          name: "heading",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "note",
          type: "string",
          description: 'Optional line under the heading, e.g. "Same for every session length".',
        }),
        defineField({
          name: "items",
          type: "array",
          of: [includedItem],
          validation: (rule) => rule.required().min(2).max(8),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "extras",
      title: "Extras column",
      type: "object",
      fields: [
        defineField({
          name: "heading",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "note",
          type: "string",
          description: 'Optional line under the heading, e.g. "Billed with the balance".',
        }),
        defineField({
          name: "items",
          type: "array",
          of: [extraItem],
          validation: (rule) => rule.required().min(1).max(8),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "footnote",
      type: "text",
      rows: 2,
      description: "Optional small print under both columns.",
    }),
  ],
  preview: {
    select: { title: "title", included: "included.items", extras: "extras.items" },
    prepare: ({ title, included, extras }) => ({
      title: richTextToPlainText(title) || "Included & Extras",
      subtitle: `${Array.isArray(included) ? included.length : 0} included · ${Array.isArray(extras) ? extras.length : 0} extras`,
    }),
  },
});
