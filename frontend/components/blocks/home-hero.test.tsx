import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import HomeHero, { resolveHomeHeroButtonVariant } from "./home-hero";
import { getHomeHeroVideoEmbedUrl } from "./home-hero-video";

const playIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m6 3 14 9-14 9V3z"></path></svg>';

const loneVideoButtonHero: ComponentProps<typeof HomeHero> = {
  _key: "hero-test",
  _type: "homeHero",
  badge: null,
  body: null,
  buttons: [
    {
      _key: "film",
      _type: "button",
      href: "https://www.youtube.com/watch?v=bSF5jKJhTvA",
      icon: { name: "play", svg: playIcon },
      openInNewTab: false,
      text: "View Film",
      variant: "outline",
    },
  ],
  image: null,
  shortBody: null,
  stats: null,
  title: [
    {
      _key: "title",
      _type: "block",
      children: [
        { _key: "title-text", _type: "span", marks: [], text: "Camp" },
      ],
      markDefs: null,
      style: "normal",
    },
  ],
  videoUrl: null,
};

describe("resolveHomeHeroButtonVariant", () => {
  it("keeps the style selected in Sanity", () => {
    expect(resolveHomeHeroButtonVariant("outline", 0)).toBe("outline");
    expect(resolveHomeHeroButtonVariant("ghost", 1)).toBe("ghost");
  });

  it("keeps a lone button visible when its style is missing", () => {
    expect(resolveHomeHeroButtonVariant(undefined, 0)).toBe("outline");
  });

  it("uses ghost as the second-button fallback", () => {
    expect(resolveHomeHeroButtonVariant(undefined, 1)).toBe("ghost");
  });

  it("recognizes a video button without depending on its array position", () => {
    expect(
      getHomeHeroVideoEmbedUrl("https://www.youtube.com/watch?v=bSF5jKJhTvA"),
    ).toBe(
      "https://www.youtube-nocookie.com/embed/bSF5jKJhTvA?autoplay=1&rel=0",
    );
  });

  it("renders one video button with its CMS style and icon", () => {
    render(<HomeHero {...loneVideoButtonHero} />);

    const button = screen.getByRole("button", { name: "View Film" });
    expect(button.className).toContain("border-edge-on-dark-strong");
    expect(button.className).not.toContain("shadow-teal-action");
    expect(button.className).not.toContain("hover:shadow-interactive-lift");
    expect(button.className).toContain("hover:shadow-none");
    expect(button.querySelector("svg")).not.toBeNull();
  });

  it("renders the fallback label for an ordinary link without button text", () => {
    render(
      <HomeHero
        {...loneVideoButtonHero}
        buttons={[
          {
            _key: "apply",
            _type: "button",
            href: "/apply",
            icon: null,
            openInNewTab: false,
            text: null,
            variant: "outline",
          },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "Learn more" })).toHaveAttribute(
      "href",
      "/apply",
    );
  });

  it("renders inline links in the supporting copy", () => {
    render(
      <HomeHero
        {...loneVideoButtonHero}
        body={[
          {
            _key: "body",
            _type: "block",
            children: [
              {
                _key: "body-text",
                _type: "span",
                marks: ["apply-link"],
                text: "Apply now",
              },
            ],
            markDefs: [
              {
                _key: "apply-link",
                _type: "customLink",
                href: "/apply",
                openInNewTab: false,
              },
            ],
            style: "normal",
          },
        ]}
      />,
    );

    const links = screen.getAllByRole("link", { name: "Apply now" });
    expect(links).toHaveLength(2);
    for (const link of links) expect(link).toHaveAttribute("href", "/apply");
  });
});
