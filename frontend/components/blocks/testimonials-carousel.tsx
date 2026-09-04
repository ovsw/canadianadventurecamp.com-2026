"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

type TestimonialsCarouselProps = Readonly<{
  /** Accessible name for the swipe region, e.g. "What families say". */
  label: string;
  count: number;
  children: ReactNode;
  dataSanity?: string;
}>;

/** One card plus the gap after it; falls back to the track width, then 1px. */
const cardStep = (track: HTMLElement) => {
  const first = track.firstElementChild as HTMLElement | null;
  const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
  const cardWidth = first?.getBoundingClientRect().width ?? 0;
  return cardWidth + gap || track.clientWidth || 1;
};

/**
 * One card wide with horizontal swipe below `md`; a plain three-column grid
 * above it. The track is a labelled, focusable region so keyboard users can
 * reach it and move with the arrow keys; the buttons below it do the same
 * for pointer users on phones.
 */
export default function TestimonialsCarousel({
  children,
  count,
  dataSanity,
  label,
}: TestimonialsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const scrollByCards = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({
      left: direction * cardStep(track),
      behavior: reduced ? "auto" : "smooth",
    });
  }, []);

  const syncIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const step = cardStep(track);
    setIndex(Math.min(count - 1, Math.max(0, Math.round(track.scrollLeft / step))));
  }, [count]);

  useEffect(() => {
    syncIndex();
  }, [syncIndex]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollByCards(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByCards(-1);
    }
  };

  const atStart = index <= 0;
  const atEnd = index >= count - 1;

  return (
    <div className="grid gap-6">
      <div
        aria-label={label}
        aria-roledescription="carousel"
        className="-mx-(--gutter) flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-(--gutter) px-(--gutter) pb-2 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-cedar [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0"
        data-sanity={dataSanity}
        onKeyDown={onKeyDown}
        onScroll={syncIndex}
        ref={trackRef}
        role="region"
        tabIndex={0}
      >
        {children}
      </div>

      {count > 1 ? (
        <div className="flex items-center gap-4 md:hidden">
          <button
            aria-label="Previous testimonial"
            className="inline-flex size-11 items-center justify-center rounded-pill border border-pine-night/25 text-pine-night transition-[background-color,border-color,transform] motion-base hover:-translate-y-0.5 hover:border-cedar focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-cedar disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:border-pine-night/25"
            disabled={atStart}
            onClick={() => scrollByCards(-1)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button
            aria-label="Next testimonial"
            className="inline-flex size-11 items-center justify-center rounded-pill border border-pine-night/25 text-pine-night transition-[background-color,border-color,transform] motion-base hover:-translate-y-0.5 hover:border-cedar focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-cedar disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:border-pine-night/25"
            disabled={atEnd}
            onClick={() => scrollByCards(1)}
            type="button"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
          <p aria-live="polite" className="ml-auto text-label text-pine-night/60">
            {index + 1} / {count}
          </p>
        </div>
      ) : null}
    </div>
  );
}
