"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import styles from "./activity-catalogue.module.css";

export type JumpBarGroup = { id: string; title: string };

/*
 * Sticky jump bar for the Activity Catalogue.
 *
 * A list of in-page links, one chip per place. The chip whose group currently
 * fills the reading band (roughly the upper-middle of the viewport) carries
 * aria-current="location" and the amber outline. On phones the row scrolls
 * sideways and the current chip is nudged into view without moving the page.
 */
export default function ActivityCatalogueJumpBar({
  dataSanity,
  groups,
}: Readonly<{
  dataSanity?: string;
  groups: JumpBarGroup[];
}>) {
  const [currentId, setCurrentId] = useState<string | null>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const targets = groups
      .map((group) => document.getElementById(group.id))
      .filter((element): element is HTMLElement => element !== null);
    if (!targets.length) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.boundingClientRect.top);
          } else {
            visible.delete(entry.target.id);
          }
        }
        if (!visible.size) return;
        // The topmost group in the reading band wins.
        const [nextId] = [...visible.entries()].sort((a, b) => a[1] - b[1])[0];
        setCurrentId(nextId);
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: 0 },
    );

    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [groups]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !currentId || typeof track.scrollTo !== "function") return;
    const chip = track.querySelector<HTMLElement>(`[data-group-id="${currentId}"]`);
    if (!chip) return;

    const left = chip.offsetLeft - (track.clientWidth - chip.offsetWidth) / 2;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")
      .matches;
    track.scrollTo({ left, behavior: reduceMotion ? "auto" : "smooth" });
  }, [currentId]);

  return (
    <nav
      aria-label="Jump to a place on the island"
      className={cn(
        "sticky z-40 -mx-(--gutter) border-y border-birch-bark/12 bg-pine-night/85 px-(--gutter) py-3 backdrop-blur-md",
        styles.jumpBar,
      )}
      data-sanity={dataSanity}
    >
      <ul
        className={cn(
          "m-0 flex list-none gap-2 overflow-x-auto p-0",
          styles.jumpBarTrack,
        )}
        ref={trackRef}
      >
        {groups.map((group) => {
          const current = group.id === currentId;
          return (
            <li className="shrink-0" key={group.id}>
              <a
                aria-current={current ? "location" : undefined}
                className={cn(
                  "focus-ring inline-flex items-center whitespace-nowrap rounded-pill border px-3.5 py-2.5 text-label transition-colors motion-base",
                  current
                    ? "border-campfire-amber text-campfire-amber"
                    : "border-birch-bark/22 text-birch-bark/80 hover:border-birch-bark/50 hover:text-birch-bark",
                )}
                data-group-id={group.id}
                href={`#${group.id}`}
              >
                {group.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
