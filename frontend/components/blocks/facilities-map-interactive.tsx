"use client";

import Image from "next/image";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./facilities-map-section.module.css";
import { createFacilitiesMapPath } from "./facilities-map-path";

export type PublicFacilityPlacement = {
  description: string;
  descriptionDataAttribute?: string;
  featuredImage?: {
    alt: string;
    lqip?: string;
    url: string;
  };
  id: string;
  key: string;
  labelPosition: "above" | "auto" | "below" | "left" | "right";
  name: string;
  nameDataAttribute?: string;
  placementDataAttribute?: string;
  prominent: boolean;
  x: number;
  y: number;
};

type Point = { x: number; y: number };

const labelClassNames = {
  above: styles.labelAbove,
  auto: styles.labelAuto,
  below: styles.labelBelow,
  left: styles.labelLeft,
  right: styles.labelRight,
} satisfies Record<PublicFacilityPlacement["labelPosition"], string>;

function getStopDistances(
  path: SVGPathElement,
  placements: PublicFacilityPlacement[],
) {
  const total = path.getTotalLength();
  if (!total || !placements.length) return { distances: [], total: 0 };
  const samples = Math.max(800, placements.length * 100);
  const distances: number[] = [];
  let minimumDistance = 0;

  for (const placement of placements) {
    let closestDistance = minimumDistance;
    let closestDelta = Number.POSITIVE_INFINITY;
    for (let index = 0; index <= samples; index += 1) {
      const distance = minimumDistance + ((total - minimumDistance) * index) / samples;
      const point = path.getPointAtLength(distance);
      const delta = Math.hypot(point.x - placement.x, point.y - placement.y);
      if (delta < closestDelta) {
        closestDelta = delta;
        closestDistance = distance;
      }
      if (index > 20 && delta > closestDelta * 5) break;
    }
    distances.push(closestDistance);
    minimumDistance = Math.min(total, closestDistance + total / (samples * 2));
  }

  return { distances, total };
}

export default function FacilitiesMapInteractive({
  mapAlt,
  mapDataAttribute,
  mapLocationDataAttribute,
  mapLocationLabel,
  mapLqip,
  mapUrl,
  placements,
  stopLabel,
  stopLabelDataAttribute,
  websiteAutoplay,
}: {
  mapAlt: string;
  mapDataAttribute?: string;
  mapLocationDataAttribute?: string;
  mapLocationLabel: string;
  mapLqip?: string;
  mapUrl: string;
  placements: PublicFacilityPlacement[];
  stopLabel: string;
  stopLabelDataAttribute?: string;
  websiteAutoplay: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const walkerDistanceRef = useRef(0);
  const previousIndexRef = useRef(0);
  const manuallyPausedRef = useRef(false);
  const resumeTimerRef = useRef<number | undefined>(undefined);
  const [activeIndex, setActiveIndex] = useState(0);
  const [coordinate, setCoordinate] = useState("46.9455° N · 80.0585° W");
  const [distances, setDistances] = useState<number[]>([]);
  const [pathLength, setPathLength] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(false);
  const [walkerPoint, setWalkerPoint] = useState<Point>(() => ({
    x: placements[0]?.x ?? 0,
    y: placements[0]?.y ?? 0,
  }));
  const [trailProgress, setTrailProgress] = useState(0);
  const pathData = useMemo(
    () => createFacilitiesMapPath(placements),
    [placements],
  );
  const activePlacement = placements[activeIndex] ?? placements[0];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReducedMotion(media.matches);
    syncPreference();
    media.addEventListener("change", syncPreference);
    return () => media.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { rootMargin: "100px", threshold: 0.05 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path || !pathData) return;
    const frame = requestAnimationFrame(() => {
      const measured = getStopDistances(path, placements);
      setDistances(measured.distances);
      setPathLength(measured.total);
      walkerDistanceRef.current = measured.distances[0] ?? 0;
      setTrailProgress(
        measured.total ? ((measured.distances[0] ?? 0) / measured.total) * 100 : 0,
      );
      setWalkerPoint({
        x: placements[0]?.x ?? 0,
        y: placements[0]?.y ?? 0,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathData, placements]);

  useEffect(() => {
    if (
      !websiteAutoplay ||
      reducedMotion ||
      !visible ||
      placements.length < 2
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      if (manuallyPausedRef.current) return;
      setActiveIndex((current) => (current + 1) % placements.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [placements.length, reducedMotion, visible, websiteAutoplay]);

  useEffect(() => {
    const path = pathRef.current;
    const targetDistance = distances[activeIndex];
    if (!path || targetDistance === undefined || !pathLength) return;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const wrapping =
      previousIndexRef.current === placements.length - 1 && activeIndex === 0;
    previousIndexRef.current = activeIndex;
    if (wrapping || reducedMotion) {
      walkerDistanceRef.current = targetDistance;
      const point = path.getPointAtLength(targetDistance);
      setWalkerPoint(point);
      setTrailProgress((targetDistance / pathLength) * 100);
      return;
    }

    const startDistance = walkerDistanceRef.current;
    const startedAt = performance.now();
    const duration = 900;
    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const distance = startDistance + (targetDistance - startDistance) * eased;
      walkerDistanceRef.current = distance;
      setWalkerPoint(path.getPointAtLength(distance));
      setTrailProgress((distance / pathLength) * 100);
      if (progress < 1) animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [activeIndex, distances, pathLength, placements.length, reducedMotion]);

  const activate = (index: number) => {
    manuallyPausedRef.current = true;
    if (resumeTimerRef.current !== undefined) {
      window.clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = window.setTimeout(() => {
      manuallyPausedRef.current = false;
    }, 12_000);
    setActiveIndex(index);
  };

  useEffect(
    () => () => {
      if (resumeTimerRef.current !== undefined) {
        window.clearTimeout(resumeTimerRef.current);
      }
    },
    [],
  );

  if (!activePlacement) return null;

  return (
    <div className={styles.mapArea} ref={rootRef}>
      <div className={styles.mapScroller}>
        <div
          className={styles.mapViewport}
          onPointerMove={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width;
            const y = (event.clientY - bounds.top) / bounds.height;
            const latitude = 46.9455 + (0.5 - y) * 0.006;
            const longitude = 80.0585 + (x - 0.5) * 0.01;
            setCoordinate(
              `${latitude.toFixed(4)}° N · ${longitude.toFixed(4)}° W`,
            );
          }}
        >
          <div className={styles.mapInner}>
            <Image
              alt={mapAlt}
              blurDataURL={mapLqip}
              className={styles.mapImage}
              data-sanity={mapDataAttribute}
              fill
              placeholder={mapLqip ? "blur" : "empty"}
              priority={false}
              sizes="(max-width: 1023px) 1723px, 154vw"
              src={mapUrl}
            />
            <div className={styles.mapShade} />

            {pathData ? (
              <svg
                aria-hidden="true"
                className={styles.mapPath}
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <path className={styles.mapPathShadow} d={pathData} />
                <path className={styles.mapPathDashed} d={pathData} />
                <path
                  className={styles.mapPathGlow}
                  d={pathData}
                  pathLength="100"
                  strokeDasharray={`${trailProgress} ${100 - trailProgress}`}
                />
                <path
                  className={styles.mapPathProgress}
                  d={pathData}
                  pathLength="100"
                  ref={pathRef}
                  strokeDasharray={`${trailProgress} ${100 - trailProgress}`}
                />
              </svg>
            ) : null}

            {placements.map((placement, index) => (
              <button
                aria-label={`Explore ${placement.name}`}
                aria-pressed={index === activeIndex}
                className={`${styles.stop} ${
                  placement.prominent ? styles.stopProminent : ""
                } ${index === activeIndex ? styles.stopActive : ""}`}
                data-sanity={placement.placementDataAttribute}
                key={placement.key}
                onClick={() => activate(index)}
                onFocus={() => activate(index)}
                onMouseEnter={() => activate(index)}
                style={{ left: `${placement.x}%`, top: `${placement.y}%` }}
                type="button"
              >
                <span className={styles.stopDot} />
                <span
                  className={`${styles.stopLabel} ${
                    labelClassNames[placement.labelPosition]
                  }`}
                >
                  {placement.name}
                </span>
              </button>
            ))}

            <div
              className={styles.walker}
              style={{ left: `${walkerPoint.x}%`, top: `${walkerPoint.y}%` }}
            >
              <span className={styles.walkerDot} />
              <span className={styles.walkerName}>{activePlacement.name}</span>
            </div>
          </div>

          <div className={styles.mapTopBar}>
            <span
              className={styles.mapChip}
              data-sanity={mapLocationDataAttribute}
            >
              {mapLocationLabel}
            </span>
            <span className={styles.coordinateChip}>{coordinate}</span>
          </div>
          <div aria-label="North" className={styles.compass}>
            <span>
              <span className={styles.compassArrow}>▲</span>N
            </span>
          </div>
        </div>
      </div>

      <div className={styles.facilityCard} aria-live="polite">
        <div className={styles.facilityCardMeta}>
          <span data-sanity={stopLabelDataAttribute}>{stopLabel}</span>
          <span className={styles.facilityNumber}>
            {String(activeIndex + 1).padStart(2, "0")} / {placements.length}
          </span>
          <span className={styles.facilityRule} />
        </div>
        <div
          className={styles.facilityName}
          data-sanity={activePlacement.nameDataAttribute}
        >
          {activePlacement.name}
        </div>
        <p
          className={styles.facilityDescription}
          data-sanity={activePlacement.descriptionDataAttribute}
        >
          {activePlacement.description}
        </p>
      </div>

      {activePlacement.featuredImage ? (
        <figure className={styles.facilityPhoto}>
          <div className={styles.facilityPhotoImage}>
            <Image
              alt={activePlacement.featuredImage.alt}
              blurDataURL={activePlacement.featuredImage.lqip}
              className={styles.facilityImage}
              fill
              placeholder={
                activePlacement.featuredImage.lqip ? "blur" : "empty"
              }
              sizes="244px"
              src={activePlacement.featuredImage.url}
            />
          </div>
          <figcaption>{activePlacement.name.toUpperCase()}</figcaption>
        </figure>
      ) : null}
    </div>
  );
}
