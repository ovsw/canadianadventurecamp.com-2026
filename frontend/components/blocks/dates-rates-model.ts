export type LengthKey = "twoWeek" | "fourWeek" | "sixWeek" | "eightWeek";
export type AvailabilityStatus = "open" | "limited" | "full";

export type SeasonSession = {
  _key: string;
  availabilityNote?: string | null;
  availabilityStatus?: string | null;
  startDate?: string | null;
};

export type SeasonLengthConfig = {
  description?: string | null;
  rate?: number | null;
  sessions?: SeasonSession[] | null;
};

export type ActiveSeason = {
  _id: string;
  name?: string | null;
  startDate?: string | null;
  twoWeek?: SeasonLengthConfig | null;
  fourWeek?: SeasonLengthConfig | null;
  sixWeek?: SeasonLengthConfig | null;
  eightWeek?: SeasonLengthConfig | null;
};

export type LengthOption = {
  key: LengthKey;
  label: string;
  weeks: number;
};

export type PreparedSessionRow = {
  _key: string;
  availabilityNoteAttribute?: string;
  availabilityStatusAttribute?: string;
  barClass: string;
  dates: string;
  isFull: boolean;
  label: string;
  left: number;
  startDateAttribute?: string;
  status: AvailabilityStatus;
  width: number;
};

export type PreparedLength = LengthOption & {
  description: string;
  descriptionAttribute?: string;
  rate: string;
  rateAttribute?: string;
  rateValue: number;
  rows: PreparedSessionRow[];
};

export type SeasonTick = {
  date: string;
  label: string;
};

export const enrollmentHref =
  "https://canadianadventurecamp.campbrainregistration.com/";

/** Maximum sessions any length option can have; drives the stable slot count. */
export const maxSessionRows = 4;

/** Season length in days, used for calendar bar positioning and tick dates. */
export const seasonLengthDays = 55;

export const lengthOptions = [
  { key: "twoWeek", label: "2 weeks", weeks: 2 },
  { key: "fourWeek", label: "4 weeks", weeks: 4 },
  { key: "sixWeek", label: "6 weeks", weeks: 6 },
  { key: "eightWeek", label: "8 weeks", weeks: 8 },
] as const satisfies readonly LengthOption[];

const dayMs = 24 * 60 * 60 * 1000;

function parseDate(value: string | null | undefined) {
  if (!value) return undefined;
  const time = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isNaN(time) ? undefined : time;
}

function addDays(value: string, days: number) {
  const time = parseDate(value);
  if (time === undefined) return undefined;
  return new Date(time + days * dayMs).toISOString().slice(0, 10);
}

export function getSessionEndDate(startDate: string, weeks: number) {
  return addDays(startDate, weeks * 7 - 1);
}

export function formatShortDate(value: string) {
  const time = parseDate(value);
  if (time === undefined) return "";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(time));
}

const rateFormatter = new Intl.NumberFormat("en-CA", {
  currency: "CAD",
  maximumFractionDigits: 0,
  style: "currency",
});

export function formatRate(rate: number) {
  return rateFormatter.format(rate);
}

function dayOffset(startDate: string, value: string) {
  const start = parseDate(startDate);
  const current = parseDate(value);
  if (start === undefined || current === undefined) return 0;
  return Math.max(0, Math.round((current - start) / dayMs));
}

export function availabilityLabel(status: string | null | undefined) {
  if (status === "limited") return "Limited";
  if (status === "full") return "Full";
  return "Open";
}

export function normalizeStatus(status: string | null | undefined): AvailabilityStatus {
  return status === "limited" || status === "full" ? status : "open";
}

export function getSeasonConfig(season: ActiveSeason, key: LengthKey) {
  return season[key];
}

/** Month tick labels across the calendar track: season start + 0/14/28/42 days, plus the season end. */
export function getSeasonTicks(seasonStart: string): SeasonTick[] {
  const offsets = [0, 14, 28, 42, seasonLengthDays];
  return offsets.flatMap((offset) => {
    const date = addDays(seasonStart, offset);
    if (!date) return [];
    return [{ date, label: formatShortDate(date).toUpperCase() }];
  });
}

export function prepareLengths({
  season,
  seasonDataAttribute,
}: {
  season: ActiveSeason;
  seasonDataAttribute?: (documentId: string, path: string) => string | undefined;
}) {
  const seasonStart = season.startDate;
  if (!seasonStart) return [];

  return lengthOptions.flatMap((option) => {
    const config = getSeasonConfig(season, option.key);
    const rateValue = config?.rate;
    if (typeof rateValue !== "number") return [];
    const rate = formatRate(rateValue);
    const description = config?.description?.trim();
    const sessions = config?.sessions ?? [];
    if (!description || sessions.length === 0) return [];

    const rows = sessions.flatMap((session) => {
      const startDate = session.startDate;
      if (!session._key || !startDate) return [];
      const endDate = getSessionEndDate(startDate, option.weeks);
      if (!endDate) return [];

      const status = normalizeStatus(session.availabilityStatus);
      const label = session.availabilityNote?.trim() || availabilityLabel(status);
      const path = `${option.key}.sessions[_key=="${session._key}"]`;

      return [
        {
          _key: session._key,
          availabilityNoteAttribute: seasonDataAttribute?.(
            season._id,
            `${path}.availabilityNote`,
          ),
          availabilityStatusAttribute: seasonDataAttribute?.(
            season._id,
            `${path}.availabilityStatus`,
          ),
          barClass: status === "full" ? "stripedFull" : "bg-cedar",
          dates: `${formatShortDate(startDate)}-${formatShortDate(endDate)}`,
          isFull: status === "full",
          label,
          left: (dayOffset(seasonStart, startDate) / seasonLengthDays) * 100,
          startDateAttribute: seasonDataAttribute?.(
            season._id,
            `${path}.startDate`,
          ),
          status,
          width: ((option.weeks * 7) / seasonLengthDays) * 100,
        },
      ];
    });

    if (rows.length === 0) return [];

    return [
      {
        ...option,
        description,
        descriptionAttribute: seasonDataAttribute?.(
          season._id,
          `${option.key}.description`,
        ),
        rate,
        rateAttribute: seasonDataAttribute?.(season._id, `${option.key}.rate`),
        rateValue,
        rows,
      },
    ];
  });
}
