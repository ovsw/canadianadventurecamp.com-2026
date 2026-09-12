"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./large-slides.module.css";

export type LargeSlide = Readonly<{
  key: string;
  labelId: string;
  textId: string;
  /** Two-digit slide number, e.g. "03". */
  number: string;
  /** Pinned desktop photo, or null when the slide has no image. */
  photo: ReactNode;
  /** Photo shown above the copy when slides stack on phones. */
  stackedPhoto: ReactNode;
  copy: ReactNode;
}>;

type LargeSlidesTrackProps = Readonly<{
  slides: readonly LargeSlide[];
  dataSanity?: string;
}>;

/*
 * Desktop: the photo frame pins and shows the photo of whichever slide
 * currently crosses the middle of the viewport. A single IntersectionObserver
 * with a one-pixel band at 50% viewport height reports which slide is there.
 * Phones never pin, so the observer only matters from the desktop breakpoint
 * where the pinned frame is visible; running it everywhere is harmless.
 */
export default function LargeSlidesTrack({
  dataSanity,
  slides,
}: LargeSlidesTrackProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof IntersectionObserver === "undefined") return;
    const items = Array.from(list.children) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = items.indexOf(entry.target as HTMLElement);
          if (index >= 0) setActiveIndex(index);
        }
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [slides.length]);

  const active = slides[activeIndex] ?? slides[0];

  return (
    <div className={styles.grid}>
      <div aria-hidden="true" className={styles.photo}>
        <div className={styles.frame}>
          {slides.map((slide, index) => (
            <div
              className={styles.layer}
              data-active={index === activeIndex ? "" : undefined}
              key={slide.key}
            >
              {slide.photo}
            </div>
          ))}
          <p className={styles.counter}>{active?.number}</p>
        </div>
      </div>
      <ol
        aria-label="Slides, in order"
        className={cn("m-0 list-none p-0", styles.list)}
        data-sanity={dataSanity}
        ref={listRef}
        role="list"
      >
        {slides.map((slide) => (
          <li
            aria-describedby={slide.textId}
            aria-labelledby={slide.labelId}
            className={styles.slide}
            key={slide.key}
          >
            <div className={styles.stackedPhoto}>{slide.stackedPhoto}</div>
            {slide.copy}
          </li>
        ))}
      </ol>
    </div>
  );
}
