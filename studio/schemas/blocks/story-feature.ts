import { BookOpenText } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

const richTextToPlainText = (value: unknown): string => {
  if (!Array.isArray(value)) return "";
  return value
    .map((block) =>
      Array.isArray(block?.children)
        ? block.children.map((child: { text?: string }) => child.text ?? "").join("")
        : "",
    )
    .join(" ")
    .trim();
};

const storyRichTextField = defineField({
  name: "richText",
  title: "Narrative",
  type: "array",
  description: "The main story. Use Pull Quote to emphasize one important statement.",
  of: [
    defineArrayMember({
      name: "block",
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Pull Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
        ],
        annotations: [
          defineArrayMember({ type: "customLink" }),
        ],
      },
    }),
  ],
  validation: (rule) =>
    rule.required().custom((value: Array<{ style?: string }> | undefined) => {
      const pullQuotes = value?.filter((block) => block.style === "blockquote").length ?? 0;

      return pullQuotes <= 1 ? true : "Use no more than one pull quote in this story";
    }),
});

export default defineType({
  name: "storyFeature",
  title: "Image and Text",
  type: "object",
  icon: BookOpenText,
  description:
    "A photo beside a short story: heading, narrative, an optional checklist of key details, and up to two actions.",
  fields: [
    defineField({
      name: "useCreamBackground",
      title: "Cream field",
      type: "boolean",
      description:
        "On: the section sits on the cream (Birch Bark) field. Off: the forest dark field. Alternate with the sections around it.",
      initialValue: false,
    }),
    defineField({
      name: "flipLayout",
      title: "Photo on the right",
      type: "boolean",
      description:
        "Off: photo left, text right. On: text left, photo right. Alternate between neighbouring Image and Text sections.",
      initialValue: false,
    }),
    defineField({
      name: "eyebrow",
      type: "string",
      description: "Optional short label shown above the section heading",
    }),
    defineField({
      name: "title",
      title: "Heading",
      type: "minimalRichText",
      description:
        "The section heading. Italicise one phrase to set it in the handwritten accent.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      type: "image",
      title: "Image",
      description:
        "The main story image. Add alt text and use the hotspot tool to preserve its focal point when cropped.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alt Text",
          description: "The text that describes the image for screen readers and search engines",
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "imageCaption",
      title: "Image Caption",
      type: "string",
      description: "Optional context shown directly beneath the image",
    }),
    storyRichTextField,
    defineField({
      name: "keyDetails",
      title: "Key Details",
      type: "object",
      description: "Optional short facts shown as a checklist under the story",
      fields: [
        defineField({
          name: "title",
          type: "string",
          description: "Optional label shown above the key details",
        }),
        defineField({
          name: "items",
          type: "array",
          description: "Short facts, one line each",
          of: [defineArrayMember({ type: "string" })],
          validation: (rule) => rule.required().min(1).max(8),
        }),
      ],
    }),
    defineField({
      name: "buttons",
      title: "Buttons",
      type: "array",
      description: "Optional actions shown after the story",
      of: [defineArrayMember({ type: "button" })],
      validation: (rule) => rule.max(2),
    }),
  ],
  preview: {
    select: { title: "title", media: "image" },
    prepare: ({ title, media }) => ({
      title: richTextToPlainText(title) || "Untitled Image and Text",
      subtitle: "Image and Text",
      media,
    }),
  },
});
