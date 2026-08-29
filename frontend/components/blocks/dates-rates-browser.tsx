"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./dates-rates-section.module.css";
import {
  enrollmentHref,
  formatRate,
  getSeasonTicks,
  maxSessionRows,
  type ConditionBlock,
  type PreparedLength,
} from "./dates-rates-model";

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
    return "text-pine-night/40";
  }
  if (status === "limited") {
    return "text-campfire-amber-deep";
  }
  return "text-pine-night/60";
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
    <div className="md:rounded-[1.75rem] md:border md:border-pine-night/10 md:bg-birch-bark-bright md:p-8 md:shadow-[0_30px_70px_rgba(22,32,15,0.12)]">
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
          <div className="mb-3 hidden gap-3 md:grid md:grid-cols-[7.5rem_1fr] md:gap-3.5">
            <span className="text-label hidden self-end text-pine-night/45 md:block">
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
          </div>

          <div className="relative flex flex-1 flex-col justify-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 hidden md:grid md:grid-cols-[7.5rem_1fr] md:gap-3.5"
            >
              <span />
              {/* Inset matches the bar track padding so dividers align with bar edges. */}
              <span className="relative mx-[5px] block">
                <span className="absolute inset-y-0 left-1/4 border-l border-dashed border-pine-night/14" />
                <span className="absolute inset-y-0 left-1/2 border-l border-dashed border-pine-night/14" />
                <span className="absolute inset-y-0 left-3/4 border-l border-dashed border-pine-night/14" />
              </span>
            </div>
            {slots.map(({ isOpenSlot, row }, index) => {
              const isFull = isOpenSlot && row.isFull;
              const interactive = isOpenSlot && !isFull;
              const RowElement = interactive ? "a" : "div";
              // Availability label sits in the empty track beside the bar;
              // when the bar ends near the right edge, flip it to the left side.
              const labelOnLeft = row.left + row.width > 85;

              return (
                <div
                  className={`${styles.slot} ${isOpenSlot ? styles.slotOpen : ""}`}
                  key={index}
                >
                  <RowElement
                    aria-hidden={isOpenSlot ? undefined : true}
                    className={`${styles.row} flex h-full flex-col justify-center gap-y-2 pb-1.5 pt-4 no-underline md:grid md:grid-cols-[7.5rem_1fr] md:items-center md:gap-3.5 md:py-[9px] ${interactive ? "" : "pointer-events-none"}`}
                    data-open={interactive}
                    {...(interactive
                      ? {
                          href: enrollmentHref,
                          rel: "noreferrer",
                          target: "_blank",
                        }
                      : {})}
                  >
                    <span className="flex items-baseline gap-x-3 md:flex-col md:items-start md:gap-y-1">
                      <span
                        className={`${styles.dates} font-mono text-xs uppercase tracking-[0.08em]`}
                        data-sanity={row.startDateAttribute}
                      >
                        {row.dates}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-pine-night/45">
                        {row.weeksLabel}
                      </span>
                    </span>
                    <span className="relative block h-10 overflow-hidden rounded-pill bg-pine-night/5">
                      {/* Padded coordinate system: bars at 0%/100% keep a 5px gap from the track ends. */}
                      <span className="absolute inset-y-0 left-[5px] right-[5px] block">
                        {/* Mobile dividers: the desktop overlay grid is hidden below md. */}
                        <span aria-hidden="true" className="absolute inset-y-0 left-1/4 border-l border-dashed border-pine-night/14 md:hidden" />
                        <span aria-hidden="true" className="absolute inset-y-0 left-1/2 border-l border-dashed border-pine-night/14 md:hidden" />
                        <span aria-hidden="true" className="absolute inset-y-0 left-3/4 border-l border-dashed border-pine-night/14 md:hidden" />
                        <span
                          className={`${styles.bar} inline-flex items-center justify-center font-mono text-[11px] font-bold uppercase tracking-[0.12em] ${isFull ? styles.barFull : ""} ${row.status === "limited" ? styles.barLimited : ""}`}
                          data-sanity={row.availabilityStatusAttribute}
                          style={{ left: `${row.left}%`, width: `${row.width}%` }}
                        >
                          {interactive ? <>Enroll&nbsp;&rarr;</> : null}
                        </span>
                        <span
                          className={`absolute inset-y-0 inline-flex items-center whitespace-nowrap font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] ${availabilityClass(row.status)}`}
                          data-sanity={row.availabilityNoteAttribute}
                          style={
                            labelOnLeft
                              ? { right: `calc(${100 - row.left}% + 12px)` }
                              : { left: `calc(${row.left + row.width}% + 12px)` }
                          }
                        >
                          {row.label}
                        </span>
                      </span>
                    </span>
                  </RowElement>
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
          {sessionIncludes.map((item, i) => (
            <li
              className="flex items-baseline gap-2.5"
              data-sanity={item.dataSanity}
              key={item._key || i}
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
          <span key={condition._key || index}>
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
