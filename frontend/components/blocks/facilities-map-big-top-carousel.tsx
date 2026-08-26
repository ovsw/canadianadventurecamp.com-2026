"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./facilities-map-section.module.css";

export type BigTopSlide = {
  alt: string;
  caption: string;
  key: string;
  lqip?: string;
  url: string;
};

export default function FacilitiesMapBigTopCarousel({
  autoplay,
  slides,
}: {
  autoplay: boolean;
  slides: BigTopSlide[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReducedMotion(media.matches);
    syncPreference();
    media.addEventListener("change", syncPreference);
    return () => media.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    if (!autoplay || paused || reducedMotion || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [autoplay, paused, reducedMotion, slides.length]);

  if (!slides.length) return null;
  const activeSlide = slides[activeIndex] ?? slides[0];

  const select = (index: number) => {
    setActiveIndex(index);
    setPaused(true);
  };

  return (
    <div
      className={styles.carousel}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      onFocus={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, index) => (
        <div
          aria-hidden={index !== activeIndex}
          className={`${styles.carouselSlide} ${
            index === activeIndex ? styles.carouselSlideActive : ""
          }`}
          key={slide.key}
        >
          <Image
            alt={index === activeIndex ? slide.alt : ""}
            blurDataURL={slide.lqip}
            className={styles.carouselImage}
            fill
            placeholder={slide.lqip ? "blur" : "empty"}
            sizes="(max-width: 1023px) calc(100vw - 64px), 48vw"
            src={slide.url}
          />
        </div>
      ))}
      <div className={styles.carouselShade} />
      <p className={styles.carouselCaption} aria-live="polite">
        {activeSlide.caption}
      </p>

      {slides.length > 1 ? (
        <>
          <button
            aria-label="Previous photo"
            className={`${styles.carouselButton} ${styles.carouselPrevious}`}
            onClick={() => select((activeIndex - 1 + slides.length) % slides.length)}
            type="button"
          >
            ‹
          </button>
          <button
            aria-label="Next photo"
            className={`${styles.carouselButton} ${styles.carouselNext}`}
            onClick={() => select((activeIndex + 1) % slides.length)}
            type="button"
          >
            ›
          </button>
          <div className={styles.carouselDots}>
            {slides.map((slide, index) => (
              <button
                aria-label={`Show photo ${index + 1} of ${slides.length}`}
                aria-pressed={index === activeIndex}
                className={`${styles.carouselDot} ${
                  index === activeIndex ? styles.carouselDotActive : ""
                }`}
                key={slide.key}
                onClick={() => select(index)}
                type="button"
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
