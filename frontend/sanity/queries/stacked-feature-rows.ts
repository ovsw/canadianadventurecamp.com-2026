import { groq } from "next-sanity";
import { urlInternalHref } from "./shared/internal-href";

// @sanity-typegen-ignore
export const stackedFeatureRowsQuery = groq`
  _type == "stackedFeatureRows" => {
    eyebrow,
    title[]{
      ...
    },
    "rows": array::compact(rows[]{
      _key,
      title,
      "items": array::compact(items[]{
        _key,
        label
      }),
      link {
        text,
        "openInNewTab": url.openInNewTab,
        "href": select(
          url.type == "internal" => ${urlInternalHref},
          url.type == "external" => url.external,
          url.href
        )
      }
    })
  }
`;
