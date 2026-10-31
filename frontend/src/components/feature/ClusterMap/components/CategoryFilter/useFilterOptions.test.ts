import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import useFilterOptions from "./useFilterOptions";
import { mock } from "@/mocks/mock";
import { FIXTURES as F } from "@/mocks";
import { FALLBACK_OPTIONS } from "./constants";

describe("useFilterOptions", () => {
  it("returns loading state initially", () => {
    mock.filterOptions.loading();
    const { result } = renderHook(() => useFilterOptions());
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(false);
    expect(result.current.options).toEqual(FALLBACK_OPTIONS);
  });

  it("returns all filter options on success", async () => {
    mock.filterOptions.loaded();
    const { result } = renderHook(() => useFilterOptions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(false);
    expect(result.current.options.complaintTypes).toEqual(F.filterOptions.ok.complaintTypes);
    expect(result.current.options.boroughs).toEqual(F.filterOptions.ok.boroughs);
    expect(result.current.options.statuses).toEqual(F.filterOptions.ok.statuses);
  });
  it("substitutes fallback options when API returns empty", async () => {
    mock.filterOptions.empty();
    const { result } = renderHook(() => useFilterOptions());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe(false);
    expect(result.current.options).toEqual(FALLBACK_OPTIONS);
  });

  it("returns fallback options on network failure", async () => {
    mock.filterOptions.offline();
    const { result } = renderHook(() => useFilterOptions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(true);
    expect(result.current.options).toEqual(FALLBACK_OPTIONS);
  });

  it("returns fallback options on HTTP failure", async () => {
    mock.filterOptions.failure();
    const { result } = renderHook(() => useFilterOptions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(true);
    expect(result.current.options).toEqual(FALLBACK_OPTIONS);
  });
});
