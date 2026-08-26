import { CircleDot } from "lucide-react";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "activity",
  title: "Activity",
  type: "document",
  icon: CircleDot,
  description: "A daily choice that campers can add to their schedule.",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({
      title: title || "Untitled Activity",
    }),
  },
});
