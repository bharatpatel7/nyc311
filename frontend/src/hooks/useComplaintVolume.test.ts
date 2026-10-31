import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server, mock, ENDPOINTS as E, FIXTURES as F } from "@/mocks";
import { FALLBACK_VOLUME_DATA } from "@/components/feature/TimeSeriesChart/constants";
import { useComplaintVolume } from "./useComplaintVolume";
import {
  SAMPLE_TYPE,
  MOCK_COMPLAINT_VOLUME_FILTERED,
  MOCK_COMPLAINT_VOLUME_INSUFFICIENT,
} from "./mock";

describe("useComplaintVolume", () => {
  it("fetches volume data on mount", async () => {
    mock.complaintVolume.loaded();
    const { result } = renderHook(() => useComplaintVolume(undefined));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(F.complaintVolume.ok);
    expect(result.current.isError).toBe(false);
    expect(result.current.isFallback).toBe(false);
  });

  it("volume data matches ComplaintVolumeDto format", async () => {
    mock.complaintVolume.loaded();
    const { result } = renderHook(() => useComplaintVolume(undefined));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.[0]).toEqual({
      period: expect.any(String),
      complaintType: expect.any(String),
      count: expect.any(Number),
    });
  });

  it("includes complaintType query param when filter is active", async () => {
    let capturedUrl = "";

    server.use(
      http.get(E.volumeByType, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(MOCK_COMPLAINT_VOLUME_FILTERED);
      })
    );

    const { result } = renderHook(() => useComplaintVolume(SAMPLE_TYPE));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(MOCK_COMPLAINT_VOLUME_FILTERED);

    const expected = new URLSearchParams({ complaintType: SAMPLE_TYPE }).toString();
    expect(capturedUrl).toContain(expected);
  });

  it("omits complaintType param when no filter is set", async () => {
    let capturedUrl = "";

    server.use(
      http.get(E.volumeByType, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(F.complaintVolume.ok);
      })
    );

    const { result } = renderHook(() => useComplaintVolume(undefined));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(capturedUrl).not.toContain("complaintType=");
  });

  it("falls back when API responds with empty array", async () => {
    mock.complaintVolume.empty();

    const { result } = renderHook(() => useComplaintVolume(undefined));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(FALLBACK_VOLUME_DATA);
    expect(result.current.isFallback).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it("shows loading state while fetching", () => {
    mock.complaintVolume.loading();

    const { result } = renderHook(() => useComplaintVolume(undefined));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toEqual([]);
  });

  it("falls back to mock data when request fails", async () => {
    mock.complaintVolume.failure();

    const { result } = renderHook(() => useComplaintVolume(undefined));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(FALLBACK_VOLUME_DATA);
    expect(result.current.isFallback).toBe(true);
  });

  it("falls back to mock data on network failure", async () => {
    mock.complaintVolume.offline();

    const { result } = renderHook(() => useComplaintVolume(undefined));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(FALLBACK_VOLUME_DATA);
    expect(result.current.isFallback).toBe(true);
  });

  it("falls back when response has fewer than 3 distinct periods", async () => {
    server.use(
      http.get(E.volumeByType, () => HttpResponse.json(MOCK_COMPLAINT_VOLUME_INSUFFICIENT))
    );

    const { result } = renderHook(() => useComplaintVolume(undefined));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(FALLBACK_VOLUME_DATA);
    expect(result.current.isFallback).toBe(true);
  });

  it("uses real data when response has exactly 3 distinct periods", async () => {
    server.use(http.get(E.volumeByType, () => HttpResponse.json(MOCK_COMPLAINT_VOLUME_FILTERED)));

    const { result } = renderHook(() => useComplaintVolume(undefined));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(MOCK_COMPLAINT_VOLUME_FILTERED);
    expect(result.current.isFallback).toBe(false);
  });

  it("refetches when complaintType changes", async () => {
    mock.complaintVolume.loaded();
    const { result, rerender } = renderHook(
      ({ complaintType }) => useComplaintVolume(complaintType),
      { initialProps: { complaintType: undefined as string | undefined } }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(F.complaintVolume.ok);

    server.use(http.get(E.volumeByType, () => HttpResponse.json(MOCK_COMPLAINT_VOLUME_FILTERED)));
    rerender({ complaintType: SAMPLE_TYPE });

    await waitFor(() => expect(result.current.data).toEqual(MOCK_COMPLAINT_VOLUME_FILTERED));
  });
});
