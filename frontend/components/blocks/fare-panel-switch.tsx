"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

/** One fare, with its click-to-edit attributes resolved on the server. */
export type FarePanelFare = {
  key: string;
  name: string;
  price: string;
  unit?: string;
  note?: string;
  sanity: {
    fare?: string;
    price?: string;
    unit?: string;
    note?: string;
  };
};

/*
 * The price box: one price at a time, and a segmented switch to change the
 * fare. The box is always a white card with Pine Night ink so it reads the
 * same on every field. The note under the box follows the selected fare.
 */
export function FarePanelSwitch({
  fares,
  sanity,
}: Readonly<{
  fares: FarePanelFare[];
  sanity?: string;
}>) {
  const [selectedKey, setSelectedKey] = useState(fares[0]?.key);
  const selected = fares.find((fare) => fare.key === selectedKey) ?? fares[0];
  if (!selected) return null;

  return (
    <div data-sanity={sanity}>
      <div
        className="flex flex-col gap-5 rounded-[var(--radius-lg)] border border-pine-night/10 bg-white p-5 text-pine-night sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-7 sm:py-6"
        data-sanity={selected.sanity.fare}
      >
        <p aria-live="polite" className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span
            className="font-display text-[clamp(2.5rem,5vw,3.5rem)] font-extrabold leading-none tracking-[-0.03em] tabular-nums"
            data-sanity={selected.sanity.price}
            key={selected.key}
          >
            {selected.price}
          </span>
          {selected.unit ? (
            <span
              className="text-[15px] font-medium text-ink-soft"
              data-sanity={selected.sanity.unit}
            >
              {selected.unit}
            </span>
          ) : null}
        </p>

        {fares.length > 1 ? (
          <div
            aria-label="Fare"
            className="inline-flex shrink-0 self-start rounded-pill border border-pine-night/12 bg-birch-bark p-1 sm:self-auto"
            role="group"
          >
            {fares.map((fare) => {
              const active = fare.key === selected.key;
              return (
                <button
                  aria-pressed={active}
                  className={cn(
                    "focus-ring rounded-pill px-4 py-2 text-[14px] font-semibold leading-none transition-[background-color,color] motion-base motion-reduce:transition-none",
                    active
                      ? "bg-pine-night text-birch-bark"
                      : "text-ink-soft hover:text-pine-night",
                  )}
                  key={fare.key}
                  onClick={() => setSelectedKey(fare.key)}
                  type="button"
                >
                  {fare.name}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {selected.note ? (
        <p
          className="mt-4 text-[15px] leading-snug text-current/75"
          data-sanity={selected.sanity.note}
        >
          {selected.note}
        </p>
      ) : null}
    </div>
  );
}
