import { defineField, defineType } from "sanity";
import { ListCollapse } from "lucide-react";

export default defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  icon: ListCollapse,
  description:
    "A reusable question and answer that can be selected in FAQ sections.",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Question",
      description: "The question shown to visitors.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "body",
      title: "Answer",
      type: "simpleRichText",
      description: "The reusable answer shown inside FAQ sections.",
    }),
  ],

  preview: {
    select: {
      title: "title",
    },
    prepare: ({ title }) => ({
      title: title || "Untitled FAQ",
      subtitle: "Reusable FAQ",
    }),
  },
});
