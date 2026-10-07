import { urlInternalHref } from "./internal-href";

/**
 * One shared `button` object, as every section renders it. There is no style
 * field: the section picks each button's role from its position.
 */
export const buttonQuery = `
  _key,
  _type,
  text,
  icon {
    name,
    svg
  },
  "openInNewTab": url.openInNewTab,
  "href": select(
    url.type == "internal" => ${urlInternalHref},
    url.type == "external" => url.external,
    url.href
  )
`;
