import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import Link from "next/link";
import { stegaClean } from "next-sanity";
import ActivityScheduleBuilder from "./activity-schedule-builder";
import styles from "./activity-schedule.module.css";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type ActivityScheduleProps = Extract<
  PageBlock,
  { _type: "activitySchedule" }
> & {
  dataAttribute?: (path: string) => string | undefined;
  activityDataAttribute?: (
    documentId: string,
    path: string,
  ) => string | undefined;
};

export default function ActivitySchedule({
  _key,
  activityCount,
  activityDataAttribute,
  camperNames,
  dataAttribute,
  description,
  featuredActivities,
  heading,
}: ActivityScheduleProps) {
  const cleanHeading = stegaClean(heading)?.trim();
  const cleanDescription = stegaClean(description)?.trim();
  const cleanCamperNames = (camperNames ?? [])
    .map((name) => stegaClean(name)?.trim())
    .filter((name): name is string => Boolean(name));
  const activities = (featuredActivities ?? []).flatMap((activity) => {
    const title = stegaClean(activity.title)?.trim();
    if (!activity._id || !activity._key || !title) return [];

    return [
      {
        _id: activity._id,
        _key: activity._key,
        title,
        titleDataAttribute: activityDataAttribute?.(activity._id, "title"),
      },
    ];
  });

  if (
    !cleanHeading ||
    !cleanDescription ||
    !cleanCamperNames.length ||
    activities.length < 4
  ) {
    return null;
  }

  const headingId = `activity-schedule-${stegaClean(_key)}`;
  const total = Math.max(activityCount ?? activities.length, activities.length);
  const remaining = Math.max(total - activities.length, 0);
  const activityLinkText =
    remaining > 0
      ? `+ ${remaining} more ${remaining === 1 ? "Activity" : "Activities"}`
      : "Explore all Activities";

  return (
    <section
      aria-labelledby={headingId}
      className="bg-forest-floor pb-section text-birch-bark"
      id={`activities-${stegaClean(_key)}`}
    >
      <div className="container-content">
        <div className="border-t border-birch-bark/15 pt-section">
          <div className="grid items-start gap-12 md:grid-cols-2 2xl:grid-cols-12">
            <header className={`md:col-span-2 2xl:col-span-4 ${styles.reveal}`}>
              <p
                aria-label={`${total} ${cleanHeading}`}
                className={styles.activityCount}
              >
                {total}
              </p>
              <h2
                className="mt-4 max-w-xl font-accent text-4xl font-medium text-birch-bark md:text-5xl"
                data-sanity={dataAttribute?.("heading")}
                id={headingId}
              >
                {heading}
              </h2>
            </header>

            <ActivityScheduleBuilder
              activities={activities}
              activitiesLink={
                <Link
                  className="focus-ring w-fit rounded-pill border border-dashed border-birch-bark/35 px-5 py-3 text-sm font-semibold text-birch-bark/65 transition-colors hover:border-campfire-amber hover:text-campfire-amber motion-reduce:transition-none"
                  href="/summer-camp-activities/"
                  key="activities-link"
                >
                  {activityLinkText}
                </Link>
              }
              camperNames={cleanCamperNames}
              camperNamesDataAttribute={dataAttribute?.("camperNames")}
              featuredActivitiesDataAttribute={dataAttribute?.(
                "featuredActivities",
              )}
              description={
                <p
                  className="max-w-xl text-pretty text-lg/relaxed text-birch-bark/75"
                  data-sanity={dataAttribute?.("description")}
                  key="description"
                >
                  {description}
                </p>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
