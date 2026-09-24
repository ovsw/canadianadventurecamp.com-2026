import { groq } from "next-sanity";
import { imageQuery } from "./shared/image";
import { urlInternalHref } from "./shared/internal-href";

// @sanity-typegen-ignore
export const farePanelQuery = groq`
  _type == "farePanel" => {
    background,
    eyebrow,
    title[]{
      ...
    },
    image {
      ${imageQuery}
    },
    intro,
    "fares": array::compact(fares[]{
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
      text,
      variant,
      "openInNewTab": url.openInNewTab,
      "href": select(
        url.type == "internal" => ${urlInternalHref},
        url.type == "external" => url.external,
        url.href
      )
    },
    footnote
  }
`;
