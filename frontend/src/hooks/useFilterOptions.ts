import { useState, useEffect } from "react";
import { fetchFilterOptions } from "@/lib/api";
import { AGENCIES } from "@/lib/agency";
import { BOROUGHS, COMPLAINT_TYPES, STATUSES } from "@/lib/api.constants";
import type { FilterOptionsResponse } from "@/types";

export const FALLBACK_OPTIONS = {
  complaintTypes: COMPLAINT_TYPES,
  boroughs: BOROUGHS,
  statuses: STATUSES,
  agency: AGENCIES,
};

export interface UseFilterOptionsResult {
  options: FilterOptionsResponse;
  loading: boolean;
  error: boolean;
}

/**
 * Fetches the available filter options (complaint types, boroughs, statuses, agencies)
 * from the API on mount. Falls back to FALLBACK_OPTIONS if the request fails or
 * returns an empty dataset, so the filter dropdowns always have something to show.
 */
const useFilterOptions = (): UseFilterOptionsResult => {
  const [options, setOptions] = useState(FALLBACK_OPTIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // cancelled flag prevents stale state updates if the component unmounts mid-fetch
    let cancelled = false;

    fetchFilterOptions()
      .then((data) => {
        if (!cancelled) {
          // if all arrays are empty the API returned nothing useful — use fallbacks
          const isEmpty =
            data.complaintTypes.length === 0 &&
            data.boroughs.length === 0 &&
            data.agency.length === 0 &&
            data.statuses.length === 0;
          setOptions(isEmpty ? FALLBACK_OPTIONS : data);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOptions(FALLBACK_OPTIONS);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { options, loading, error };
};

export default useFilterOptions;
