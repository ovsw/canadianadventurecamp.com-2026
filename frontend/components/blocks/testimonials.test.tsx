import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Testimonials from "./testimonials";

const quote = (key: string, text: string) => [
  {
    _key: `${key}-block`,
    _type: "block" as const,
    style: "normal" as const,
    markDefs: null,
    children: [{ _key: `${key}-span`, _type: "span" as const, marks: [], text }],
  },
];

const block: ComponentProps<typeof Testimonials> = {
  _key: "island-testimonials",
  _type: "testimonials",
  background: "white",
  eyebrow: "07 · FROM FAMILIES",
  heading: [
    {
      _key: "heading",
      _type: "block",
      style: "normal",
      markDefs: null,
      children: [
        { _key: "plain", _type: "span", marks: [], text: "What families say " },
        { _key: "accent", _type: "span", marks: ["em"], text: "about the island" },
      ],
    },
  ],
  testimonials: [
    {
      _key: "ref-1",
      _type: "reference",
      _ref: "t1",
      document: {
        _id: "t1",
        _type: "testimonial",
        name: "Parent one",
        title: "Parent of a first-year camper",
        origin: "Toronto",
        rating: 5,
        image: null,
        body: quote("q1", "The lake was the whole summer."),
      },
    },
    {
      _key: "ref-2",
      _type: "reference",
      _ref: "t2",
      document: {
        _id: "t2",
        _type: "testimonial",
        name: "Parent two",
        title: "Parent",
        origin: null,
        rating: null,
        image: null,
        body: quote("q2", "One island, one community."),
      },
    },
    {
      _key: "ref-3",
      _type: "reference",
      _ref: "t3",
      document: {
        _id: "t3",
        _type: "testimonial",
        name: "Camper three",
        title: null,
        origin: "Mexico City",
        rating: null,
        image: null,
        body: quote("q3", "I can already picture my first day."),
      },
    },
  ],
  dataAttribute: (path) => `section:${path}`,
  testimonialDataAttribute: (id, path) => `${id}:${path}`,
};

describe("Testimonials", () => {
  const scrollTo = vi.fn();

  beforeEach(() => {
    scrollTo.mockReset();
    Element.prototype.scrollTo = scrollTo as unknown as Element["scrollTo"];
  });

  it("names the carousel after the heading and reaches it by keyboard", async () => {
    const user = userEvent.setup();
    render(<Testimonials {...block} />);

    const region = screen.getByRole("region", {
      name: "Testimonials: What families say about the island",
    });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region).toHaveAttribute("data-sanity", "section:testimonials");

    await user.tab();
    expect(region).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ left: expect.any(Number) }),
    );

    // At the first slide "Previous" is disabled, so the next tab stop is the
    // first dot, then the remaining dots, then "Next".
    expect(
      screen.getByRole("button", { name: "Previous testimonial" }),
    ).toBeDisabled();
    await user.tab();
    const firstDot = screen.getByRole("button", { name: "Go to testimonial 1" });
    expect(firstDot).toHaveFocus();
    expect(firstDot).toHaveAttribute("aria-current", "true");
    const next = screen.getByRole("button", { name: "Next testimonial" });
    await user.click(next);
    expect(scrollTo).toHaveBeenCalledTimes(2);
  });

  it("renders three slides with quote, avatar fallback, name, role, and optional origin", () => {
    render(<Testimonials {...block} />);

    expect(
      screen.getByRole("heading", { name: "What families say about the island" }),
    ).toBeInTheDocument();
    expect(screen.getByText("about the island")).toHaveClass("text-[var(--section-accent)]");
    expect(screen.getAllByRole("group", { name: /of 3$/ })).toHaveLength(3);
    expect(document.querySelectorAll("figure")).toHaveLength(3);
    expect(screen.getByText("The lake was the whole summer.")).toBeInTheDocument();
    expect(screen.getByText("PO")).toBeInTheDocument();
    expect(screen.getByText("Parent of a first-year camper")).toHaveAttribute(
      "data-sanity",
      "t1:title",
    );
    expect(screen.getByText("Toronto")).toHaveAttribute("data-sanity", "t1:origin");
    expect(screen.getByText("Mexico City")).toBeInTheDocument();
    expect(
      screen.getByText("Parent one").closest("figure"),
    ).toHaveAttribute("data-sanity", 'section:testimonials[_key=="ref-1"]');
    expect(screen.getByText("Testimonial 1 of 3")).toBeInTheDocument();
  });

  it("skips unresolved or empty testimonials", () => {
    render(
      <Testimonials
        {...block}
        testimonials={[
          ...(block.testimonials ?? []),
          {
            _key: "ref-4",
            _type: "reference",
            _ref: "t4",
            document: null,
          } as unknown as NonNullable<typeof block.testimonials>[number],
        ]}
      />,
    );
    expect(document.querySelectorAll("figure")).toHaveLength(3);
    fireEvent.scroll(
      screen.getByRole("region", { name: /^Testimonials:/ }),
    );
    expect(screen.getByText("Testimonial 1 of 3")).toBeInTheDocument();
  });
});
