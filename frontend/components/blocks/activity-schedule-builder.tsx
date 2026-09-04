"use client";

import { useInView, useReducedMotion } from "motion/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
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
  activitiesLink: ReactNode;
};

const emptySchedule = (): Array<Activity | null> =>
  scheduleTimes.map(() => null);
const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function ActivityScheduleBuilder({
  activities,
  activitiesLink,
  camperNames,
  camperNamesDataAttribute,
  featuredActivitiesDataAttribute,
}: ActivityScheduleBuilderProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.25 });
  const prefersReducedMotion = useReducedMotion();
  const [slots, setSlots] = useState<Array<Activity | null>>(emptySchedule);
  const slotsRef = useRef(slots);
  const [hasManualSelection, setHasManualSelection] = useState(false);
  const [camperIndex, setCamperIndex] = useState(0);
  const [dayIndex, setDayIndex] = useState(0);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [isAutomationPaused, setIsAutomationPaused] = useState(false);
  const hasMounted = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot,
  );
  const pauseAutomation = useRef(false);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fullTicks = useRef(0);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateSlots = useCallback((nextSlots: Array<Activity | null>) => {
    slotsRef.current = nextSlots;
    setSlots(nextSlots);
  }, []);

  useEffect(() => {
    const activitiesById = new Map(
      activities.map((activity) => [activity._id, activity]),
    );
    let hasChanged = false;
    const nextSlots = slotsRef.current.map((slot) => {
      if (!slot) return null;

      const nextActivity = activitiesById.get(slot._id) ?? null;
      if (
        nextActivity?._key !== slot._key ||
        nextActivity?.title !== slot.title ||
        nextActivity?.titleDataAttribute !== slot.titleDataAttribute
      ) {
        hasChanged = true;
      }

      return nextActivity;
    });

    if (hasChanged) updateSlots(nextSlots);
  }, [activities, updateSlots]);

  const showAdded = useCallback((activityId: string) => {
    setLastAdded(activityId);
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
      ...activities.slice(0, scheduleTimes.length),
      ...Array(Math.max(0, scheduleTimes.length - activities.length)).fill(
        null,
      ),
    ],
    [activities],
  );
  const displayedSlots =
    prefersReducedMotion && !hasManualSelection ? reducedMotionSlots : slots;

  useEffect(() => {
    if (
      !isInView ||
      prefersReducedMotion !== false ||
      isAutomationPaused ||
      !activities.length
    ) {
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
        setHasManualSelection(false);
        setCamperIndex((index) => (index + 1) % camperNames.length);
        setDayIndex((index) => (index + 1) % scheduleDays.length);
        return;
      }

      const available = activities.filter(
        (activity) =>
          !currentSlots.some((slot) => slot?._id === activity._id),
      );
      const nextActivity =
        available[Math.floor(Math.random() * available.length)];
      if (!nextActivity) return;

      const nextSlots = [...currentSlots];
      nextSlots[emptyIndex] = nextActivity;
      updateSlots(nextSlots);
      showAdded(nextActivity._id);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [
    activities,
    camperNames.length,
    isAutomationPaused,
    isInView,
    prefersReducedMotion,
    showAdded,
    updateSlots,
  ]);

  const pickActivity = (activity: Activity) => {
    pauseAutomation.current = true;
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => {
      pauseAutomation.current = false;
      pauseTimer.current = null;
    }, 6500);
    fullTicks.current = 0;
    setHasManualSelection(true);

    const currentSlots = displayedSlots;
    if (currentSlots.some((slot) => slot?._id === activity._id)) {
      const remaining = currentSlots.filter(
        (slot): slot is Activity => Boolean(slot && slot._id !== activity._id),
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
        ? [...currentSlots.slice(1), activity]
        : currentSlots.map((slot, index) =>
            index === emptyIndex ? activity : slot,
          );
    updateSlots(nextSlots);
    showAdded(activity._id);
  };

  const toggleAutomation = () => {
    if (isAutomationPaused) {
      if (pauseTimer.current) clearTimeout(pauseTimer.current);
      pauseTimer.current = null;
      pauseAutomation.current = false;
    }
    setIsAutomationPaused(!isAutomationPaused);
  };

  const fullDay = displayedSlots.every(Boolean);
  const camperName = camperNames[camperIndex % camperNames.length];
  const day = scheduleDays[dayIndex];
  const scheduleOwner = hasManualSelection ? "Your" : `${camperName}'s`;
  const scheduleStatus = prefersReducedMotion
    ? "Sample day"
    : isAutomationPaused
      ? "Day paused"
      : "Building a day…";

  return (
    <div
      className={`mt-12 grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-14 ${styles.reveal}`}
      data-sanity={featuredActivitiesDataAttribute}
      ref={sectionRef}
    >
      <div className="flex flex-col gap-7 lg:col-span-7">
        <div className="flex flex-wrap gap-3" role="group" aria-label="Build a sample day">
          {activities.map((activity) => {
            const selected = displayedSlots.some(
              (slot) => slot?._id === activity._id,
            );

            return (
              <button
                aria-pressed={selected}
                className="focus-ring rounded-pill border border-birch-bark/30 px-5 py-3 text-sm font-semibold text-birch-bark transition-[background-color,border-color,color] duration-150 hover:border-campfire-amber hover:bg-birch-bark/[0.06] motion-reduce:transition-none data-[selected=true]:border-campfire-amber data-[selected=true]:bg-campfire-amber data-[selected=true]:text-pine-night"
                data-sanity={activity.titleDataAttribute}
                data-selected={selected}
                key={activity._key}
                onClick={() => pickActivity(activity)}
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

      {/* In the single-column layout the card would stretch to the full
          content width; cap it so the four-row schedule still reads as a
          note card. */}
      <div className="relative w-full max-w-[26rem] self-center justify-self-center md:max-w-none lg:col-span-5">
        <div className="relative -rotate-1 rounded-2xl bg-birch-bark-bright p-7 text-pine-night shadow-2xl motion-reduce:rotate-0">
          {fullDay ? (
            <span className="absolute -right-2 -top-4 rounded-pill bg-campfire-amber px-4 py-2 font-mono text-[0.6875rem] font-bold tracking-[0.14em] text-pine-night shadow-lg">
              Full day ✓
            </span>
          ) : null}

          <div className="mb-1 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-campfire-amber"
              />
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-pine-night/55">
                {scheduleStatus}
              </span>
            </div>
            {hasMounted && prefersReducedMotion === false ? (
              <button
                aria-label={`${isAutomationPaused ? "Resume" : "Pause"} automatic schedule`}
                aria-pressed={isAutomationPaused}
                className="focus-ring rounded-pill border border-pine-night/20 px-2.5 py-1 font-mono text-[0.625rem] font-bold uppercase tracking-[0.12em] text-pine-night/65 transition-colors hover:border-pine-night/45 hover:text-pine-night motion-reduce:transition-none"
                onClick={toggleAutomation}
                type="button"
              >
                {isAutomationPaused ? "Play" : "Pause"}
              </button>
            ) : null}
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
                    className={`font-accent text-3xl leading-none text-forest-floor ${lastAdded === activity?._id ? styles.activityReveal : ""}`}
                  >
                    {activity?.title || ""}
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
