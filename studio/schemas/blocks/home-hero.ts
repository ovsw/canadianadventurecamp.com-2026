import { Sparkles } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

const homeHeroStat = defineArrayMember({
  name: "homeHeroStat",
  title: "Stat",
  type: "object",
  fields: [
    defineField({
      name: "value",
      type: "string",
      description: 'The bold figure or short phrase, e.g. "Est. 1975".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "label",
      type: "string",
      description: "A one-line explanation shown under the value.",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "value", subtitle: "label" },
  },
});

export default defineType({
  name: "homeHero",
  title: "Home Hero",
  type: "object",
  icon: Sparkles,
  description:
    "Full-viewport hero with background video, heading, stats bar, and call-to-action buttons. Designed for the home page.",
  fields: [
    defineField({
      name: "badge",
      title: "Badge Text",
      type: "string",
      description:
        'Short context shown in a pill above the heading, e.g. "OVERNIGHT CAMP · PRIVATE ISLAND".',
    }),
    defineField({
      name: "title",
      title: "Heading",
      type: "minimalRichText",
      description:
        "The main heading. Use italic for the accent word or phrase that gets the handwritten style.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Supporting Message",
      type: "simpleRichText",
      description:
        "A short paragraph shown below the heading on desktop.",
    }),
    defineField({
      name: "shortBody",
      title: "Short Body (Mobile)",
      type: "string",
      description:
        "A shorter version of the supporting message shown on small screens. Falls back to the full body if empty.",
    }),
    defineField({
      name: "buttons",
      type: "array",
      description:
        "Up to two call-to-action buttons. The first renders as the primary action, the second as a ghost/outline action.",
      of: [defineArrayMember({ type: "button" })],
      validation: (rule) => rule.max(2),
    }),
    defineField({
      name: "videoUrl",
      title: "Background Video URL",
      type: "url",
      description:
        "Direct link to an mp4 video file. Plays muted and looped behind the hero.",
      validation: (rule) =>
        rule.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "image",
      title: "Background Image",
      type: "image",
      options: { hotspot: true },
      description:
        "Serves as the video poster frame and fallback for visitors without autoplay.",
      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",
          validation: (rule) =>
            rule.custom((value, context) => {
              const parent = context.parent as { asset?: unknown } | undefined;
              return parent?.asset && !value
                ? "Describe the image for visitors who cannot see it"
                : true;
            }),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "stats",
      title: "Stats Bar",
      type: "array",
      description:
        "Short facts shown at the bottom of the hero. Each has a bold value and a label.",
      of: [homeHeroStat],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { media: "image" },
    prepare: ({ media }) => ({
      title: "Home Hero",
      subtitle: "Home Hero",
      media,
    }),
  },
});
