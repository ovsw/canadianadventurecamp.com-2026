import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import StackedFeatureRows from "./stacked-feature-rows";

const iconSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7h-9"/><path d="M14 17H5"/></svg>';

const block: ComponentProps<typeof StackedFeatureRows> = {
  _key: "parent-details",
  _type: "stackedFeatureRows",
  eyebrow: "04 · FOR PARENTS",
  title: [
    {
      _key: "heading",
      _type: "block",
      style: "normal",
      markDefs: null,
      children: [
        {
          _key: "plain",
          _type: "span",
          marks: [],
          text: "Built for kids. ",
        },
        {
          _key: "accent",
          _type: "span",
          marks: ["em"],
          text: "Trusted by parents.",
        },
      ],
    },
  ],
  rows: [
    {
      _key: "accredited",
      icon: {
        name: "badge-check",
        svg: iconSvg,
      },
      title: "Accredited & inspected",
      items: [
        {
          _key: "oca",
          body: [
            {
              _key: "oca-body",
              _type: "block",
              style: "normal",
              markDefs: [
                {
                  _key: "oca-link",
                  _type: "customLink",
                  href: "https://ontariocampsassociation.ca/",
                  openInNewTab: true,
                },
              ],
              children: [
                {
                  _key: "oca-text",
                  _type: "span",
                  marks: ["oca-link"],
                  text: "OCA accredited",
                },
              ],
            },
          ],
        },
      ],
      link: {
        text: "Our accreditations",
        href: "/accreditations",
        openInNewTab: false,
      },
    },
  ],
  dataAttribute: (path) => `section:${path}`,
};

describe("StackedFeatureRows", () => {
  it("renders its heading, rows, links, and keyed editing paths", () => {
    render(<StackedFeatureRows {...block} />);

    expect(
      screen.getByRole("heading", {
        name: "Built for kids. Trusted by parents.",
      }),
    ).toHaveClass("text-display-page", "font-extrabold");
    expect(screen.getByText("Trusted by parents.")).toHaveClass("text-cedar");
    const rowHeading = screen.getByText("Accredited & inspected");
    expect(rowHeading).toHaveAttribute(
      "data-sanity",
      'section:rows[_key=="accredited"].title',
    );
    expect(rowHeading.parentElement).toHaveClass("items-center");
    expect(
      screen.getByText("OCA accredited").closest("[data-sanity]"),
    ).toHaveAttribute(
      "data-sanity",
      'section:rows[_key=="accredited"].items[_key=="oca"].body',
    );
    const ocaLink = screen.getByRole("link", { name: "OCA accredited" });
    expect(ocaLink).toHaveAttribute(
      "href",
      "https://ontariocampsassociation.ca/",
    );
    expect(ocaLink).toHaveClass("text-cedar", "hover:text-cedar-deep");
    expect(document.querySelector('[data-sanity$=".icon"]')).toHaveClass(
      "text-cedar",
    );
    expect(document.querySelector(".lucide-check")).toHaveClass("text-cedar");
    expect(
      document.querySelector('[data-sanity="section:rows"]'),
    ).toHaveClass("md:grid-cols-2", "lg:grid-cols-1");
    expect(
      document.querySelector('[data-sanity$=".items"]'),
    ).not.toHaveClass("md:grid-cols-2");
    expect(screen.getByRole("link", { name: "Our accreditations" })).toHaveAttribute(
      "href",
      "/accreditations",
    );
  });

  it("omits incomplete rows", () => {
    render(
      <StackedFeatureRows
        {...block}
        rows={[
          ...(block.rows ?? []),
          {
            _key: "missing-link",
            icon: null,
            title: "Missing link",
            items: [
              {
                _key: "detail",
                body: null,
              },
            ],
            link: null,
          },
        ]}
      />,
    );

    expect(screen.queryByText("Missing link")).not.toBeInTheDocument();
  });
});
