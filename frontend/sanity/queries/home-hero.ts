import { groq } from "next-sanity";
import { imageQuery } from "./shared/image";
import { simpleRichTextQuery } from "./shared/simple-rich-text";
import { urlInternalHref } from "./shared/internal-href";

// @sanity-typegen-ignore
export const homeHeroQuery = groq`
  _type == "homeHero" => {
    badge,
    title[]{
      ...
    },
    body[]{
      ${simpleRichTextQuery}
    },
    shortBody,
    "buttons": array::compact(buttons[]{
      _key,
      _type,
      text,
      variant,
      "openInNewTab": url.openInNewTab,
      "href": select(
        url.type == "internal" => ${urlInternalHref},
        url.type == "external" => url.external,
        url.href
      )
    }),
    videoUrl,
    image {
      ${imageQuery}
    },
    "stats": array::compact(stats[]{
      _key,
      value,
      label
    })
  }
`;
