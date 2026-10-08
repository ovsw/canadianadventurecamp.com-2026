import { groq } from "next-sanity";
import { buttonQuery } from "./shared/button";
import {
  blogPostOrder,
  blogPostProjection,
  publishedPostFilter,
} from "./blog-post-listing";
import { imageQuery } from "./shared/image";

// @sanity-typegen-ignore
export const latestArticlesQuery = groq`
  _type == "latestArticles" => {
    eyebrow,
    title,
    description,
    limit,
    buttons[]{
      ${buttonQuery}
    },
    fallbackImage {
      ${imageQuery}
    },
    "articles": *[
      ${publishedPostFilter} &&
      meta.noindex != true &&
      seoHideFromLists != true &&
      seoNoIndex != true
    ] | order(${blogPostOrder})[0...12]{
      ${blogPostProjection}
    }
  }
`;
