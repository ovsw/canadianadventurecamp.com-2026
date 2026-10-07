import { groq } from "next-sanity";
import { buttonQuery } from "./shared/button";
import { imageQuery } from "./shared/image";

// @sanity-typegen-ignore
export const directorCtaQuery = groq`
  _type == "directorCta" => {
    title[]{
      ...
    },
    description,
    image {
      ${imageQuery}
    },
    "buttons": array::compact(buttons[]{
      ${buttonQuery}
    })
  }
`;
