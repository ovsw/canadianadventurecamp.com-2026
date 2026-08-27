import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import StackedFeatureRows from "./stacked-feature-rows";

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
      title: "Accredited & inspected",
      items: [
        {
          _key: "oca",
          label: "OCA accredited",
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
    ).toBeInTheDocument();
    expect(screen.getByText("Accredited & inspected")).toHaveAttribute(
      "data-sanity",
      'section:rows[_key=="accredited"].title',
    );
    expect(screen.getByText("OCA accredited")).toHaveAttribute(
      "data-sanity",
      'section:rows[_key=="accredited"].items[_key=="oca"].label',
    );
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
            title: "Missing link",
            items: [
              {
                _key: "detail",
                label: "Detail",
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
