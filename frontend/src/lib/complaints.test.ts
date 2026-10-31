import { describe, expect, it } from "vitest";
import {
  categoryFor,
  formatDateTime,
  formatHours,
  median,
  normalizeType,
  toComplaint,
} from "./complaints";

const dto = {
  uniqueKey: "1",
  latitude: 40.7,
  longitude: -73.9,
  complaintType: "HEAT/HOT WATER",
  borough: "BROOKLYN",
  createdDate: "2026-10-28",
  status: "Closed",
  agencyName: "HPD",
  createdAt: "2026-10-28T22:30:00",
  closedAt: "2026-10-29T01:00:00",
};

describe("categoryFor", () => {
  it("matches the Power BI categories, in keyword order", () => {
    expect(categoryFor("Noise - Residential")).toBe("Noise");
    expect(categoryFor("Illegal Parking")).toBe("Parking & Traffic");
    expect(categoryFor("Heat/Hot Water")).toBe("Housing");
    expect(categoryFor("Water System")).toBe("Water & Sewer");
    expect(categoryFor("Encampment")).toBe("Homeless & Social");
    expect(categoryFor("Lost Property")).toBe("Other");
  });
});

describe("normalizeType", () => {
  it("title-cases all-caps types and leaves mixed case alone", () => {
    expect(normalizeType("PLUMBING")).toBe("Plumbing");
    expect(normalizeType("HEAT/HOT WATER")).toBe("Heat/Hot Water");
    expect(normalizeType(" Noise - Street/Sidewalk ")).toBe("Noise - Street/Sidewalk");
  });
});

describe("toComplaint", () => {
  it("keeps NYC wall-clock time and measures hours to close", () => {
    const c = toComplaint(dto)!;
    expect(new Date(c.created).getUTCHours()).toBe(22);
    expect(c.hours).toBe(2.5);
    expect(c.type).toBe("Heat/Hot Water");
    expect(c.category).toBe("Housing");
    expect(formatDateTime(c.created)).toBe("Wed, Oct 28, 10:30 PM");
  });

  it("treats open complaints and closed-before-created dates as having no duration", () => {
    expect(toComplaint({ ...dto, closedAt: null })!.hours).toBeNull();
    expect(toComplaint({ ...dto, closedAt: "2026-10-28T08:00:00" })!.hours).toBeNull();
  });

  it("drops rows without a timestamp", () => {
    expect(toComplaint({ ...dto, createdAt: "" })).toBeNull();
  });
});

describe("median", () => {
  it("handles odd, even and empty lists", () => {
    expect(median([5, 1, 3])).toBe(3);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(median([])).toBeNull();
  });
});

describe("formatHours", () => {
  it("picks a readable unit", () => {
    expect(formatHours(null)).toBe("–");
    expect(formatHours(0.001)).toBe("1 min");
    expect(formatHours(0.5)).toBe("30 min");
    expect(formatHours(2.08)).toBe("2.1 h");
    expect(formatHours(34)).toBe("34 h");
    expect(formatHours(60)).toBe("2.5 days");
  });
});
