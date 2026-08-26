"use client";

import { useInView, useReducedMotion } from "motion/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./activity-schedule.module.css";

const scheduleTimes = ["9 AM", "11 AM", "2 PM", "7 PM"] as const;
const scheduleDays = [
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Monday",
] as const;

type Activity = {
  _id: string;
  _key: string;
  title: string;
  titleDataAttribute?: string;
};

type ActivityScheduleBuilderProps = {
  activities: Activity[];
  camperNames: string[];
  camperNamesDataAttribute?: string;
  featuredActivitiesDataAttribute?: string;
  description: ReactNode;
  activitiesLink: ReactNode;
};

const emptySchedule = (): Array<string | null> =>
  scheduleTimes.map(() => null);

export default function ActivityScheduleBuilder({
  activities,
  activitiesLink,
  camperNames,
  camperNamesDataAttribute,
  description,
  featuredActivitiesDataAttribute,
}: ActivityScheduleBuilderProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.25 });
  const prefersReducedMotion = useReducedMotion();
  const activityTitles = useMemo(
    () => activities.map(({ title }) => title),
    [activities],
  );
  const [slots, setSlots] = useState<Array<string | null>>(emptySchedule);
  const slotsRef = useRef(slots);
  const [hasManualSelection, setHasManualSelection] = useState(false);
  const [camperIndex, setCamperIndex] = useState(0);
  const [dayIndex, setDayIndex] = useState(0);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const pauseAutomation = useRef(false);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fullTicks = useRef(0);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateSlots = useCallback((nextSlots: Array<string | null>) => {
    slotsRef.current = nextSlots;
    setSlots(nextSlots);
  }, []);

  const showAdded = useCallback((title: string) => {
    setLastAdded(title);
    if (revealTimer.current) clearTimeout(revealTimer.current);
    revealTimer.current = setTimeout(() => setLastAdded(null), 220);
  }, []);

  useEffect(
    () => () => {
      if (revealTimer.current) clearTimeout(revealTimer.current);
      if (pauseTimer.current) clearTimeout(pauseTimer.current);
    },
    [],
  );

  const reducedMotionSlots = useMemo(
    () => [
      ...activityTitles.slice(0, scheduleTimes.length),
      ...Array(Math.max(0, scheduleTimes.length - activityTitles.length)).fill(
        null,
      ),
    ],
    [activityTitles],
  );
  const displayedSlots =
    prefersReducedMotion && !hasManualSelection ? reducedMotionSlots : slots;

  useEffect(() => {
    if (!isInView || prefersReducedMotion !== false || !activityTitles.length) {
      return;
    }

    const interval = window.setInterval(() => {
      if (pauseAutomation.current) return;

      const currentSlots = slotsRef.current;
      const emptyIndex = currentSlots.findIndex((slot) => slot === null);

      if (emptyIndex === -1) {
        fullTicks.current += 1;
        if (fullTicks.current < 3) return;

        fullTicks.current = 0;
        updateSlots(emptySchedule());
        setCamperIndex((index) => (index + 1) % camperNames.length);
        setDayIndex((index) => (index + 1) % scheduleDays.length);
        return;
      }

      const available = activityTitles.filter(
        (title) => !currentSlots.includes(title),
      );
      const nextTitle = available[Math.floor(Math.random() * available.length)];
      if (!nextTitle) return;

      const nextSlots = [...currentSlots];
      nextSlots[emptyIndex] = nextTitle;
      updateSlots(nextSlots);
      showAdded(nextTitle);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [
    activityTitles,
    camperNames.length,
    isInView,
    prefersReducedMotion,
    showAdded,
    updateSlots,
  ]);

  const pickActivity = (title: string) => {
    pauseAutomation.current = true;
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => {
      pauseAutomation.current = false;
    }, 6500);
    fullTicks.current = 0;
    setHasManualSelection(true);

    const currentSlots = displayedSlots;
    if (currentSlots.includes(title)) {
      const remaining = currentSlots.filter(
        (slot): slot is string => Boolean(slot && slot !== title),
      );
      updateSlots([
        ...remaining,
        ...Array(scheduleTimes.length - remaining.length).fill(null),
      ]);
      return;
    }

    const emptyIndex = currentSlots.findIndex((slot) => slot === null);
    const nextSlots =
      emptyIndex === -1
        ? [...currentSlots.slice(1), title]
        : currentSlots.map((slot, index) =>
            index === emptyIndex ? title : slot,
          );
    updateSlots(nextSlots);
    showAdded(title);
  };

  const fullDay = displayedSlots.every(Boolean);
  const camperName = camperNames[camperIndex % camperNames.length];
  const day = scheduleDays[dayIndex];
  const scheduleOwner = hasManualSelection ? "Your" : `${camperName}'s`;

  return (
    <div
      className={`grid gap-12 md:col-span-2 md:grid-cols-2 2xl:col-span-8 2xl:grid-cols-8 ${styles.reveal}`}
      data-sanity={featuredActivitiesDataAttribute}
      ref={sectionRef}
    >
      <div className="flex flex-col gap-7 2xl:col-span-5">
        {description}

        <div className="flex flex-wrap gap-3" role="group" aria-label="Build a sample day">
          {activities.map((activity) => {
            const selected = displayedSlots.includes(activity.title);

            return (
              <button
                aria-pressed={selected}
                className="focus-ring rounded-pill border border-birch-bark/30 px-5 py-3 text-sm font-semibold text-birch-bark transition-[background-color,border-color,color] duration-150 hover:border-campfire-amber hover:bg-birch-bark/[0.06] motion-reduce:transition-none data-[selected=true]:border-campfire-amber data-[selected=true]:bg-campfire-amber data-[selected=true]:text-pine-night"
                data-sanity={activity.titleDataAttribute}
                data-selected={selected}
                key={activity._key}
                onClick={() => pickActivity(activity.title)}
                type="button"
              >
                {activity.title}
              </button>
            );
          })}
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.16em] text-birch-bark/50">
          Psst, tap an Activity to add it to the day
        </p>

        {activitiesLink}
      </div>

      <div className="relative self-center 2xl:col-span-3">
        <div className="relative -rotate-1 rounded-2xl bg-birch-bark-bright p-7 text-pine-night shadow-2xl motion-reduce:rotate-0">
          {fullDay ? (
            <span className="absolute -right-2 -top-4 rounded-pill bg-campfire-amber px-4 py-2 font-mono text-[0.6875rem] font-bold tracking-[0.14em] text-pine-night shadow-lg">
              Full day ✓
            </span>
          ) : null}

          <div className="mb-1 flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-campfire-amber"
            />
            <span className="font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-pine-night/55">
              Building a day…
            </span>
          </div>

          <p
            className="mb-3 font-accent text-4xl font-semibold"
            data-sanity={camperNamesDataAttribute}
          >
            {hasManualSelection ? (
              <span className="text-ember-red underline decoration-2 underline-offset-4">
                Your
              </span>
            ) : (
              `${camperName}'s`
            )}{" "}
            {day}
          </p>

          <ol aria-label={`${scheduleOwner} ${day} schedule`}>
            {scheduleTimes.map((time, index) => {
              const activity = displayedSlots[index];

              return (
                <li
                  className="flex min-h-12 items-center gap-4 border-b border-dashed border-pine-night/20 py-2"
                  key={time}
                >
                  <span className="w-12 shrink-0 font-mono text-[0.6875rem] tracking-[0.08em] text-pine-night/50">
                    {time}
                  </span>
                  <span
                    className={`font-accent text-3xl leading-none text-forest-floor ${lastAdded === activity ? styles.activityReveal : ""}`}
                  >
                    {activity || ""}
                  </span>
                </li>
              );
            })}
          </ol>

          <p className="mt-4 font-mono text-[0.65625rem] uppercase tracking-[0.12em] text-pine-night/45">
            Rebuilt fresh every morning
          </p>
        </div>
      </div>
    </div>
  );
}
