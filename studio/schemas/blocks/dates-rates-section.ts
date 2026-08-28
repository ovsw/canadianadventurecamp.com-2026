import { BadgeDollarSign } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

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

const defaultIntroduction = [
  {
    _key: "dates-rates-intro",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "dates-rates-intro-main",
        _type: "span",
        text: "Every session is all-inclusive — cabin, meals, and all 35 activities. Hold a spot with a deposit that's fully refundable until March 31, 2026.",
        marks: [],
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
    eyebrow: "07 · DATES & RATES",
    heading: defaultHeading,
    introduction: defaultIntroduction,
    detailsLinkText: "Full dates & rates",
    sessionIncludes: [
      { _key: "include-cabin", _type: "includeItem", label: "Cabin on the island" },
      { _key: "include-meals", _type: "includeItem", label: "All meals & snacks" },
      { _key: "include-activities", _type: "includeItem", label: "All 35 activities" },
      { _key: "include-instruction", _type: "includeItem", label: "Expert instruction" },
      { _key: "include-gear", _type: "includeItem", label: "Top-of-the-line gear" },
      { _key: "include-deposit", _type: "includeItem", label: "Fully refundable deposit" },
      { _key: "include-siblings", _type: "includeItem", label: "5-10% sibling discount" },
    ],
    conditions: [
      {
        _key: "dates-rates-condition-deposits",
        _type: "block",
        style: "normal",
        markDefs: [],
        children: [
          {
            _key: "dates-rates-condition-deposits-1",
            _type: "span",
            text: "Deposits ",
            marks: [],
          },
          {
            _key: "dates-rates-condition-deposits-2",
            _type: "span",
            text: "fully refundable until March 31, 2026",
            marks: ["strong"],
          },
          {
            _key: "dates-rates-condition-deposits-3",
            _type: "span",
            text: " — balances due April 1.",
            marks: [],
          },
        ],
      },
      {
        _key: "dates-rates-condition-siblings",
        _type: "block",
        style: "normal",
        markDefs: [],
        children: [
          {
            _key: "dates-rates-condition-siblings-1",
            _type: "span",
            text: "Siblings save — ",
            marks: [],
          },
          {
            _key: "dates-rates-condition-siblings-2",
            _type: "span",
            text: "5% off the 2nd camper, 10% off the 3rd",
            marks: ["strong"],
          },
          {
            _key: "dates-rates-condition-siblings-3",
            _type: "span",
            text: ", applied automatically.",
            marks: [],
          },
        ],
      },
      {
        _key: "dates-rates-condition-extras",
        _type: "block",
        style: "normal",
        markDefs: [],
        children: [
          {
            _key: "dates-rates-condition-extras-1",
            _type: "span",
            text: "Transportation to and from camp and applicable government taxes are in addition to the rates above. A $150 tuck-shop deposit is added per camper — unused funds fully refunded.",
            marks: [],
          },
        ],
      },
    ],
  },
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
      description:
        "Small label above the heading. Include the sequence number if you want one.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "minimalRichText",
      validation: (rule) => rule.required().max(1),
    }),
    defineField({
      name: "introduction",
      type: "minimalRichText",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "detailsLinkText",
      title: "Details Link Text",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sessionIncludes",
      title: "Every Session Includes",
      type: "array",
      of: [
        defineArrayMember({
          name: "includeItem",
          title: "Item",
          type: "object",
          fields: [
            defineField({
              name: "label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "label" },
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "conditions",
      title: "Conditions",
      description: "Each paragraph renders as one bullet-separated item.",
      type: "minimalRichText",
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    prepare: () => ({
      title: "Dates and Rates",
      subtitle: "Uses the Active Season",
    }),
  },
});
