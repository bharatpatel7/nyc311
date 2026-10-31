import type { GeoPointDto } from "./staticApi";

/**
 * Complaint records for the Explorer, Scorecard and Pulse pages, built from
 * `/api/complaints/geopoints`. Timestamps are NYC local time as published by NYC Open
 * Data; they're stored as "UTC" milliseconds so hours and days never shift with the
 * viewer's own time zone. Always read them with getUTC* / timeZone: "UTC".
 */
export interface Complaint {
  key: string;
  lat: number;
  lng: number;
  type: string;
  category: Category;
  borough: string;
  status: string;
  agency: string;
  created: number;
  /** null while the complaint is still open */
  closed: number | null;
  /** hours from created to closed; null if open or the dates are inconsistent */
  hours: number | null;
}

export const HOUR_MS = 3_600_000;
export const DAY_MS = 24 * HOUR_MS;

// same buckets as the Power BI model (analytics/sync/sync_to_azure_sql.py), checked in order
const CATEGORY_KEYWORDS: [Category, string[]][] = [
  ["Noise", ["noise"]],
  ["Parking & Traffic", ["parking", "driveway", "vehicle", "traffic", "taxi", "bike"]],
  [
    "Housing",
    [
      "heat",
      "plumbing",
      "unsanitary",
      "paint",
      "door",
      "water leak",
      "electric",
      "flooring",
      "appliance",
      "elevator",
      "mold",
      "general construction",
    ],
  ],
  ["Sanitation", ["sanitation", "dirty", "litter", "garbage", "rodent", "dumping", "waste"]],
  ["Streets & Sidewalks", ["street", "sidewalk", "curb", "pothole", "sign", "tree"]],
  ["Water & Sewer", ["water", "sewer", "hydrant"]],
  ["Homeless & Social", ["homeless", "encampment", "panhandling"]],
];

/** Display order, roughly busiest first; colours are assigned in this order and never cycle. */
export const CATEGORIES = [
  "Parking & Traffic",
  "Housing",
  "Noise",
  "Streets & Sidewalks",
  "Sanitation",
  "Homeless & Social",
  "Water & Sewer",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

// validated categorical slots for the dark surface (same order as the volume chart);
// "Other" is a neutral grey so it never competes with a real category
export const CATEGORY_COLORS: Record<Category, string> = {
  "Parking & Traffic": "#3987e5",
  Housing: "#d95926",
  Noise: "#199e70",
  "Streets & Sidewalks": "#c98500",
  Sanitation: "#d55181",
  "Homeless & Social": "#008300",
  "Water & Sewer": "#9085e9",
  Other: "#8b93a5",
};

export const categoryFor = (complaintType: string): Category => {
  const lowered = complaintType.toLowerCase();
  return (
    CATEGORY_KEYWORDS.find(([, words]) => words.some((w) => lowered.includes(w)))?.[0] ?? "Other"
  );
};

/** The source mixes "PLUMBING" and "Plumbing"; title-case the all-caps ones so they merge. */
export const normalizeType = (complaintType: string) => {
  const cleaned = complaintType.trim();
  if (cleaned !== cleaned.toUpperCase() || !/[A-Z]/.test(cleaned)) return cleaned;
  return cleaned.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

const toMs = (iso: string) => Date.parse(iso + "Z");

export const toComplaint = (p: GeoPointDto): Complaint | null => {
  if (!p.createdAt || p.latitude == null || p.longitude == null) return null;
  const type = normalizeType(p.complaintType ?? "Unknown");
  const created = toMs(p.createdAt);
  const closed = p.closedAt ? toMs(p.closedAt) : null;
  const hours = closed !== null && closed >= created ? (closed - created) / HOUR_MS : null;
  return {
    key: p.uniqueKey,
    lat: p.latitude,
    lng: p.longitude,
    type,
    category: categoryFor(type),
    borough: p.borough,
    status: p.status,
    agency: p.agencyName ?? "Unknown",
    created,
    closed,
    hours,
  };
};

export const median = (values: number[]) => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** "45 min", "3.2 h", "2.5 days" */
export const formatHours = (hours: number | null) => {
  if (hours === null) return "–";
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 48) return `${hours < 10 ? hours.toFixed(1) : Math.round(hours)} h`;
  const days = hours / 24;
  return `${days < 10 ? days.toFixed(1) : Math.round(days)} days`;
};

const dateTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** "Tue, Oct 28, 3:05 PM" in NYC time */
export const formatDateTime = (ms: number) => dateTime.format(ms);

export const formatHour = (hour: number) => {
  const h = hour % 12 || 12;
  return `${h} ${hour < 12 ? "AM" : "PM"}`;
};
