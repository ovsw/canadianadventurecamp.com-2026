import { Rows3 } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

const rowItem = defineArrayMember({
  name: "stackedFeatureRowItem",
  title: "Item",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Text",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "label" },
    prepare: ({ title }) => ({ title: title || "Untitled Item" }),
  },
});

const row = defineArrayMember({
  name: "stackedFeatureRow",
  title: "Row",
  type: "object",
  fields: [
    defineField({
      name: "title",
      type: "string",
      description: "The large heading shown for this row.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      description: "Short supporting points shown in the order listed here.",
      of: [rowItem],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "object",
      fields: [
        defineField({
          name: "text",
          title: "Link Text",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "url",
          title: "Destination",
          type: "customUrl",
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { items: "items", title: "title" },
    prepare: ({ items, title }) => {
      const count = Array.isArray(items) ? items.length : 0;
      return {
        title: title || "Untitled Row",
        subtitle: `${count} ${count === 1 ? "item" : "items"}`,
      };
    },
  },
});

export default defineType({
  name: "stackedFeatureRows",
  title: "Stacked Feature Rows",
  type: "object",
  icon: Rows3,
  description:
    "An introduction followed by full-width rows with supporting points and links.",
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
      description: "Optional short label shown beside the heading.",
    }),
    defineField({
      name: "title",
      title: "Heading",
      type: "minimalRichText",
      description: "Use italic for the phrase that gets the handwritten style.",
      validation: (rule) => rule.required().max(1),
    }),
    defineField({
      name: "rows",
      type: "array",
      description: "Rows are shown in the order listed here.",
      of: [row],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { eyebrow: "eyebrow", rows: "rows" },
    prepare: ({ eyebrow, rows }) => {
      const count = Array.isArray(rows) ? rows.length : 0;
      return {
        title: eyebrow || "Stacked Feature Rows",
        subtitle: `${count} ${count === 1 ? "row" : "rows"}`,
      };
    },
  },
});
