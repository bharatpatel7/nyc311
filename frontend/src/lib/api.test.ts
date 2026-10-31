import { describe, it, expect, beforeAll } from "vitest";
import { server, mock, ENDPOINTS, FIXTURES as F } from "@/mocks";
import {
  checkHealth,
  fetchGeoPoints,
  fetchLastRefresh,
  fetchGeoPointsMock,
  fetchLastRefreshMock,
} from "./api";
import { expectResult } from "@/tests/helpers";

const DATE_FROM = "2025-01-01";
const DATE_TO = "2025-12-31";
const DATE_FROM_NEXT_YEAR = "2026-01-01";
const DATE_TO_NEXT_YEAR = "2026-03-01";

const BOROUGH_MANHATTAN = "MANHATTAN";
const BOROUGH_BROOKLYN = "BROOKLYN";
const BOROUGH_BRONX = "BRONX";

const COMPLAINT_NOISE = "Noise - Residential";
const COMPLAINT_RODENT = "Rodent";

const STATUS_OPEN = "Open";
const STATUS_CLOSED = "Closed";

const HTTP_NOT_FOUND = 404;

let lastUrl = "";

beforeAll(() => {
  server.events.on("request:start", ({ request }) => {
    if (request.url.includes(ENDPOINTS.geoPoints)) {
      lastUrl = request.url;
    }
  });
});

describe("checkHealth", () => {
  it("returns parsed health response", async () => {
    mock.health.loaded();
    await expectResult(checkHealth, F.health.ok);
  });

  it("returns error status on failure", async () => {
    mock.health.failure();
    await expectResult(checkHealth, F.health.empty);
  });

  it("returns error status on network failure", async () => {
    mock.health.offline();
    await expectResult(checkHealth, F.health.empty);
  });
});

describe("fetchGeoPoints", () => {
  it("returns parsed geo points on success", async () => {
    mock.geoPoints.loaded();
    await expectResult(fetchGeoPoints, F.geoPoints.ok);
  });

  it("returns empty array on server error", async () => {
    mock.geoPoints.failure();
    await expectResult(fetchGeoPoints, F.geoPoints.empty);
  });

  it("returns empty array on network failure", async () => {
    mock.geoPoints.offline();
    await expectResult(fetchGeoPoints, F.geoPoints.empty);
  });

  it("passes borough query param", async () => {
    mock.geoPoints.loaded();
    const result = await fetchGeoPoints({ borough: BOROUGH_MANHATTAN });
    expect(Array.isArray(result)).toBe(true);
  });

  it("passes complaintType query param", async () => {
    mock.geoPoints.loaded();
    const result = await fetchGeoPoints({ complaintType: COMPLAINT_NOISE });
    expect(Array.isArray(result)).toBe(true);
  });

  it("passes status query param", async () => {
    mock.geoPoints.loaded();
    const result = await fetchGeoPoints({ status: STATUS_OPEN });
    expect(Array.isArray(result)).toBe(true);
  });

  it("passes dateFrom query param", async () => {
    mock.geoPoints.loaded();
    const result = await fetchGeoPoints({ dateFrom: DATE_FROM });
    expect(Array.isArray(result)).toBe(true);
  });

  it("passes dateTo query param", async () => {
    mock.geoPoints.loaded();
    const result = await fetchGeoPoints({ dateTo: DATE_TO });
    expect(Array.isArray(result)).toBe(true);
  });

  it("passes all params together", async () => {
    mock.geoPoints.loaded();
    const result = await fetchGeoPoints({
      borough: BOROUGH_BROOKLYN,
      complaintType: COMPLAINT_RODENT,
      status: STATUS_CLOSED,
      dateFrom: DATE_FROM,
      dateTo: DATE_TO,
    });
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns empty array on failure with params", async () => {
    mock.geoPoints.failure();
    const result = await fetchGeoPoints({ borough: BOROUGH_BRONX });
    expect(result).toEqual([]);
  });
});

describe("fetchLastRefresh", () => {
  it("returns parsed refresh data on success", async () => {
    mock.lastRefresh.loaded();
    await expectResult(fetchLastRefresh, F.lastRefresh.ok);
  });

  it("returns null on server error", async () => {
    mock.lastRefresh.failure();
    await expectResult(fetchLastRefresh, F.lastRefresh.empty);
  });

  it("returns null on network failure", async () => {
    mock.lastRefresh.offline();
    await expectResult(fetchLastRefresh, F.lastRefresh.empty);
  });

  it("returns the fixture payload on a successful response", async () => {
    await expectResult(() => fetchGeoPoints(), F.geoPoints.ok);
  });

  it("calls the geopoints endpoint with no query string when called with no params", async () => {
    await fetchGeoPoints();
    expect(new URL(lastUrl).pathname).toBe(ENDPOINTS.geoPoints);
  });

  it("does not append a trailing ? when called with no params", async () => {
    await fetchGeoPoints();
    expect(lastUrl).not.toContain("?");
  });

  it("does not append a trailing ? when all params are undefined", async () => {
    await fetchGeoPoints({
      complaintType: undefined,
      borough: undefined,
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
    expect(lastUrl).not.toContain("?");
  });

  it("appends complaintType to the query string when provided", async () => {
    await fetchGeoPoints({ complaintType: COMPLAINT_NOISE });
    expect(lastUrl).toContain("complaintType=Noise");
  });

  it("appends borough to the query string when provided", async () => {
    await fetchGeoPoints({ borough: BOROUGH_MANHATTAN });
    expect(lastUrl).toContain(`borough=${BOROUGH_MANHATTAN}`);
  });

  it("appends status to the query string when provided", async () => {
    await fetchGeoPoints({ status: STATUS_OPEN });
    expect(lastUrl).toContain(`status=${STATUS_OPEN}`);
  });

  it("appends dateFrom to the query string when provided", async () => {
    await fetchGeoPoints({ dateFrom: DATE_FROM_NEXT_YEAR });
    expect(lastUrl).toContain(`dateFrom=${DATE_FROM_NEXT_YEAR}`);
  });

  it("appends dateTo to the query string when provided", async () => {
    await fetchGeoPoints({ dateTo: DATE_TO_NEXT_YEAR });
    expect(lastUrl).toContain(`dateTo=${DATE_TO_NEXT_YEAR}`);
  });

  it("appends all five params when all are provided", async () => {
    await fetchGeoPoints({
      complaintType: COMPLAINT_RODENT,
      borough: BOROUGH_BRONX,
      status: STATUS_OPEN,
      dateFrom: DATE_FROM_NEXT_YEAR,
      dateTo: DATE_TO_NEXT_YEAR,
    });
    expect(lastUrl).toContain(`complaintType=${COMPLAINT_RODENT}`);
    expect(lastUrl).toContain(`borough=${BOROUGH_BRONX}`);
    expect(lastUrl).toContain(`status=${STATUS_OPEN}`);
    expect(lastUrl).toContain(`dateFrom=${DATE_FROM_NEXT_YEAR}`);
    expect(lastUrl).toContain(`dateTo=${DATE_TO_NEXT_YEAR}`);
  });

  it("appends both date params when a date range is provided", async () => {
    await fetchGeoPoints({ dateFrom: DATE_FROM_NEXT_YEAR, dateTo: DATE_TO_NEXT_YEAR });
    expect(lastUrl).toContain(`dateFrom=${DATE_FROM_NEXT_YEAR}`);
    expect(lastUrl).toContain(`dateTo=${DATE_TO_NEXT_YEAR}`);
  });

  it("appends complaintType and dateFrom together for an AND filter combination", async () => {
    await fetchGeoPoints({ complaintType: COMPLAINT_NOISE, dateFrom: DATE_FROM_NEXT_YEAR });
    expect(lastUrl).toContain("complaintType=Noise");
    expect(lastUrl).toContain(`dateFrom=${DATE_FROM_NEXT_YEAR}`);
  });

  it("does not append complaintType when undefined — other params still appear", async () => {
    await fetchGeoPoints({ complaintType: undefined, borough: BOROUGH_BROOKLYN });
    expect(lastUrl).not.toContain("complaintType");
    expect(lastUrl).toContain(`borough=${BOROUGH_BROOKLYN}`);
  });

  it("does not append dateFrom when undefined — dateTo still appears", async () => {
    await fetchGeoPoints({ dateFrom: undefined, dateTo: DATE_TO_NEXT_YEAR });
    expect(lastUrl).not.toContain("dateFrom");
    expect(lastUrl).toContain(`dateTo=${DATE_TO_NEXT_YEAR}`);
  });

  it("does not append dateTo when undefined — dateFrom still appears", async () => {
    await fetchGeoPoints({ dateFrom: DATE_FROM_NEXT_YEAR, dateTo: undefined });
    expect(lastUrl).toContain(`dateFrom=${DATE_FROM_NEXT_YEAR}`);
    expect(lastUrl).not.toContain("dateTo");
  });

  it("uses a ? separator before the first query param when params are present", async () => {
    await fetchGeoPoints({ status: STATUS_CLOSED });
    const search = new URL(lastUrl).search;
    expect(search).toMatch(/^\?/);
  });

  it("returns an empty array when the server responds with a 500", async () => {
    mock.geoPoints.failure();
    await expectResult(() => fetchGeoPoints(), []);
  });

  it("returns an empty array when the server responds with a 404", async () => {
    mock.geoPoints.failure(HTTP_NOT_FOUND);
    await expectResult(() => fetchGeoPoints(), []);
  });

  it("returns an empty array when the request fails with a network error", async () => {
    mock.geoPoints.offline();
    await expectResult(() => fetchGeoPoints(), []);
  });

  it("resolves with an empty array on any failure without throwing", async () => {
    mock.geoPoints.failure();
    await expectResult(() => fetchGeoPoints(), []);
  });
});

describe("fetchGeoPointsMock", () => {
  it("returns an array of geo points", async () => {
    const result = await fetchGeoPointsMock();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns points with required fields", async () => {
    const result = await fetchGeoPointsMock();
    const point = result[0];
    expect(point).toHaveProperty("uniqueKey");
    expect(point).toHaveProperty("latitude");
    expect(point).toHaveProperty("longitude");
    expect(point).toHaveProperty("complaintType");
    expect(point).toHaveProperty("borough");
    expect(point).toHaveProperty("status");
  });
});

describe("fetchLastRefreshMock", () => {
  it("returns a non-null refresh object", async () => {
    const result = await fetchLastRefreshMock();
    expect(result).not.toBeNull();
  });

  it("returns refresh with required fields", async () => {
    const result = await fetchLastRefreshMock();
    expect(result).toHaveProperty("refreshCompletedAt");
    expect(result).toHaveProperty("recordsProcessed");
    expect(result).toHaveProperty("status");
  });
});
