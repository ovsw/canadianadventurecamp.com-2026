import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FacilitiesMapInteractive, {
  type PublicFacilityPlacement,
} from "./facilities-map-interactive";

const placements = [
  { key: "start", name: "Start", x: 0 },
  { key: "middle", name: "Middle", x: 50 },
  { key: "finish", name: "Finish", x: 100 },
].map(
  ({ key, name, x }): PublicFacilityPlacement => ({
    description: `${name} description`,
    id: key,
    key,
    labelPosition: "auto",
    name,
    prominent: false,
    x,
    y: 50,
  }),
);
const getTotalLength = vi.fn(() => 200);

describe("FacilitiesMapInteractive", () => {
  beforeEach(() => {
    getTotalLength.mockClear();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        disconnect() {}
        observe() {}
        takeRecords() {
          return [];
        }
        unobserve() {}
      },
    );
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        addEventListener: vi.fn(),
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
        onchange: null,
        removeEventListener: vi.fn(),
      })),
    );
    Object.defineProperties(SVGElement.prototype, {
      getPointAtLength: {
        configurable: true,
        value: vi.fn((distance: number) => ({ x: distance / 2, y: 50 })),
      },
      getTotalLength: {
        configurable: true,
        value: getTotalLength,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete (SVGElement.prototype as Partial<SVGPathElement>).getPointAtLength;
    delete (SVGElement.prototype as Partial<SVGPathElement>).getTotalLength;
  });

  it("ends the highlighted route at the active marker", async () => {
    const { container } = render(
      <FacilitiesMapInteractive
        mapAlt="Map"
        mapLocationLabel="Adventure Island"
        mapUrl="/map.jpg"
        placements={placements}
        stopLabel="Stop"
        websiteAutoplay={false}
      />,
    );

    await waitFor(() => expect(getTotalLength).toHaveBeenCalled());

    fireEvent.mouseEnter(
      screen.getByRole("button", { name: "Explore Middle" }),
    );

    await waitFor(() => {
      const progressPath = container.querySelectorAll("svg path")[3];
      const trail = progressPath?.getAttribute("d");
      expect(trail?.startsWith("M0,50")).toBe(true);
      expect(trail?.endsWith("L50,50")).toBe(true);
    });
  });
});
