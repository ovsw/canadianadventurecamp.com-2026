import { curveCatmullRom, curveLinear, line } from "d3-shape";

export type FacilitiesMapPoint = {
  x: number;
  y: number;
};

/** Build the open tour route through every point in editor order. */
export function createFacilitiesMapPath<T extends FacilitiesMapPoint>(
  points: T[],
) {
  if (points.length < 2) return undefined;
  return (
    line<T>()
      .x(({ x }) => x)
      .y(({ y }) => y)
      .curve(points.length < 3 ? curveLinear : curveCatmullRom.alpha(0.5))(
      points,
    ) ?? undefined
  );
}

/** Draw one continuous highlight across the measured SVG route. */
export function getFacilitiesMapTrailDasharray(
  distance: number,
  total: number,
) {
  const safeTotal = Math.max(0, total);
  if (!safeTotal) return "0 1";
  const safeDistance = Math.min(Math.max(0, distance), safeTotal);
  return `${safeDistance} ${safeTotal - safeDistance}`;
}
