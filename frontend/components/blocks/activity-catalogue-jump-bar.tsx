"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import styles from "./activity-catalogue.module.css";

export type JumpBarGroup = { id: string; title: string };

/*
 * Sticky jump bar for the Activity Catalogue.
 *
 * A list of in-page links, one text link per place. The link whose group currently
 * fills the reading band (roughly the upper-middle of the viewport) carries
 * aria-current="location" and an underline. On phones the row scrolls
 * sideways and the current link is nudged into view without moving the page.
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
        "sticky z-40 -mx-(--gutter) border-y border-pine-night/20 bg-navigation-yellow px-(--gutter) py-3",
        styles.jumpBar,
      )}
      data-sanity={dataSanity}
    >
      <ul
        className={cn(
          "m-0 flex list-none gap-6 overflow-x-auto p-0",
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
                  "focus-ring inline-flex min-h-11 items-center whitespace-nowrap py-2 text-base font-semibold text-pine-night underline-offset-4 transition-colors motion-base",
                  current
                    ? "underline decoration-2"
                    : "hover:underline",
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
