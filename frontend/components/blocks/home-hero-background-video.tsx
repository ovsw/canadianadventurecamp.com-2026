"use client";

import {
  MuxBackgroundVideo,
  type MuxBackgroundVideoRef,
} from "@mux/mux-background-video/react";
import { useEffect, useRef, useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function prefersReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function muxStreamUrl(playbackId: string) {
  return `https://stream.mux.com/${encodeURIComponent(playbackId)}.m3u8`;
}

type HomeHeroBackgroundVideoProps = {
  /** Public playback ID of a Mux asset with basic or premium quality. */
  playbackId: string;
  poster?: string;
};

/**
 * Muted, looping Mux stream behind the home hero. Mux's background engine
 * picks a rendition for the connection (adaptive streaming) and never loads
 * audio. If the stream fails, the poster and the hero image under it stay
 * visible.
 */
export default function HomeHeroBackgroundVideo({
  playbackId,
  poster,
}: HomeHeroBackgroundVideoProps) {
  const reduceMotion = useSyncExternalStore(
    subscribe,
    prefersReducedMotion,
    () => true,
  );
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<MuxBackgroundVideoRef>(null);

  // Decoding a looping video is constant CPU/GPU work, so pause it whenever
  // the hero is scrolled out of view.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new IntersectionObserver(([entry]) => {
      const video = videoRef.current;
      if (entry?.isIntersecting) video?.play?.().catch(() => {});
      else video?.pause?.();
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div ref={frameRef} aria-hidden="true" className="absolute inset-0">
      <MuxBackgroundVideo
        ref={videoRef}
        maxResolution="1080p"
        poster={poster}
        src={muxStreamUrl(playbackId)}
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}
