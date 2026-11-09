import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId, useCdn } from "./env";

// Disable stega for specific field names that commonly need cleaning
const fieldsToDisableStega = [
  "colorVariant",
  "sectionWidth",
  "indicators",
  "size",
  "gridColumns",
  "noGap",
  "sticky",
  "padding",
];

/** Rich-text heading fields: `title`, `heading`, and names ending in Title/Heading. */
const headingFieldPattern = /^(title|heading)$|[a-z](Title|Heading)$/;

/**
 * True for the text of a span inside a rich-text heading, whose source path
 * ends `<field>, <block>, "children", <span>, "text"`.
 *
 * Stega appends about 2,000 invisible characters to each span. Firefox
 * applies the heading's negative letter-spacing to every one of them, so in
 * draft preview the accent phrase is dragged back over the words before it
 * (#226). Headings carry their own data-sanity attribute for click-to-edit.
 */
export function isRichTextHeadingSpan(
  sourcePath: ReadonlyArray<unknown>,
): boolean {
  if (sourcePath.at(-1) !== "text" || sourcePath.at(-3) !== "children") {
    return false;
  }
  const field = sourcePath.at(-5);
  return typeof field === "string" && headingFieldPattern.test(field);
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  perspective: "published",
  stega: {
    studioUrl: process.env.NEXT_PUBLIC_STUDIO_URL,
    filter: (props) => {
      if (fieldsToDisableStega.includes(props.sourcePath.at(-1) as string)) {
        return false;
      }
      if (isRichTextHeadingSpan(props.sourcePath)) {
        return false;
      }
      return props.filterDefault(props);
    },
  },
});
