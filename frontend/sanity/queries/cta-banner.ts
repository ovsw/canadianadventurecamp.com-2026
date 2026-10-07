import { groq } from "next-sanity";
import { buttonQuery } from "./shared/button";

// @sanity-typegen-ignore
export const ctaBannerQuery = groq`
  _type == "ctaBanner" => {
    variant,
    title,
    description,
    "buttons": array::compact(buttons[]{
      ${buttonQuery}
    })
  }
`;
