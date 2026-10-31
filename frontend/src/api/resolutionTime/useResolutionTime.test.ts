import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server, ENDPOINTS as E, FIXTURES as F, mock } from "@/mocks";
import { useResolutionTime } from "./useResolutionTime";
import type { Agency } from "@/types/agency";

describe("useResolutionTime", () => {
  it("fetches resolution time data on mount", async () => {
    const { result } = renderHook(() => useResolutionTime(undefined));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(F.resolutionTime.ok);
    expect(result.current.isError).toBe(false);
  });

  it("includes agency query param when filter is active", async () => {
    let capturedUrl = "";

    server.use(
      http.get(E.resolutionTime, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(F.resolutionTime.single);
      })
    );

    const { result } = renderHook(() => useResolutionTime(F.resolutionTime.ok[0].agency));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(capturedUrl).toContain(`agency=${encodeURIComponent(F.resolutionTime.ok[0].agency)}`);
  });

  it("omits agency param when no filter is set", async () => {
    let capturedUrl = "";

    server.use(
      http.get(E.resolutionTime, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(F.resolutionTime.ok);
      })
    );

    const { result } = renderHook(() => useResolutionTime(undefined));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(capturedUrl).not.toContain("agency=");
  });

  it("shows isLoading state while fetching", () => {
    mock.resolutionTime.loading();

    const { result } = renderHook(() => useResolutionTime(undefined));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toEqual([]);
  });

  it("shows isError state when request fails", async () => {
    mock.resolutionTime.failure();

    const { result } = renderHook(() => useResolutionTime(undefined));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
    expect(result.current.data).toEqual([]);
  });

  it("shows isError state on network failure", async () => {
    mock.resolutionTime.offline();

    const { result } = renderHook(() => useResolutionTime(undefined));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
  });

  it("refetches when agency changes", async () => {
    const { result, rerender } = renderHook(({ agency }) => useResolutionTime(agency), {
      initialProps: { agency: undefined as Agency | undefined },
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(F.resolutionTime.ok);

    mock.resolutionTime.loaded(F.resolutionTime.single);
    rerender({ agency: F.resolutionTime.ok[0].agency });

    await waitFor(() => expect(result.current.data).toEqual(F.resolutionTime.single));
  });
});
