import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomeHeroBackgroundVideo from "./home-hero-background-video";

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      addEventListener: vi.fn(),
      matches,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      removeEventListener: vi.fn(),
    })),
  );
}

describe("HomeHeroBackgroundVideo", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("does not mount an autoplay video when reduced motion is requested", () => {
    mockReducedMotion(true);
    const { container } = render(
      <HomeHeroBackgroundVideo playbackId="abc123" poster="/poster.jpg" />,
    );

    expect(container.querySelector("video")).toBeNull();
  });

  it("autoplays the muted background video when motion is allowed", () => {
    mockReducedMotion(false);
    const { container } = render(
      <HomeHeroBackgroundVideo playbackId="abc123" poster="/poster.jpg" />,
    );

    const video = container.querySelector("video");
    expect(video).not.toBeNull();
    expect(video).toHaveProperty("autoplay", true);
    expect(video).toHaveProperty("muted", true);
  });
});
