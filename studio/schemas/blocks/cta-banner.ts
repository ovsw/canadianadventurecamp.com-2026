import { Megaphone } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "ctaBanner",
  title: "Call to Action",
  type: "object",
  icon: Megaphone,
  description:
    "A clear invitation with a heading, supporting line, and up to two actions.",
  fields: [
    defineField({
      name: "variant",
      title: "Weight",
      type: "string",
      description:
        "Closing: a full dark band that ends a page. Nudge: a quiet in-page panel, for example the fit quiz between two sections.",
      initialValue: "closing",
      options: {
        layout: "radio",
        list: [
          { title: "Closing banner", value: "closing" },
          { title: "In-page nudge", value: "nudge" },
        ],
      },
    }),
    defineField({
      name: "title",
      type: "string",
      description: "The question or statement that prompts visitors to act.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      type: "string",
      description: "Optional supporting sentence shown under the heading",
    }),
    defineField({
      name: "buttons",
      type: "array",
      description:
        "One or two actions. The first button is emphasized; the second renders as an outline.",
      of: [defineArrayMember({ type: "button" })],
      validation: (rule) => rule.required().min(1).max(2),
    }),
  ],
  preview: {
    select: { title: "title", variant: "variant" },
    prepare: ({ title, variant }) => ({
      title: title || "Untitled Call to Action",
      subtitle: variant === "nudge" ? "In-page nudge" : "Closing banner",
    }),
  },
});
