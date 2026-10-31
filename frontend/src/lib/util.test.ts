import { describe, it, expect, vi } from "vitest";
import { logError, getError, cn, formatTime, formatDate } from "./util";

describe("getError", () => {
  it("returns message when given an Error", () => {
    expect(getError(new Error("something went wrong"))).toBe("something went wrong");
  });

  it("returns string rep for non-Error values", () => {
    expect(getError("string")).toBe("string");
    expect(getError(42)).toBe("42");
  });
});

describe("logError", () => {
  it("logs the error message to console", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logError(new Error("oops"));
    expect(spy).toHaveBeenCalledWith("oops");
    spy.mockRestore();
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    const isActive = false;
    expect(cn("foo", isActive && "bar", "baz")).toBe("foo baz");
  });
});

describe("formatTime", () => {
  it("returns a time string with hours and minutes", () => {
    const result = formatTime("2025-03-04T14:30:00Z");
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it("returns a non-empty string for any valid ISO input", () => {
    const result = formatTime("2025-01-01T00:00:00Z");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("formatDate", () => {
  it("returns a date string containing the year", () => {
    const result = formatDate("2025-03-04T12:00:00Z");
    expect(result).toContain("2025");
  });

  it("returns a non-empty string for any valid ISO input", () => {
    const result = formatDate("2025-06-15T00:00:00Z");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns different strings for different dates", () => {
    const jan = formatDate("2025-01-01T00:00:00Z");
    const dec = formatDate("2025-12-31T00:00:00Z");
    expect(jan).not.toBe(dec);
  });
});
