import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ActivitySchedule from "./activity-schedule";

const motionPreference = vi.hoisted(() => ({ reduced: false }));

vi.mock("motion/react", () => ({
  useInView: () => false,
  useReducedMotion: () => motionPreference.reduced,
}));

const featuredActivities = Array.from({ length: 18 }, (_, index) => ({
  _id: `activity-${index + 1}`,
  _key: `activity-${index + 1}`,
  title: `Activity ${index + 1}`,
}));

const activitySchedule: ComponentProps<typeof ActivitySchedule> = {
  _key: "schedule-test",
  _type: "activitySchedule",
  activityCount: 19,
  camperNames: ["Maya", "Leo"],
  description: "Choose a different day every morning.",
  featuredActivities,
  heading: "activities. Their pick, every day.",
  dataAttribute: (path) => `section:${path}`,
  activityDataAttribute: (documentId, path) =>
    `activity:${documentId}:${path}`,
};

describe("ActivitySchedule", () => {
  beforeEach(() => {
    motionPreference.reduced = false;
  });

  it("shows the automatic total, 18 featured Activities, and the remainder link", () => {
    render(<ActivitySchedule {...activitySchedule} />);

    expect(
      screen.getByRole("heading", {
        name: "activities. Their pick, every day.",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(18);
    expect(
      screen.getByLabelText("19 activities. Their pick, every day."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "+ 1 more Activity" }),
    ).toHaveAttribute("href", "/summer-camp-activities");
  });

  it("lets visitors add and remove a featured Activity", () => {
    render(<ActivitySchedule {...activitySchedule} />);

    const activity = screen.getByRole("button", { name: "Activity 1" });
    expect(activity).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(activity);
    expect(activity).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Activity 1", { selector: "ol span" })).toBeInTheDocument();

    fireEvent.click(activity);
    expect(activity).toHaveAttribute("aria-pressed", "false");
  });

  it("shows a complete static schedule when reduced motion is preferred", () => {
    motionPreference.reduced = true;

    render(<ActivitySchedule {...activitySchedule} />);

    const schedule = screen.getByRole("list", {
      name: "Maya's Tuesday schedule",
    });
    expect(schedule).toHaveTextContent("Activity 1");
    expect(schedule).toHaveTextContent("Activity 4");
    expect(screen.getByText("Full day ✓")).toBeInTheDocument();
  });

  it("links section fields and Activity titles back to Studio", () => {
    const { container } = render(<ActivitySchedule {...activitySchedule} />);

    expect(container.querySelector('[data-sanity="section:heading"]')).not.toBeNull();
    expect(container.querySelector('[data-sanity="section:description"]')).not.toBeNull();
    expect(container.querySelector('[data-sanity="section:camperNames"]')).not.toBeNull();
    expect(
      container.querySelector(
        '[data-sanity="activity:activity-1:title"]',
      ),
    ).not.toBeNull();
  });
});
