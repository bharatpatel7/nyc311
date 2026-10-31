import { describe, expect, it, vi } from "vitest";
import { decodeComplaints, resolveStatic } from "./staticApi";

const COLUMNS = {
  version: 1 as const,
  base: "2026-10-25T00:00:00",
  dicts: {
    type: ["Noise - Residential", "Heat/Hot Water"],
    borough: ["BROOKLYN", "QUEENS"],
    status: ["Closed", "Open"],
    agency: ["NYPD", "HPD", ""],
  },
  key: ["1", "2", "3"],
  lat: [40.7, 40.71, 40.72],
  lng: [-73.9, -73.91, -73.92],
  created: [90, 60 * 24 + 5, 60 * 48],
  closed: [150, null, null],
  type: [0, 1, 1],
  borough: [0, 1, 0],
  status: [0, 1, 1],
  agency: [0, 1, 2],
};

const files: Record<string, unknown> = {
  "complaints.json": COLUMNS,
  "resolution-time.json": [
    { agency: "HPD", medianMinutes: 900 },
    { agency: "NYPD", medianMinutes: 60 },
  ],
};

const fakeFetch = vi.fn(async (url: string) => {
  const name = String(url).split("/").pop()!;
  return name in files
    ? new Response(JSON.stringify(files[name]))
    : new Response(null, { status: 404 });
}) as unknown as typeof fetch;

const api = (path: string) => resolveStatic(new URL(path, "http://localhost"), fakeFetch);

describe("decodeComplaints", () => {
  it("rebuilds geopoints with local timestamps and lookups", () => {
    const [first, second, third] = decodeComplaints(COLUMNS);
    expect(first).toMatchObject({
      uniqueKey: "1",
      complaintType: "Noise - Residential",
      borough: "BROOKLYN",
      agencyName: "NYPD",
      createdAt: "2026-10-25T01:30:00",
      createdDate: "2026-10-25",
      closedAt: "2026-10-25T02:30:00",
    });
    expect(second.createdAt).toBe("2026-10-26T00:05:00");
    expect(second.closedAt).toBeNull();
    expect(third.agencyName).toBeNull();
  });
});

describe("resolveStatic", () => {
  it("filters geopoints like the backend, case-insensitively and with an inclusive dateTo", async () => {
    expect(await api("/api/complaints/geopoints?borough=brooklyn")).toHaveLength(2);
    expect(await api("/api/complaints/geopoints?status=Open&agency=HPD")).toHaveLength(1);
    expect(
      await api("/api/complaints/geopoints?dateFrom=2026-10-26&dateTo=2026-10-26")
    ).toMatchObject([{ uniqueKey: "2" }]);
    expect(await api("/api/complaints/geopoints?limit=1")).toHaveLength(1);
  });

  it("filters resolution times by agency", async () => {
    expect(await api("/api/complaints/resolution-time?agency=nypd")).toEqual([
      { agency: "NYPD", medianMinutes: 60 },
    ]);
  });

  it("returns undefined for endpoints it doesn't know", async () => {
    expect(await api("/api/nope")).toBeUndefined();
  });
});
