import { groq } from "next-sanity";

/**
 * Internal href resolution for the `link` field (type customUrl).
 * Cannot reuse urlInternalHref because that helper assumes the field is named `url`.
 */
const linkInternalHref = groq`select(
  link.internal->_id == "homePage" || link.internal->_type == "homePage" => "/",
  link.internal->_id == "blogIndex" || link.internal->_type == "blogIndex" => "/blog",
  link.internal->_type == "post" && defined(link.internal->slug.current) => "/blog/" + array::join(string::split(link.internal->slug.current, "/")[@ != ""], "/"),
  link.internal->_type == "category" && defined(link.internal->slug.current) => "/blog/category/" + array::join(string::split(link.internal->slug.current, "/")[@ != ""], "/"),
  defined(link.internal->slug.current) => "/" + array::join(string::split(link.internal->slug.current, "/")[@ != ""], "/")
)`;

// @sanity-typegen-ignore
export const internationalCampersSectionQuery = groq`
  _type == "internationalCampersSection" => {
    eyebrow,
    heading[]{
      ...
    },
    description,
    linkLabel,
    "link": {
      "openInNewTab": link.openInNewTab,
      "href": select(
        link.type == "internal" => ${linkInternalHref},
        link.type == "external" => link.external,
        link.href
      )
    }
  }
`;
