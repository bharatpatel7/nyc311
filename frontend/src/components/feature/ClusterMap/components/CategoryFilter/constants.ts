import { AGENCIES } from "@/lib/agency";
import { COMPLAINT_TYPES, BOROUGHS, STATUSES } from "@/lib/api.constants";

export const DEFAULT_LABEL = "All complaint types";

export const LOADING_DELAY_MS = 5000;

export const ERROR_MESSAGE = "";

export const FALLBACK_OPTIONS = {
  complaintTypes: COMPLAINT_TYPES,
  boroughs: BOROUGHS,
  statuses: STATUSES,
  agency: AGENCIES,
};

export const FILTERS = [
  {
    id: "category-filter",
    label: "Category",
    defaultLabel: "All complaint types",
    key: "complaintTypes",
    value: "complaintType",
    setter: "setComplaintType",
  },
  {
    id: "borough-filter",
    label: "Borough",
    defaultLabel: "All boroughs",
    key: "boroughs",
    value: "borough",
    setter: "setBorough",
  },
  {
    id: "status-filter",
    label: "Status",
    defaultLabel: "All statuses",
    key: "statuses",
    value: "status",
    setter: "setStatus",
  },
] as const;
