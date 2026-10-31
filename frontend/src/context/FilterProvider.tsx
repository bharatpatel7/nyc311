import type { GeoPoint, FilterState, ActiveFilters, ComplaintType, Borough, Status } from "@/types";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import useFilterOptions from "@/components/feature/ClusterMap/components/CategoryFilter/useFilterOptions";
import { usePersistedAgency, useResolutionTime } from "@/api/resolutionTime";
import { usePersistedState } from "@/hooks/usePersistedState";
import { MOCK_RESOLUTION_TIME } from "@/api/resolutionTime/mock";
import type { MapFilterKey } from "@/types/ClusterMap";

const FilterContext = createContext<FilterState | null>(null);

/**
 * Provides global filter state to the whole app. Combines:
 * - per-filter persisted state (survives page refresh via localStorage)
 * - filter options fetched from the API (complaint types, boroughs, etc.)
 * - resolution time data (falls back to mock data if the API returns nothing)
 * - walkthrough open/close state
 *
 * Wrap the app root (or the dashboard route) with this provider so any
 * component can read or update filters via useFilters()
 */
export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const { options, loading: FilterLoading, error: FilterError } = useFilterOptions();
  const {
    data: fetchedData,
    isLoading: ResolutionLoading,
    isError: ResolutionError,
  } = useResolutionTime(undefined);

  // each filter value is persisted to localStorage independently
  const { value: complaintType, setValue: setComplaintType } =
    usePersistedState<ComplaintType>("filter:complaintType");
  const { value: borough, setValue: setBorough } = usePersistedState<Borough>("filter:borough");
  const { value: status, setValue: setStatus } = usePersistedState<Status>("filter:status");
  const { value: dateFrom, setValue: setDateFrom } = usePersistedState("filter:dateFrom");
  const { value: dateTo, setValue: setDateTo } = usePersistedState("filter:dateTo");
  const { agency, setAgency } = usePersistedAgency();
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);

  // use mock data as a fallback when the API hasn't returned anything yet
  const allData = fetchedData.length > 0 ? fetchedData : MOCK_RESOLUTION_TIME;

  /** Clear all active filters back to their default (undefined) state */
  const reset = () => {
    setComplaintType(undefined);
    setBorough(undefined);
    setStatus(undefined);
    setDateFrom(undefined);
    setDateTo(undefined);
    setAgency(undefined);
  };

  const isLoading = ResolutionLoading || FilterLoading;
  const isError = ResolutionError || FilterError;

  // derive the set of agencies that appear in the current dataset
  const activeAgencies = useMemo(() => new Set(allData.map((d) => d.agency)), [allData]);

  // build the list of active filter entries for the "Active" tab badge and display
  const activeEntries = (
    Object.keys({
      complaintType,
      borough,
      status,
      dateFrom,
      dateTo,
    }) as MapFilterKey[]
  )
    .map((key) => ({
      key,
      value: { complaintType, borough, status, dateFrom, dateTo }[key],
    }))
    .filter(
      (e): e is { key: MapFilterKey; value: string } =>
        typeof e.value === "string" && e.value.length > 0
    );

  // map each filter key to its setter so removeFilter can look it up dynamically
  const setters: Record<keyof ActiveFilters, (v: undefined) => void> = {
    complaintType: setComplaintType,
    borough: setBorough,
    status: setStatus,
    dateFrom: setDateFrom,
    dateTo: setDateTo,
    agency: setAgency,
  };

  /** Clear a single filter by key */
  const removeFilter = (key: keyof ActiveFilters) => setters[key](undefined);

  /** Client-side filter function — used by components that filter the point list directly */
  const filterPoints = (points: GeoPoint[]): GeoPoint[] =>
    points.filter((p) => {
      if (complaintType && p.complaintType !== complaintType) return false;
      if (borough && p.borough !== borough) return false;
      if (status && p.status !== status) return false;
      if (dateFrom && p.createdDate < dateFrom) return false;
      if (dateTo && p.createdDate > dateTo) return false;
      if (agency && p.agency !== agency) return false;
      return true;
    });

  return (
    <FilterContext.Provider
      value={{
        complaintType,
        borough,
        status,
        dateFrom,
        dateTo,
        setComplaintType,
        setBorough,
        setStatus,
        setDateFrom,
        setDateTo,
        setAgency,
        agency,
        reset,
        removeFilter,
        activeAgencies,
        activeEntries,
        data: allData,
        options,
        isLoading,
        isError,
        filterPoints,
        isWalkthroughOpen,
        setIsWalkthroughOpen,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFilters = (): FilterState => {
  const c = useContext(FilterContext);
  if (!c) throw new Error("useFilters must be used within a FilterProvider");
  return c;
};
