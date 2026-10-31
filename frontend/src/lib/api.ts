import type { Summary } from "@/types/api";
import type { GeoPoint } from "@/types/geopoints";
import type { Borough, ComplaintType, HealthCheck, Status } from "@/types/api";
import type { DataRefresh } from "@/types/logs";
import type { FilterOptionsResponse } from "@/types/ClusterMap";
import { getMockPoints, logError } from "./util";
import { MOCK_REFRESH, MOCK_SUMMARY } from "./api.mocks";
import { ENDPOINTS, MOCK_DELAY_MS } from "./api.constants";

const isDev = import.meta.env.DEV;

/** Ping the health endpoint. Returns `{ status: "error" }` on failure instead of throwing. */
export const checkHealth = async (): Promise<HealthCheck> => {
  try {
    const response = await fetch(ENDPOINTS.health);
    if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (isDev) logError(error);
    return { status: "error" };
  }
};

/**
 * Return a deterministic set of mock GeoPoints after a short artificial delay.
 * Used when the live API is unavailable or empty.
 */
export const fetchGeoPointsMock = async (): Promise<GeoPoint[]> => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  return getMockPoints();
};

/** Fetch the available filter options (complaint types, boroughs, statuses, agencies). */
export const fetchFilterOptions = async (): Promise<FilterOptionsResponse> => {
  const response = await fetch(ENDPOINTS.filterOptions);
  if (!response.ok) throw new Error(`Failed to fetch filter options: ${response.status}`);
  return await response.json();
};

/**
 * Fetch geo points from the API, optionally filtered by borough, complaint type,
 * status, and/or date range. Supports cancellation via AbortSignal.
 * Returns an empty array on non-abort errors so the map degrades gracefully.
 */
export const fetchGeoPoints = async (
  params?: {
    borough?: Borough;
    complaintType?: ComplaintType;
    status?: Status;
    dateFrom?: string;
    dateTo?: string;
  },
  signal?: AbortSignal
): Promise<GeoPoint[]> => {
  try {
    const query = new URLSearchParams();
    if (params?.borough) query.set("borough", params.borough);
    if (params?.complaintType) query.set("complaintType", params.complaintType);
    if (params?.status) query.set("status", params.status);
    if (params?.dateFrom) query.set("dateFrom", params.dateFrom);
    if (params?.dateTo) query.set("dateTo", params.dateTo);

    const qs = query.toString();
    const url = `${ENDPOINTS.geoPoints}${qs ? `?${qs}` : ""}`;
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`Failed to fetch geo points: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    if (isDev) logError(error);
    return [];
  }
};

/** Return mock last-refresh data after a short delay. Used as a fallback for the dashboard. */
export const fetchLastRefreshMock = async (): Promise<DataRefresh | null> => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  return MOCK_REFRESH;
};

/** Fetch the timestamp of the last data refresh. Returns null on failure. */
export const fetchLastRefresh = async (): Promise<DataRefresh | null> => {
  try {
    const response = await fetch(ENDPOINTS.lastRefresh);
    if (!response.ok) throw new Error(`Failed to fetch last refresh: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (isDev) logError(error);
    return null;
  }
};

/** Fetch aggregate complaint summary stats. Falls back to MOCK_SUMMARY on failure. */
export const fetchSummary = async (): Promise<Summary> => {
  try {
    const response = await fetch(ENDPOINTS.summary);
    if (!response.ok) throw new Error(`Failed to fetch summary: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (isDev) logError(error);
    return MOCK_SUMMARY;
  }
};
