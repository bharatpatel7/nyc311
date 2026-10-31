import { fetchGeoPoints, fetchGeoPointsMock } from "@/lib/api";
import type { GeoPoint } from "@/types/geopoints";
import type { FilterParams } from "./types";

/**
 * Handles data fetching for the map. Wraps the geopoints API calls and
 * manages request cancellation so only one fetch is in-flight at a time.
 */
export class DataService {
  private abortController: AbortController | null = null;
  private useMock: boolean;

  constructor(useMock = false) {
    this.useMock = useMock;
  }

  setUseMock(value: boolean): void {
    this.useMock = value;
  }

  getUseMock(): boolean {
    return this.useMock;
  }

  /** cancel any in-flight request and start a fresh one. */
  async fetchPoints(params?: FilterParams): Promise<GeoPoint[] | null> {
    this.abortController?.abort();
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    try {
      const points = this.useMock
        ? await fetchGeoPointsMock()
        : await fetchGeoPoints(params, signal);

      // if this request was superseded, signal the caller to ignore the result
      if (signal.aborted) return null;
      return points;
    } catch (err) {
      if ((err as Error).name === "AbortError") return null;
      throw err;
    }
  }

  cancelPending(): void {
    this.abortController?.abort();
    this.abortController = null;
  }
}
