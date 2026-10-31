import type { ActiveFilters } from "@/types/ClusterMap";

export const BUTTON_TEXT = "Test button";

export const FILTER_LABELS: Record<keyof ActiveFilters, string> = {
  borough: "Borough",
  complaintType: "Complaint Type",
  status: "Status",
  dateFrom: "From",
  dateTo: "To",
  agency: "NYPD",
};

export const FILTER_VALUE_KEYS = Object.keys(FILTER_LABELS) as (keyof ActiveFilters)[];

export const SETTERS = {
  borough: "setBorough",
  complaintType: "setComplaintType",
  status: "setStatus",
  dateFrom: "setDateFrom",
  dateTo: "setDateTo",
  agency: "setAgency",
} as const;
