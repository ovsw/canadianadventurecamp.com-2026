// Alt text is managed centrally on the asset (the Media plugin's "altText" field).
// A per-image `alt` override in a document still wins when an editor sets one,
// so existing hand-written alt text keeps working.
export const imageQuery = `
  ...,
  "alt": coalesce(alt, asset->altText, ""),
  asset->{
    _id,
    url,
    mimeType,
    altText,
    metadata {
      lqip,
      dimensions {
        width,
        height
      }
    }
  }
`;
