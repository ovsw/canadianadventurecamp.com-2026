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
import styles from "./testimonials.module.css";

export type TestimonialSlide = Readonly<{
  key: string;
  node: ReactNode;
}>;

type TestimonialsCarouselProps = Readonly<{
  /** Accessible name for the carousel region, e.g. "Testimonials: In their words". */
  label: string;
  slides: readonly TestimonialSlide[];
  dataSanity?: string;
}>;

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Index of the slide whose centre is nearest the track's centre. */
const nearestIndex = (track: HTMLElement) => {
  const centre = track.scrollLeft + track.clientWidth / 2;
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  Array.from(track.children).forEach((child, index) => {
    const slide = child as HTMLElement;
    const distance = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - centre);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  return best;
};

/**
 * One testimonial centred on stage, with its neighbours peeking in from both
 * edges of the viewport. The track is a native scroll-snap strip, so swipe,
 * trackpad, and scroll-wheel all work without JavaScript; the script only
 * tracks which slide is centred and drives the dots and arrow buttons.
 */
export default function TestimonialsCarousel({
  dataSanity,
  label,
  slides,
}: TestimonialsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | undefined>(undefined);
  const [index, setIndex] = useState(0);
  const count = slides.length;

  const syncIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setIndex(nearestIndex(track));
  }, []);

  const onScroll = useCallback(() => {
    if (frameRef.current !== undefined) return;
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = undefined;
      syncIndex();
    });
  }, [syncIndex]);

  useEffect(() => {
    syncIndex();
    return () => {
      if (frameRef.current !== undefined) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [syncIndex]);

  const goTo = useCallback(
    (target: number) => {
      const track = trackRef.current;
      if (!track) return;
      const next = Math.min(count - 1, Math.max(0, target));
      const slide = track.children[next] as HTMLElement | undefined;
      if (!slide) return;
      track.scrollTo({
        left: slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2,
        behavior: reducedMotion() ? "auto" : "smooth",
      });
    },
    [count],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        goTo(index + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        goTo(index - 1);
        break;
      case "Home":
        event.preventDefault();
        goTo(0);
        break;
      case "End":
        event.preventDefault();
        goTo(count - 1);
        break;
      default:
    }
  };

  const atStart = index <= 0;
  const atEnd = index >= count - 1;

  return (
    <div className="grid gap-10">
      <div className={styles.stage}>
        <div
          aria-label={label}
          aria-roledescription="carousel"
          className={styles.track}
          data-sanity={dataSanity}
          onKeyDown={onKeyDown}
          onScroll={onScroll}
          ref={trackRef}
          role="region"
          tabIndex={0}
        >
          {slides.map((slide, slideIndex) => (
            <div
              aria-label={`${slideIndex + 1} of ${count}`}
              aria-roledescription="slide"
              className={styles.slide}
              data-active={slideIndex === index ? "true" : undefined}
              key={slide.key}
              role="group"
            >
              {slide.node}
            </div>
          ))}
        </div>
      </div>

      {count > 1 ? (
        <div className="container-content flex items-center justify-center gap-4">
          <button
            aria-label="Previous testimonial"
            className={styles.arrow}
            disabled={atStart}
            onClick={() => goTo(index - 1)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <div className="flex items-center" role="group" aria-label="Choose a testimonial">
            {slides.map((slide, slideIndex) => (
              <button
                aria-current={slideIndex === index ? "true" : undefined}
                aria-label={`Go to testimonial ${slideIndex + 1}`}
                className={styles.dot}
                key={slide.key}
                onClick={() => goTo(slideIndex)}
                type="button"
              >
                <span aria-hidden="true" />
              </button>
            ))}
          </div>
          <button
            aria-label="Next testimonial"
            className={styles.arrow}
            disabled={atEnd}
            onClick={() => goTo(index + 1)}
            type="button"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
          <p aria-live="polite" className="sr-only">
            Testimonial {index + 1} of {count}
          </p>
        </div>
      ) : null}
    </div>
  );
}
