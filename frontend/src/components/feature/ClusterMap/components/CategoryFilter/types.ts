import type { Agency, Borough, ComplaintType, FilterOptionsResponse, Status } from "@/types";

export type FilterValue = ComplaintType | Borough | Status | Agency;

export interface UseFilterOptionsResult {
  options: FilterOptionsResponse;
  loading: boolean;
  error: boolean;
}
