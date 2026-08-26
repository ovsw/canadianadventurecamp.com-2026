import { describe, expect, it } from "vitest";
import {
  createFacilitiesMapPath,
  getFacilitiesMapTrailDasharray,
} from "./facilities-map-path";

describe("createFacilitiesMapPath", () => {
  it("returns no route until two Facilities have positions", () => {
    expect(createFacilitiesMapPath([])).toBeUndefined();
    expect(createFacilitiesMapPath([{ x: 20, y: 30 }])).toBeUndefined();
  });

  it("passes through two points without inventing a return route", () => {
    expect(
      createFacilitiesMapPath([
        { x: 20, y: 30 },
        { x: 70, y: 60 },
      ]),
    ).toBe("M20,30L70,60");
  });

  it("changes the route when editors reorder Facilities", () => {
    const points = [
      { x: 15, y: 20 },
      { x: 45, y: 65 },
      { x: 80, y: 30 },
    ];
    expect(createFacilitiesMapPath(points)).not.toBe(
      createFacilitiesMapPath([points[0], points[2], points[1]]),
    );
  });
});

describe("getFacilitiesMapTrailDasharray", () => {
  it("uses the measured route length so the highlight does not repeat", () => {
    expect(getFacilitiesMapTrailDasharray(68, 160)).toBe("68 92");
  });

  it("keeps the route empty before its rendered length is measured", () => {
    expect(getFacilitiesMapTrailDasharray(0, 0)).toBe("0 1");
  });
});
