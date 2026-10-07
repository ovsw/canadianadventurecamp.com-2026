import { groq } from "next-sanity";
import { buttonQuery } from "./shared/button";
import { imageQuery } from "./shared/image";
import { customLinkMarkDefsQuery } from "./shared/custom-link";
import { minimalRichTextQuery } from "./shared/minimal-rich-text";

// @sanity-typegen-ignore
export const storyFeatureQuery = groq`
  _type == "storyFeature" => {
    eyebrow,
    title[]{
      ${minimalRichTextQuery}
    },
    image {
      ${imageQuery}
    },
    richText[]{
      ...,
      ${customLinkMarkDefsQuery}
    },
    keyDetails {
      title,
      items[]
    },
    buttons[]{
      ${buttonQuery}
    }
  }
`;
