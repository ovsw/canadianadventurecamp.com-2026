"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
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
 *
 * The carousel auto-advances. The active dot doubles as the timer: a fill
 * grows across it with a CSS animation whose end fires the next slide, so the
 * bar and the advance can never drift apart, and pausing the animation pauses
 * the advance. It pauses while the pointer is over the carousel, while
 * anything inside it has focus, and while the tab is hidden. A pause button
 * stops it until the visitor starts it again. Reduced motion turns autoplay
 * off.
 */
export default function TestimonialsCarousel({
  dataSanity,
  label,
  slides,
}: TestimonialsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | undefined>(undefined);
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [stopped, setStopped] = useState(false);
  const count = slides.length;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAutoplay(count > 1 && !motion.matches);
    update();
    motion.addEventListener("change", update);
    return () => motion.removeEventListener("change", update);
  }, [count]);

  useEffect(() => {
    const update = () => setHidden(document.visibilityState === "hidden");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

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

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  const atStart = index <= 0;
  const atEnd = index >= count - 1;
  const paused = stopped || hovered || focused || hidden;

  return (
    <div
      className="grid gap-10"
      data-autoplay={autoplay ? "true" : undefined}
      data-paused={paused ? "true" : undefined}
      onBlur={onBlur}
      onFocus={() => setFocused(true)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
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
                <span aria-hidden="true">
                  {autoplay && slideIndex === index ? (
                    <i
                      className={styles.timer}
                      onAnimationEnd={() => goTo((index + 1) % count)}
                    />
                  ) : null}
                </span>
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
          {autoplay ? (
            <button
              aria-label={stopped ? "Start automatic rotation" : "Stop automatic rotation"}
              aria-pressed={stopped}
              className={styles.arrow}
              onClick={() => setStopped((value) => !value)}
              type="button"
            >
              {stopped ? (
                <Play aria-hidden="true" className="size-4" />
              ) : (
                <Pause aria-hidden="true" className="size-4" />
              )}
            </button>
          ) : null}
          <p aria-live={autoplay && !paused ? "off" : "polite"} className="sr-only">
            Testimonial {index + 1} of {count}
          </p>
        </div>
      ) : null}
    </div>
  );
}
