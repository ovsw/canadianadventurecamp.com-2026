import { groq } from "next-sanity";
import { buttonQuery } from "./shared/button";
import { imageQuery } from "./shared/image";

// @sanity-typegen-ignore
export const innerHeroQuery = groq`
  _type == "innerHero" => {
    eyebrow,
    title[]{
      ...
    },
    body,
    "buttons": array::compact(buttons[]{
      ${buttonQuery}
    }),
    image {
      ${imageQuery}
    },
    "facts": array::compact(facts[]{
      _key,
      value,
      label
    })
  }
`;
