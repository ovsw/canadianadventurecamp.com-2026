import { defineField, defineType } from "sanity";
import NavigationIconInput, {
  createNavigationIconPreview,
} from "../../inputs/navigation-icon-input";
import { isNavigationIconName } from "../../inputs/lucide-icon-catalog";

/**
 * Editors choose a button's words, destination, and icon, never its style.
 * Each section styles its buttons from their position: the first is the
 * primary action, later ones are quieter.
 */
export default defineType({
  name: "button",
  title: "Button",
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "Button Text",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "object",
      description: "Optional icon shown before the button text.",
      // The blog post sidebar picks each action's icon from its destination.
      hidden: ({ document }) =>
        document?._type === "blogPostSettings" || document?._type === "settings",
      components: {
        input: NavigationIconInput,
      },
      fields: [
        defineField({ name: "name", title: "Name", type: "string" }),
        defineField({ name: "svg", title: "SVG markup", type: "string", hidden: true }),
      ],
      validation: (rule) =>
        rule.custom((value) => {
          const icon = value as { name?: string; svg?: string } | undefined;
          if (!icon?.name) return true;
          if (!isNavigationIconName(icon.name)) {
            return "Choose an icon from the icon picker";
          }
          if (!icon.svg) {
            return "Re-pick this icon so its artwork is stored with the button";
          }
          return true;
        }),
    }),
    defineField({ name: "url", title: "URL", type: "customUrl" }),
  ],
  preview: {
    select: { icon: "icon.name", title: "text", subtitle: "url.external" },
    prepare: ({ icon, title, subtitle }) => ({
      title,
      subtitle,
      media: icon ? createNavigationIconPreview(icon) : undefined,
    }),
  },
});
