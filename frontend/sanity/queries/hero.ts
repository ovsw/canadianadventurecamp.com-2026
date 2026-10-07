import { groq } from "next-sanity";
import { buttonQuery } from "./shared/button";
import { bodyQuery } from "./shared/body";
import { imageQuery } from "./shared/image";

// @sanity-typegen-ignore
export const heroQuery = groq`
  _type == "hero" => {
    eyebrow,
    title[]{
      ...
    },
    body[]{
      ${bodyQuery}
    },
    "buttons": array::compact(buttons[]{
      ${buttonQuery}
    }),
    image {
      ${imageQuery}
    }
  }
`;
