import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePersistedAgency } from "./usePersistedAgency";
import { AGENCY_STORAGE_KEY } from "./constants";
import type { Agency } from "@/types";

const SAMPLE_AGENCY: Agency = "NYPD";
const ANOTHER_AGENCY: Agency = "DOT";

describe("usePersistedAgency", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("restores agency from localStorage on mount", () => {
    localStorage.setItem(AGENCY_STORAGE_KEY, SAMPLE_AGENCY);
    const { result } = renderHook(() => usePersistedAgency());
    expect(result.current.agency).toBe(SAMPLE_AGENCY);
  });

  it("falls back to undefined when nothing is stored", () => {
    const { result } = renderHook(() => usePersistedAgency());
    expect(result.current.agency).toBeUndefined();
  });

  it("writes to localStorage when agency changes", () => {
    const { result } = renderHook(() => usePersistedAgency());
    act(() => result.current.setAgency(ANOTHER_AGENCY));
    expect(localStorage.getItem(AGENCY_STORAGE_KEY)).toBe(ANOTHER_AGENCY);
  });

  it("removes from localStorage when agency is cleared", () => {
    localStorage.setItem(AGENCY_STORAGE_KEY, SAMPLE_AGENCY);
    const { result } = renderHook(() => usePersistedAgency());
    act(() => result.current.setAgency(undefined));
    expect(localStorage.getItem(AGENCY_STORAGE_KEY)).toBeNull();
  });

  it("initial agency value is available before first render", () => {
    localStorage.setItem(AGENCY_STORAGE_KEY, SAMPLE_AGENCY);
    const { result } = renderHook(() => usePersistedAgency());
    expect(result.current.agency).toBe(SAMPLE_AGENCY);
  });
});
