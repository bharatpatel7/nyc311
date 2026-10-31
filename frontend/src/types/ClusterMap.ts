import type { ComplaintType, Borough, Status } from "./api";
import type { GeoPoint } from "./geopoints";
import type { Dispatch, SetStateAction } from "react";
import type { Agency, ResolutionTimeDto } from "./agency";

export interface ClusterMapProps {
  className?: string;
  isWalkthroughOpen: boolean;
  setIsWalkthroughOpen: Dispatch<SetStateAction<boolean>>;
}

export interface FilterOptionsResponse {
  boroughs: Borough[];
  complaintTypes: ComplaintType[];
  statuses: Status[];
  agency: Agency[];
}

export type MapFilterKey = keyof Omit<ActiveFilters, "agency">;
export type ActiveTab = "filters" | "active";

export interface ActiveFilters {
  complaintType: ComplaintType | undefined;
  borough: Borough | undefined;
  status: Status | undefined;
  agency: Agency | undefined;
  dateFrom: string | undefined;
  dateTo: string | undefined;
}

export interface FilterState extends ActiveFilters {
  setComplaintType: (value: ComplaintType | undefined) => void;
  setBorough: (value: Borough | undefined) => void;
  setStatus: (value: Status | undefined) => void;
  setDateFrom: (value: string | undefined) => void;
  setDateTo: (value: string | undefined) => void;
  setAgency: (value: Agency | undefined) => void;
  reset: () => void;
  removeFilter: (key: keyof ActiveFilters) => void;
  activeEntries: { key: keyof ActiveFilters; value: string }[];
  activeAgencies: Set<Agency>;
  options: FilterOptionsResponse;
  isLoading: boolean;
  isError: boolean;
  filterPoints: (points: GeoPoint[]) => GeoPoint[];
  data: ResolutionTimeDto[];
  isWalkthroughOpen: boolean;
  setIsWalkthroughOpen: Dispatch<SetStateAction<boolean>>;
}
