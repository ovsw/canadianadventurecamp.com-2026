"use client";

import { useState } from "react";
import {
  enrollmentHref,
  type PreparedLength,
} from "./dates-rates-model";

function availabilityClass(status: string) {
  if (status === "full") {
    return "border-ember-red/30 bg-ember-red/10 text-ember-red";
  }
  if (status === "limited") {
    return "border-campfire-amber/50 bg-campfire-amber/20 text-pine-night";
  }
  return "border-cedar/35 bg-cedar/10 text-cedar-deep";
}

export default function DatesRatesBrowser({
  lengths,
  seasonYear,
}: {
  lengths: PreparedLength[];
  seasonYear: number;
}) {
  const [selectedKey, setSelectedKey] = useState(lengths[0]?.key);
  const activeLength =
    lengths.find((length) => length.key === selectedKey) ?? lengths[0];

  if (!activeLength) return null;

  return (
    <div className="border border-pine-night/10 bg-birch-bark-bright p-5 md:p-8">
      <div
        aria-label="Session length"
        className="mb-8 flex flex-wrap gap-2"
        role="tablist"
      >
        {lengths.map((length) => {
          const selected = length.key === activeLength.key;
          return (
            <button
              aria-selected={selected}
              className={
                selected
                  ? "focus-ring rounded-pill border border-cedar bg-cedar px-5 py-3 text-sm font-bold uppercase tracking-[0.06em] text-birch-bark"
                  : "focus-ring rounded-pill border border-pine-night/18 bg-transparent px-5 py-3 text-sm font-bold uppercase tracking-[0.06em] text-pine-night/70 transition-colors hover:border-cedar hover:text-cedar motion-reduce:transition-none"
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

      <div className="grid gap-10 lg:grid-cols-[300px_1fr] lg:gap-14">
        <aside>
          <p className="text-label text-pine-night/50">
            Per camper · all-inclusive
          </p>
          <p
            className="mt-3 font-display text-[clamp(3.5rem,7vw,4.75rem)] font-extrabold leading-none"
            data-sanity={activeLength.rateAttribute}
          >
            {activeLength.rate}
          </p>
          <p className="text-label text-pine-night/55">+ tax</p>
          <p
            className="mt-4 font-accent text-3xl font-semibold leading-tight text-cedar"
            data-sanity={activeLength.descriptionAttribute}
          >
            {activeLength.description}
          </p>
          <a
            className="focus-ring mt-7 inline-flex rounded-pill bg-campfire-amber px-7 py-4 font-bold text-pine-night transition-colors hover:bg-campfire-amber-deep motion-reduce:transition-none"
            href={enrollmentHref}
            rel="noreferrer"
            target="_blank"
          >
            Enroll for {seasonYear}
          </a>
        </aside>

        <div>
          <div className="mb-3 grid grid-cols-[1fr_auto] gap-4 md:grid-cols-[150px_1fr_140px]">
            <span className="text-label text-pine-night/45">Session dates</span>
            <span className="hidden md:block" />
            <span className="justify-self-end text-label text-pine-night/45">
              Availability
            </span>
          </div>

          <div className="divide-y divide-pine-night/10">
            {activeLength.rows.map((row) => {
              const content = (
                <>
                  <span
                    className="font-mono text-xs uppercase tracking-[0.08em] text-pine-night/62"
                    data-sanity={row.startDateAttribute}
                  >
                    {row.dates}
                  </span>
                  <span
                    className="relative order-3 block h-11 rounded-pill bg-pine-night/5 md:order-none"
                    data-sanity={row.availabilityStatusAttribute}
                  >
                    <span className="absolute top-1.5 bottom-1.5 left-1/4 border-l border-dashed border-pine-night/15" />
                    <span className="absolute top-1.5 bottom-1.5 left-1/2 border-l border-dashed border-pine-night/15" />
                    <span className="absolute top-1.5 bottom-1.5 left-3/4 border-l border-dashed border-pine-night/15" />
                    <span
                      className={`absolute top-1.5 bottom-1.5 rounded-pill ${row.barClass}`}
                      style={{ left: `${row.left}%`, width: `${row.width}%` }}
                    />
                    {!row.isFull ? (
                      <span className="absolute inset-y-0 right-4 hidden items-center font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-cedar md:inline-flex">
                        Enroll -&gt;
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={`justify-self-end rounded-pill border px-3 py-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] ${availabilityClass(row.status)}`}
                    data-sanity={row.availabilityNoteAttribute}
                  >
                    {row.label}
                  </span>
                </>
              );

              return row.isFull ? (
                <div
                  className="grid grid-cols-[1fr_auto] gap-3 py-3 md:grid-cols-[150px_1fr_140px] md:items-center md:gap-4"
                  key={row._key}
                >
                  {content}
                </div>
              ) : (
                <a
                  className="focus-ring grid grid-cols-[1fr_auto] gap-3 py-3 no-underline transition-colors hover:text-cedar motion-reduce:transition-none md:grid-cols-[150px_1fr_140px] md:items-center md:gap-4"
                  href={enrollmentHref}
                  key={row._key}
                  rel="noreferrer"
                  target="_blank"
                >
                  {content}
                </a>
              );
            })}
          </div>

          <p className="mt-5 text-label text-pine-night/40">
            Try another Session length and watch the summer reshape.
          </p>
        </div>
      </div>
    </div>
  );
}
