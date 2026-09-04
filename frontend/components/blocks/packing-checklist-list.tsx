"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, Printer, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./packing-checklist.module.css";

/**
 * The interactive half of the packing checklist.
 *
 * Ticks are the visitor's, not the CMS's: they live in localStorage under a
 * key scoped to the page path and section, so a camper can pack over several
 * evenings on the same phone. Printing isolates this section by hiding every
 * sibling on the path up to <body>, opens every group, and restores the page
 * on afterprint. The print stylesheet then shows empty boxes regardless of
 * what is ticked on screen.
 */

export type ChecklistItem = {
  key: string;
  label: string;
  quantity: string | null;
  sanity?: string;
};

export type ChecklistGroup = {
  key: string;
  title: string;
  tone: "normal" | "leaveAtHome";
  items: ChecklistItem[];
  sanity?: { title?: string; items?: string };
};

type PackingChecklistListProps = {
  groups: ChecklistGroup[];
  sectionId: string;
  sanity?: { groups?: string };
};

const STORAGE_PREFIX = "cac:packing-checklist";

function storageKeyFor(sectionId: string) {
  const path =
    typeof window === "undefined" ? "" : window.location.pathname || "/";
  return `${STORAGE_PREFIX}:${path}:${sectionId}`;
}

function readTicks(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

function writeTicks(key: string, ticks: string[]) {
  try {
    if (ticks.length) window.localStorage.setItem(key, JSON.stringify(ticks));
    else window.localStorage.removeItem(key);
  } catch {
    // Private mode or a full store: the page still works, ticks just do not persist.
  }
}

/** Hide every sibling on the path from `target` up to <body>. Returns the undo. */
function isolateForPrint(target: HTMLElement) {
  const hidden: Element[] = [];
  let node: HTMLElement | null = target;
  while (node && node !== document.body) {
    const parent: HTMLElement | null = node.parentElement;
    if (!parent) break;
    for (const sibling of Array.from(parent.children)) {
      if (sibling === node) continue;
      sibling.setAttribute("data-print-hidden", "");
      hidden.push(sibling);
    }
    node = parent;
  }
  return () => {
    for (const element of hidden) element.removeAttribute("data-print-hidden");
  };
}

/** Open every collapsed group so the whole list prints. Returns the undo. */
function openAllGroups(target: HTMLElement) {
  const closed = Array.from(target.querySelectorAll("details")).filter(
    (details) => !details.open,
  );
  for (const details of closed) details.open = true;
  return () => {
    for (const details of closed) details.open = false;
  };
}

export default function PackingChecklistList({
  groups,
  sanity,
  sectionId,
}: PackingChecklistListProps) {
  const [ticks, setTicks] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const restorePrintRef = useRef<(() => void) | null>(null);
  const storageKey = useMemo(() => storageKeyFor(sectionId), [sectionId]);

  // Read once after mount so the server and first client render agree.
  useEffect(() => {
    setTicks(readTicks(storageKey));
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (hydrated) writeTicks(storageKey, ticks);
  }, [hydrated, storageKey, ticks]);

  useEffect(() => {
    const handleAfterPrint = () => {
      restorePrintRef.current?.();
      restorePrintRef.current = null;
    };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  const tickable = useMemo(
    () =>
      groups
        .filter((group) => group.tone !== "leaveAtHome")
        .flatMap((group) => group.items.map((item) => item.key)),
    [groups],
  );
  const tickSet = useMemo(() => new Set(ticks), [ticks]);
  const packedCount = tickable.filter((key) => tickSet.has(key)).length;

  const toggle = useCallback((key: string, checked: boolean) => {
    setTicks((current) => {
      const next = current.filter((value) => value !== key);
      return checked ? [...next, key] : next;
    });
  }, []);

  const clear = useCallback(() => setTicks([]), []);

  const print = useCallback(() => {
    const section = rootRef.current?.closest("section");
    if (!section) {
      window.print();
      return;
    }
    restorePrintRef.current?.();
    const restoreSiblings = isolateForPrint(section);
    const restoreGroups = openAllGroups(section);
    restorePrintRef.current = () => {
      restoreSiblings();
      restoreGroups();
    };
    window.print();
  }, []);

  return (
    <div ref={rootRef}>
      <div
        className={cn(
          "flex flex-col gap-4 border-y border-birch-bark/12 py-5 sm:flex-row sm:items-center sm:justify-between",
          styles.toolbar,
        )}
      >
        <p aria-live="polite" className="text-label text-birch-bark/60" role="status">
          <span className="text-birch-bark">{packedCount}</span> of {tickable.length}{" "}
          packed
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={print} size="compact" type="button">
            <Printer aria-hidden="true" />
            Print list
          </Button>
          <Button
            disabled={packedCount === 0}
            onClick={clear}
            onDark
            size="compact"
            type="button"
            variant="outline"
          >
            <RotateCcw aria-hidden="true" />
            Clear ticks
          </Button>
        </div>
      </div>

      <div
        className={cn("mt-8 grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3", styles.grid)}
        data-sanity={sanity?.groups}
      >
        {groups.map((group) => {
          const leaveAtHome = group.tone === "leaveAtHome";
          const groupPacked = leaveAtHome
            ? 0
            : group.items.filter((item) => tickSet.has(item.key)).length;
          const summaryId = `${sectionId}-${group.key}-title`;

          return (
            <details
              className={cn(
                "group/card rounded-xl border bg-forest-panel",
                leaveAtHome
                  ? "border-dashed border-birch-bark/25"
                  : "border-birch-bark/12",
                styles.card,
              )}
              key={group.key}
              open
            >
              <summary
                className={cn(
                  "focus-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-6 py-5 [&::-webkit-details-marker]:hidden",
                  styles.summary,
                )}
              >
                <h3
                  className="font-display text-title"
                  data-sanity={group.sanity?.title}
                  id={summaryId}
                >
                  {group.title}
                </h3>
                <span className="flex shrink-0 items-center gap-3 text-label text-birch-bark/60">
                  {leaveAtHome ? (
                    <span>{group.items.length} things</span>
                  ) : (
                    <span>
                      {groupPacked}/{group.items.length}
                    </span>
                  )}
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      "size-4 transition-transform motion-base group-open/card:rotate-180 motion-reduce:transition-none",
                      styles.chevron,
                    )}
                  />
                </span>
              </summary>

              <ul
                aria-labelledby={summaryId}
                className={cn("m-0 list-none px-6 pb-6 pt-1", styles.items)}
                data-sanity={group.sanity?.items}
              >
                {group.items.map((item) => {
                  const inputId = `${sectionId}-${item.key}`;

                  if (leaveAtHome) {
                    return (
                      <li
                        className={cn("flex items-start gap-3 py-2.5", styles.stay)}
                        data-sanity={item.sanity}
                        key={item.key}
                      >
                        <X
                          aria-hidden="true"
                          className="mt-1 size-4 shrink-0 text-birch-bark/55"
                        />
                        <span className="text-[15px] leading-[1.5] text-birch-bark/80">
                          {item.label}
                        </span>
                      </li>
                    );
                  }

                  return (
                    <li
                      className={cn("flex items-start gap-3 py-2", styles.item)}
                      data-sanity={item.sanity}
                      key={item.key}
                    >
                      <input
                        checked={tickSet.has(item.key)}
                        className={cn("focus-ring", styles.box)}
                        id={inputId}
                        onChange={(event) => toggle(item.key, event.target.checked)}
                        type="checkbox"
                      />
                      <label
                        className="flex min-w-0 flex-1 cursor-pointer flex-wrap items-baseline gap-x-3 gap-y-1"
                        htmlFor={inputId}
                      >
                        <span className={cn("text-[15px] leading-[1.5]", styles.text)}>
                          {item.label}
                        </span>
                        {item.quantity ? (
                          <>
                            {/* The space keeps the accessible name "Label × 14". */}{" "}
                            <span className="text-label text-birch-bark/55">
                              × {item.quantity}
                            </span>
                          </>
                        ) : null}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>
    </div>
  );
}
