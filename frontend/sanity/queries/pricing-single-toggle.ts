import { groq } from "next-sanity";
import { buttonQuery } from "./shared/button";
import { imageQuery } from "./shared/image";

// @sanity-typegen-ignore
export const pricingSingleToggleQuery = groq`
  _type == "pricingSingleToggle" => {
    background,
    eyebrow,
    title[]{
      ...
    },
    image {
      ${imageQuery}
    },
    intro,
    "options": array::compact(options[]{
      _key,
      name,
      price,
      unit,
      note
    }),
    "facts": array::compact(facts[]{
      _key,
      label,
      detail
    }),
    button {
      ${buttonQuery}
    },
    footnote
  }
`;
