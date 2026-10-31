import { useEffect, useState } from "react";
import { fetchGeoPoints } from "@/lib/api";
import { getMockPoints } from "@/lib/util";
import { useFilters } from "@/context/FilterProvider";
import type { GeoPoint } from "@/types/geopoints";

/**
 * Load complaint points for the 3D map using the global filters.
 * Falls back to the built-in demo points when the API is unreachable or empty,
 * and reports that through `isDemo` so the UI can say so.
 */
export const useCityPoints = ({ applyFilters = true } = {}) => {
  const filters = useFilters();
  const [points, setPoints] = useState<GeoPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const { borough, complaintType, status, dateFrom, dateTo, filterPoints } = filters;

  useEffect(() => {
    const controller = new AbortController();
    const params = applyFilters ? { borough, complaintType, status, dateFrom, dateTo } : undefined;
    setIsLoading(true);

    fetchGeoPoints(params, controller.signal)
      .then((live) => {
        if (live.length > 0) {
          setPoints(live);
          setIsDemo(false);
          return;
        }
        const mock = getMockPoints();
        setPoints(applyFilters ? filterPoints(mock) : mock);
        setIsDemo(true);
      })
      .catch((error) => {
        if (error instanceof Error && error.name === "AbortError") return;
        throw error;
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
    // filterPoints is recreated every render; the filter values above cover it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyFilters, borough, complaintType, status, dateFrom, dateTo]);

  return { points, isLoading, isDemo };
};
