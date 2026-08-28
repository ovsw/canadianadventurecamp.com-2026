"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./dates-rates-section.module.css";
import {
  enrollmentHref,
  formatRate,
  getSeasonTicks,
  maxSessionRows,
  type PreparedLength,
} from "./dates-rates-model";

/** One paragraph of the minimal rich text conditions field: bold/italic spans only. */
export type ConditionBlock = {
  _key: string;
  children?:
    | { _key: string; text?: string | null; marks?: string[] | null }[]
    | null;
};

function renderConditionBlock(block: ConditionBlock) {
  return block.children?.map((span) => {
    const marks = span.marks ?? [];
    let node: React.ReactNode = span.text;
    if (marks.includes("em")) node = <em>{node}</em>;
    if (marks.includes("strong")) {
      node = (
        <strong className="font-semibold text-pine-night/85">{node}</strong>
      );
    }
    return <span key={span._key}>{node}</span>;
  });
}

function availabilityClass(status: string) {
  if (status === "full") {
    return "border-pine-night bg-pine-night text-birch-bark/92";
  }
  if (status === "limited") {
    return "border-campfire-amber bg-campfire-amber text-pine-night";
  }
  return "border-pine-night/28 bg-transparent text-pine-night/70";
}

/** Animates the displayed rate from its previous value to the active length's rate over ~620ms. */
function useAnimatedRate(rateValue: number) {
  const [displayValue, setDisplayValue] = useState(rateValue);
  const previousRateRef = useRef(rateValue);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const from = previousRateRef.current;
    const to = rateValue;
    previousRateRef.current = rateValue;

    if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (from === to || reduceMotion) {
      setDisplayValue(to);
      return;
    }

    const duration = 620;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayValue(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    };
  }, [rateValue]);

  return displayValue;
}

export default function DatesRatesBrowser({
  conditions,
  conditionsDataAttribute,
  lengths,
  seasonStart,
  seasonYear,
  sessionIncludes,
  sessionIncludesDataAttribute,
}: {
  conditions: ConditionBlock[];
  conditionsDataAttribute?: string;
  lengths: PreparedLength[];
  seasonStart: string;
  seasonYear: number;
  sessionIncludes: {
    _key: string;
    label?: string | null;
    dataSanity?: string;
  }[];
  sessionIncludesDataAttribute?: string;
}) {
  const [selectedKey, setSelectedKey] = useState(lengths[0]?.key);
  const activeLength =
    lengths.find((length) => length.key === selectedKey) ?? lengths[0];
  const ticks = useMemo(() => getSeasonTicks(seasonStart), [seasonStart]);
  const animatedRate = useAnimatedRate(activeLength?.rateValue ?? 0);

  if (!activeLength) return null;

  const slots = Array.from({ length: maxSessionRows }, (_, index) => {
    const isOpenSlot = index < activeLength.rows.length;
    const row =
      activeLength.rows[Math.min(index, activeLength.rows.length - 1)];
    return { isOpenSlot, row };
  });

  return (
    <div className="rounded-[1.75rem] border border-pine-night/10 bg-birch-bark-bright p-5 shadow-[0_30px_70px_rgba(22,32,15,0.12)] md:p-8">
      <div className="flex flex-col lg:block">
      <div className="max-lg:contents lg:mb-9 lg:flex lg:flex-wrap lg:items-center lg:gap-3">
        <div
          aria-label="Session length"
          className="order-2 mt-8 flex flex-wrap gap-2 lg:order-none lg:mt-0"
          role="tablist"
        >
          {lengths.map((length) => {
            const selected = length.key === activeLength.key;
            return (
              <button
                aria-selected={selected}
                className={
                  selected
                    ? `focus-ring rounded-pill border border-cedar bg-cedar px-5 py-3 text-sm font-bold uppercase tracking-[0.06em] text-birch-bark ${styles.tab}`
                    : `focus-ring rounded-pill border border-pine-night/18 bg-transparent px-5 py-3 text-sm font-bold uppercase tracking-[0.06em] text-pine-night/70 motion-reduce:transition-none ${styles.tab}`
                }
                key={length.key}
                onClick={() => setSelectedKey(length.key)}
                role="tab"
                type="button"
              >
                {length.label}
              </button>
            );
          })}
        </div>
        <a
          className="focus-ring order-4 mt-8 inline-flex w-fit items-center gap-2 rounded-pill bg-campfire-amber px-7 py-4 font-bold text-pine-night transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-campfire-amber-deep motion-reduce:transition-none motion-reduce:hover:translate-y-0 lg:order-none lg:ml-auto lg:mt-0"
          href={enrollmentHref}
          rel="noreferrer"
          target="_blank"
        >
          Enroll for {seasonYear}
          <span aria-hidden="true">&rarr;</span>
        </a>
      </div>

      <div className="max-lg:contents lg:grid lg:grid-cols-[320px_1fr] lg:gap-14">
        <aside className="order-1 lg:order-none">
          <p className="text-label text-pine-night/50">
            Per camper &middot; all-inclusive
          </p>
          <div className="mt-3 flex items-baseline gap-2.5">
            <span
              className="font-display text-[clamp(3.5rem,7vw,4.75rem)] font-extrabold leading-none tabular-nums"
              data-sanity={activeLength.rateAttribute}
            >
              {formatRate(animatedRate)}
            </span>
            <span className="font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-pine-night/75">
              +tax
            </span>
          </div>
          <p
            className="mt-3 font-accent text-3xl font-semibold leading-tight text-cedar"
            data-sanity={activeLength.descriptionAttribute}
          >
            {activeLength.description}
          </p>
        </aside>

        <div className="order-3 mt-6 flex flex-col lg:order-none lg:mt-0">
          <div className="mb-3 grid grid-cols-[1fr_auto] gap-3 md:grid-cols-[7.5rem_1fr_8rem] md:gap-3.5">
            <span className="text-label self-end text-pine-night/45">
              Session dates
            </span>
            <span className="relative hidden h-[15px] md:block">
              {ticks.map((tick, index) => (
                <span
                  className={`absolute bottom-0 font-mono text-[10px] uppercase tracking-[0.12em] text-pine-night/45 ${index % 2 === 1 ? "hidden xl:inline" : ""}`}
                  key={tick.date}
                  style={
                    index === 0
                      ? { left: 0 }
                      : index === ticks.length - 1
                        ? { right: 0 }
                        : {
                            left: `${(index / (ticks.length - 1)) * 100}%`,
                            transform: "translateX(-50%)",
                          }
                  }
                >
                  {tick.label}
                </span>
              ))}
            </span>
            <span className="text-label justify-self-end self-end text-pine-night/45">
              Availability
            </span>
          </div>

          <div className="relative flex flex-1 flex-col justify-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 hidden md:grid md:grid-cols-[7.5rem_1fr_8rem] md:gap-3.5"
            >
              <span />
              <span className="relative block">
                <span className="absolute inset-y-0 left-1/4 border-l border-dashed border-pine-night/14" />
                <span className="absolute inset-y-0 left-1/2 border-l border-dashed border-pine-night/14" />
                <span className="absolute inset-y-0 left-3/4 border-l border-dashed border-pine-night/14" />
              </span>
              <span />
            </div>
            {slots.map(({ isOpenSlot, row }, index) => {
              const isFull = isOpenSlot && row.isFull;
              const interactive = isOpenSlot && !isFull;

              return (
                <div
                  className={`${styles.slot} ${isOpenSlot ? styles.slotOpen : ""}`}
                  key={index}
                >
                  <a
                    aria-disabled={!interactive}
                    aria-hidden={!isOpenSlot}
                    className={`${styles.row} grid h-full grid-cols-[1fr_auto] gap-3 py-[9px] no-underline md:grid-cols-[7.5rem_1fr_8rem] md:items-center md:gap-3.5 ${interactive ? "" : "pointer-events-none"}`}
                    data-open={interactive}
                    href={enrollmentHref}
                    rel="noreferrer"
                    target="_blank"
                    tabIndex={interactive ? 0 : -1}
                  >
                    <span
                      className={`${styles.dates} font-mono text-xs uppercase tracking-[0.08em]`}
                      data-sanity={row.startDateAttribute}
                    >
                      {row.dates}
                    </span>
                    <span className="relative order-3 block h-10 rounded-pill bg-pine-night/5 md:order-none">
                      <span
                        className={`${styles.bar} ${isFull ? styles.barFull : ""}`}
                        data-sanity={row.availabilityStatusAttribute}
                        style={{ left: `${row.left}%`, width: `${row.width}%` }}
                      />
                      {interactive ? (
                        <span
                          className={`${styles.enrollHint} absolute inset-y-0 right-4 hidden items-center font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-cedar md:inline-flex`}
                        >
                          Enroll &rarr;
                        </span>
                      ) : null}
                    </span>
                    <span
                      className={`inline-flex items-center gap-[7px] justify-self-end whitespace-nowrap rounded-pill border px-3 py-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] transition-colors ${availabilityClass(row.status)}`}
                      data-sanity={row.availabilityNoteAttribute}
                    >
                      {row.status === "limited" ? (
                        <span aria-hidden="true" className={styles.availabilityDot} />
                      ) : null}
                      {row.label}
                    </span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-[320px_1fr] lg:gap-14 lg:items-baseline">
        <p className="text-label whitespace-nowrap text-pine-night/50 lg:text-right">
          Every session includes
        </p>
        <ul
          className="grid grid-cols-2 gap-x-10 gap-y-3.5 sm:flex sm:flex-wrap sm:gap-x-10 sm:gap-y-3.5"
          data-sanity={sessionIncludesDataAttribute}
        >
          {sessionIncludes.map((item) => (
            <li
              className="flex items-baseline gap-2.5"
              data-sanity={item.dataSanity}
              key={item._key}
            >
              <span aria-hidden="true" className="shrink-0 font-bold text-cedar">
                &#10003;
              </span>
              <span className="text-[17px] font-semibold leading-snug text-pine-night/88">
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p
        className="mt-6 border-t border-dashed border-pine-night/16 pt-6 text-sm leading-relaxed text-pine-night/70"
        data-sanity={conditionsDataAttribute}
      >
        {conditions.map((condition, index) => (
          <span key={condition._key}>
            {index > 0 ? (
              <span
                aria-hidden="true"
                className="px-2.5 align-[-1px] text-cedar"
              >
                &#9679;
              </span>
            ) : null}
            {renderConditionBlock(condition)}
          </span>
        ))}
      </p>
    </div>
  );
}
