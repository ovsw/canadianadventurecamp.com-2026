import { describe, expect, it } from "vitest";

import { isRichTextHeadingSpan } from "./client";

const key = (k: string, i = 0) => ({ _key: k, _index: i });

describe("isRichTextHeadingSpan", () => {
  it("matches span text inside a heading field", () => {
    for (const field of ["title", "heading", "mapHeading", "sectionTitle"]) {
      expect(
        isRichTextHeadingSpan(["blocks", key("b"), field, key("p"), "children", key("s"), "text"]),
      ).toBe(true);
    }
  });

  it("leaves body rich text and plain string titles alone", () => {
    expect(
      isRichTextHeadingSpan(["blocks", key("b"), "body", key("p"), "children", key("s"), "text"]),
    ).toBe(false);
    expect(isRichTextHeadingSpan(["blocks", key("b"), "title"])).toBe(false);
    expect(isRichTextHeadingSpan(["title"])).toBe(false);
    expect(
      isRichTextHeadingSpan(["blocks", key("b"), "subtitle", key("p"), "children", key("s"), "text"]),
    ).toBe(false);
  });
});
