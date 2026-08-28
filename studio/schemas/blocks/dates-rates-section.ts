import { BadgeDollarSign } from "lucide-react";
import { defineField, defineType } from "sanity";

const defaultHeading = [
  {
    _key: "dates-rates-heading",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "dates-rates-heading-main",
        _type: "span",
        text: "Dates & rates, ",
        marks: [],
      },
      {
        _key: "dates-rates-heading-accent",
        _type: "span",
        text: "at a glance.",
        marks: ["em"],
      },
    ],
  },
];

export default defineType({
  name: "datesRatesSection",
  title: "Dates and Rates",
  type: "object",
  icon: BadgeDollarSign,
  description:
    "Shows the Active Season's dates, Rates, and Availability status.",
  initialValue: {
    heading: defaultHeading,
    introduction:
      "Every session is all-inclusive: cabin, meals, and all activities.",
    detailsLinkText: "Full dates & rates",
  },
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "minimalRichText",
      validation: (rule) => rule.required().max(1),
    }),
    defineField({
      name: "introduction",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "detailsLinkText",
      title: "Details Link Text",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare: () => ({
      title: "Dates and Rates",
      subtitle: "Uses the Active Season",
    }),
  },
});
