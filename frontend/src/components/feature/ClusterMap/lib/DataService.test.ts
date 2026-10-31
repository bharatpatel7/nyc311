import { describe, it, expect, vi, beforeEach } from "vitest";
import { DataService } from "./DataService";
import { FIXTURES as F, mock } from "@/mocks";
import * as api from "@/lib/api";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DataService", () => {
  it("calls fetchGeoPoints when useMock=false and fetchGeoPointsMock when true", async () => {
    mock.geoPoints.loaded();
    const svc = new DataService();
    expect(await svc.fetchPoints()).toEqual(F.geoPoints.ok);

    vi.spyOn(api, "fetchGeoPointsMock").mockResolvedValue(F.geoPoints.ok);
    svc.setUseMock(true);
    expect(await svc.fetchPoints()).toEqual(F.geoPoints.ok);
    expect(api.fetchGeoPointsMock).toHaveBeenCalledOnce();
  });

  it("cancels the first request when a second call is made while fetching", async () => {
    let resolveFirst!: (v: typeof F.geoPoints.ok) => void;

    vi.spyOn(api, "fetchGeoPoints")
      .mockReturnValueOnce(
        new Promise((r) => {
          resolveFirst = r as typeof resolveFirst;
        })
      )
      .mockResolvedValueOnce(F.geoPoints.ok);

    const svc = new DataService();
    const first = svc.fetchPoints();
    const second = svc.fetchPoints();

    resolveFirst(F.geoPoints.ok);

    const [r1, r2] = await Promise.all([first, second]);

    expect(r1).toBeNull();
    expect(r2).toEqual(F.geoPoints.ok);
    expect(api.fetchGeoPoints).toHaveBeenCalledTimes(2);
  });

  it("returns [] after a failed fetch", async () => {
    mock.geoPoints.offline();
    const svc = new DataService();
    const result = await svc.fetchPoints();
    expect(result).toEqual([]);
  });

  it("returns null when cancelPending is called before the fetch resolves", async () => {
    let resolveFirst!: (v: typeof F.geoPoints.ok) => void;
    vi.spyOn(api, "fetchGeoPoints").mockReturnValueOnce(
      new Promise((r) => {
        resolveFirst = r as typeof resolveFirst;
      })
    );

    const svc = new DataService();
    const pending = svc.fetchPoints();
    svc.cancelPending();
    resolveFirst(F.geoPoints.ok);

    expect(await pending).toBeNull();
  });

  it("resolves correctly after mock is toggled", async () => {
    mock.geoPoints.loaded();
    vi.spyOn(api, "fetchGeoPointsMock").mockResolvedValue(F.geoPoints.ok);

    const svc = new DataService();
    svc.setUseMock(true);
    expect(svc.getUseMock()).toBe(true);

    const result = await svc.fetchPoints();
    expect(result).toEqual(F.geoPoints.ok);
    expect(api.fetchGeoPointsMock).toHaveBeenCalledOnce();
  });
});
