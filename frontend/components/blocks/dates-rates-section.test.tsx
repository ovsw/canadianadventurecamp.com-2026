import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import DatesRatesSection from "./dates-rates-section";
import { getSessionEndDate } from "./dates-rates-model";

const heading = [
  {
    _key: "heading",
    _type: "block" as const,
    children: [
      {
        _key: "heading-main",
        _type: "span" as const,
        marks: [],
        text: "Dates & rates, ",
      },
      {
        _key: "heading-accent",
        _type: "span" as const,
        marks: ["em"],
        text: "at a glance.",
      },
    ],
    markDefs: null,
    style: "normal" as const,
  },
];

const section = {
  _key: "dates-test",
  _type: "datesRatesSection" as const,
  activeSeason: {
    _id: "season-2027",
    name: "2027 Season",
    startDate: "2027-06-28",
    twoWeek: {
      rate: 3900,
      description: "The shortest Adventure Island stay.",
      sessions: [
        {
          _key: "session-1",
          availabilityNote: "Under 5 spots",
          availabilityStatus: "limited",
          startDate: "2027-06-28",
        },
        {
          _key: "session-2",
          availabilityNote: null,
          availabilityStatus: "full",
          startDate: "2027-07-12",
        },
      ],
    },
    fourWeek: {
      rate: 7200,
      description: "A full month at camp.",
      sessions: [
        {
          _key: "session-3",
          availabilityNote: null,
          availabilityStatus: "open",
          startDate: "2027-06-28",
        },
      ],
    },
    sixWeek: null,
    eightWeek: {
      rate: 12000,
      description: "The complete summer.",
      sessions: [
        {
          _key: "session-4",
          availabilityNote: null,
          availabilityStatus: "open",
          startDate: "2027-06-28",
        },
      ],
    },
  },
  dataAttribute: (path) => `section:${path}`,
  detailsLinkText: "Full dates & rates",
  heading,
  introduction: "Every session is all-inclusive.",
  seasonDataAttribute: (documentId, path) => `season:${documentId}:${path}`,
} satisfies ComponentProps<typeof DatesRatesSection>;

describe("DatesRatesSection", () => {
  it("shows the Active Season, calculated dates, Rate, description, and availability", () => {
    render(<DatesRatesSection {...section} />);

    expect(
      screen.getByRole("heading", { name: "Dates & rates, at a glance." }),
    ).toBeInTheDocument();
    expect(screen.getByText("2027 SEASON")).toBeInTheDocument();
    expect(screen.getByText("$3,900")).toBeInTheDocument();
    expect(
      screen.getByText("The shortest Adventure Island stay."),
    ).toBeInTheDocument();
    expect(screen.getByText("Jun 28-Jul 11")).toBeInTheDocument();
    expect(screen.getByText("Under 5 spots")).toBeInTheDocument();
    expect(screen.getByText("Full")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Full dates & rates" }),
    ).toHaveAttribute("href", "/dates-and-rates/");
  });

  it("switches Session lengths", () => {
    render(<DatesRatesSection {...section} />);

    fireEvent.click(screen.getByRole("tab", { name: "4 weeks" }));

    expect(screen.getByText("$7,200")).toBeInTheDocument();
    expect(screen.getByText("A full month at camp.")).toBeInTheDocument();
    expect(screen.getByText("Jun 28-Jul 25")).toBeInTheDocument();
  });

  it("does not link Full Sessions to enrollment", () => {
    render(<DatesRatesSection {...section} />);

    expect(screen.getAllByRole("link", { name: /Enroll/ })).toHaveLength(2);
    expect(screen.getByText("Jul 12-Jul 25").closest("a")).toBeNull();
  });

  it("links section and Season fields back to Studio", () => {
    const { container } = render(<DatesRatesSection {...section} />);

    expect(container.querySelector('[data-sanity="section:heading"]')).not.toBeNull();
    expect(container.querySelector('[data-sanity="section:introduction"]')).not.toBeNull();
    expect(
      container.querySelector('[data-sanity="season:season-2027:twoWeek.rate"]'),
    ).not.toBeNull();
    expect(
      [...container.querySelectorAll("[data-sanity]")].some(
        (element) =>
          element.getAttribute("data-sanity") ===
          'season:season-2027:twoWeek.sessions[_key=="session-1"].startDate',
      ),
    ).toBe(true);
  });

  it("calculates inclusive Session end dates from inherited length", () => {
    expect(getSessionEndDate("2027-06-28", 2)).toBe("2027-07-11");
    expect(getSessionEndDate("2027-06-28", 8)).toBe("2027-08-22");
  });
});
