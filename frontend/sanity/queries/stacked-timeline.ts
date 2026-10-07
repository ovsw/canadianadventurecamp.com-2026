import { groq } from "next-sanity";
import { buttonQuery } from "./shared/button";
import { imageQuery } from "./shared/image";
import { minimalRichTextQuery } from "./shared/minimal-rich-text";

// @sanity-typegen-ignore
export const stackedTimelineQuery = groq`
  _type == "stackedTimeline" => {
    eyebrow,
    title[]{
      ${minimalRichTextQuery}
    },
    intro,
    "buttons": array::compact(buttons[]{
      ${buttonQuery}
    }),
    "items": array::compact(items[]{
      _key,
      title,
      meta,
      text,
      image {
        ${imageQuery}
      }
    })
  }
`;
