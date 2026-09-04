import { Route } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

const stop = defineArrayMember({
  name: "journeyStop",
  title: "Stop",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Stop name",
      type: "string",
      description: "Where this stop is, e.g. Yorkdale.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "time",
      title: "Time",
      type: "string",
      description: "Optional. Shown as written, e.g. 10:00 am.",
    }),
    defineField({
      name: "text",
      title: "One line",
      type: "string",
      description:
        "One sentence on what happens here and who is with the camper. Explain any camp jargon.",
      validation: (rule) => rule.required().max(180),
    }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      description:
        "Optional. Leave empty until a real photo of this stop exists.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "What the photo shows, for screen readers.",
        }),
      ],
    }),
  ],
  preview: {
    select: { label: "label", time: "time", media: "image" },
    prepare: ({ label, time, media }) => ({
      title: label || "Untitled Stop",
      subtitle: time || undefined,
      media,
    }),
  },
});

export default defineType({
  name: "journey",
  title: "Journey",
  type: "object",
  icon: Route,
  description:
    "An ordered trip in stops: a horizontal path on desktop, a vertical timeline on phones.",
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
      description: "Optional short label shown above the heading.",
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
      name: "stops",
      type: "array",
      description: "Stops are shown in the order listed here, first to last.",
      of: [stop],
      validation: (rule) => rule.required().min(2).max(8),
    }),
  ],
  preview: {
    select: { eyebrow: "eyebrow", stops: "stops" },
    prepare: ({ eyebrow, stops }) => {
      const count = Array.isArray(stops) ? stops.length : 0;
      return {
        title: eyebrow || "Journey",
        subtitle: `${count} ${count === 1 ? "stop" : "stops"}`,
      };
    },
  },
});
