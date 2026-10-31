import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { COMPLAINT_TYPES, NEIGHBOURHOODS, STATUSES, TOTAL_MOCK_POINTS } from "./api.constants";
import type { GeoPoint } from "@/types/geopoints";
import { AGENCIES } from "./agency";

/** Log an unknown error value as a string — safe to call with anything thrown. */
export const logError = (error: unknown) => {
  console.error(getError(error));
};

/** Log an unknown warning value as a string. */
export const logWarning = (error: unknown) => {
  console.error(getError(error));
};
/** Extract a readable message from an unknown thrown value. */
export const getError = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

/** Merge Tailwind class names, resolving conflicts via tailwind-merge. */
export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};

/** Format an ISO timestamp as a localised time string (e.g. "02:30 PM"). */
export const formatTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

/** Format an ISO timestamp as a short date string (e.g. "Mar 5, 2025"). */
export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// seeded PRNG (mulberry32) for deterministic mock data
let _seed = 42;

/** Reset the PRNG seed. Call before generating mock data to get a consistent result. */
export const resetSeed = (s = 42) => {
  _seed = s;
};

/** Return the next pseudo-random float in [0, 1) from the seeded PRNG. */
export const rng = (): number => {
  _seed = (_seed + 0x6d2b79f5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Box-Muller transform — returns a normally distributed value with the given stddev. */
export const gauss = (stddev: number): number => {
  const u = 1 - rng();
  const v = rng();
  return stddev * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

/** Pick a random element from an array using the seeded PRNG. */
export const pick = <T>(arr: readonly T[]): T => {
  return arr[Math.floor(rng() * arr.length)];
};

/** Return a random date string (YYYY-MM-DD) between Sep 2024 and Mar 2025. */
export const randomDate = (): string => {
  const now = new Date("2025-03-05");
  const past = new Date("2024-09-01");
  const ms = past.getTime() + rng() * (now.getTime() - past.getTime());
  return new Date(ms).toISOString().slice(0, 10);
};

// weighted random neighbourhood picker — higher-weight areas appear more often,
// matching real-world complaint density distribution
const totalWeight = NEIGHBOURHOODS.reduce((s, n) => s + n.weight, 0);
const pickNeighbourhood = () => {
  let r = rng() * totalWeight;
  for (const n of NEIGHBOURHOODS) {
    r -= n.weight;
    if (r <= 0) return n;
  }
  return NEIGHBOURHOODS[NEIGHBOURHOODS.length - 1];
};

let _mockPoints: GeoPoint[] | null = null;

/**
 * Generate (or return the cached) full set of mock GeoPoints.
 * Points are spatially distributed across NYC neighbourhoods with realistic
 * spread, occasional outliers, and a small percentage of co-located points
 * to exercise the cluster spiderfy behaviour.
 */
export const getMockPoints = (): GeoPoint[] => {
  if (_mockPoints) return _mockPoints;
  resetSeed();
  _mockPoints = Array.from({ length: TOTAL_MOCK_POINTS }, (_, i) => {
    const n = pickNeighbourhood();
    const isOutlier = rng() < 0.06;
    const spread = isOutlier ? n.spread * 4.5 : n.spread;
    const lat = n.lat + gauss(spread);
    const lng = n.lng + gauss(spread * 1.1);
    const colocated = rng() < 0.08;
    const snapJitter = 0.00005;
    return {
      uniqueKey: String(i + 1),
      latitude: colocated ? Math.round(lat / snapJitter) * snapJitter : lat,
      longitude: colocated ? Math.round(lng / snapJitter) * snapJitter : lng,
      borough: n.borough,
      status: pick(STATUSES),
      agency: pick(AGENCIES),
      complaintType: pick(COMPLAINT_TYPES),
      createdDate: randomDate(),
    };
  });
  return _mockPoints;
};
