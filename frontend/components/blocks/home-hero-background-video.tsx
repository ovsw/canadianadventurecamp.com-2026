"use client";

import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function prefersReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

type HomeHeroBackgroundVideoProps = {
  poster?: string;
  src: string;
};

export default function HomeHeroBackgroundVideo({
  poster,
  src,
}: HomeHeroBackgroundVideoProps) {
  const reduceMotion = useSyncExternalStore(
    subscribe,
    prefersReducedMotion,
    () => true,
  );

  if (reduceMotion) return null;

  return (
    <video
      aria-hidden="true"
      autoPlay
      className="absolute inset-0 size-full object-cover"
      loop
      muted
      playsInline
      poster={poster}
      src={src}
    />
  );
}
