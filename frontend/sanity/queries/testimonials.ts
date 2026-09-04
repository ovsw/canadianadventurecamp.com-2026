import { groq } from "next-sanity";
import { simpleRichTextQuery } from "./shared/simple-rich-text";

// @sanity-typegen-ignore
export const testimonialsQuery = groq`
  _type == "testimonials" => {
    eyebrow,
    heading[]{
      ...
    },
    testimonials[]{
      _key,
      _type,
      "_ref": _ref,
      "document": @->{
        _id,
        _type,
        name,
        title,
        origin,
        rating,
        body[]{
          ${simpleRichTextQuery}
        }
      }
    }
  }
`;
