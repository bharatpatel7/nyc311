import type { Agency, Borough, ComplaintType, Status } from "@/types";
import type { GeoPoint } from "@/types/geopoints";

export const BTN_TOGGLE_FILTERS = "Toggle filters";
export const BTN_RESET_ALL = "Reset all";
export const BTN_ACTIVE_TAB = /active/i;

export const LABEL_STATUS_COMBOBOX = "Status";
export const LABEL_STATUS_OPEN_OPTION = "Open";
export const LABEL_REMOVE_STATUS_OPEN = "Remove Status: Open filter";

export const TEXT_NO_COMPLAINTS_MATCH = "No complaints match.";

export const BASE_LAT = 40.71;
export const BASE_LNG = -74.0;
export const OFFSET_LAT = 40.72;
export const OFFSET_LNG = -73.99;
export const LAT_STEP = 0.01;

export const COMPLAINT_NOISE: ComplaintType = "Noise - Commercial";
export const COMPLAINT_NOISE_RESIDENTIAL: ComplaintType = "Noise - Residential";
export const COMPLAINT_HOT_WATER: ComplaintType = "Heat/Hot Water";
export const COMPLAINT_RODENT: ComplaintType = "Rodent";

export const AGENCY_NYPD: Agency = "NYPD";
export const AGENCY_DOT: Agency = "DOT";

export const BOROUGH_MANHATTAN: Borough = "MANHATTAN";
export const BOROUGH_BROOKLYN: Borough = "BROOKLYN";

export const STATUS_OPEN: Status = "Open";
export const STATUS_CLOSED: Status = "Closed";
export const STATUS_IN_PROGRESS: Status = "In Progress";

export const CREATED_DATE_A = "2025-03-01";
export const CREATED_DATE_B = "2025-03-02";
export const DATE_FILTER_FUTURE = "2025-03-10";

export const DATE_FROM = "2025-01-01";
export const DATE_TO = "2025-12-31";
export const DATE_FROM_FUTURE = "2026-01-01";
export const DATE_TO_PAST = "2025-01-01";
export const CREATED_DATE = "2025-06-15";

export const DATE_INPUT_COUNT = 2;

export const MOCK_POINT = {
  uniqueKey: "1",
  latitude: BASE_LAT,
  longitude: BASE_LNG,
  complaintType: COMPLAINT_NOISE,
  borough: BOROUGH_MANHATTAN,
  createdDate: CREATED_DATE_A,
  status: STATUS_OPEN,
  agency: AGENCY_NYPD,
};

export const MOCK_POINT_B = {
  uniqueKey: "2",
  latitude: OFFSET_LAT,
  longitude: OFFSET_LNG,
  complaintType: COMPLAINT_HOT_WATER,
  borough: BOROUGH_BROOKLYN,
  createdDate: CREATED_DATE_B,
  status: STATUS_CLOSED,
  agency: AGENCY_DOT,
};

export const BASE_POINT: GeoPoint = {
  uniqueKey: "cf-1",
  latitude: BASE_LAT,
  longitude: BASE_LNG,
  complaintType: COMPLAINT_RODENT,
  borough: "MANHATTAN",
  createdDate: CREATED_DATE,
  status: STATUS_OPEN,
  agency: AGENCY_NYPD,
};

export const MOCK_FILTER_OPTIONS = {
  complaintTypes: [COMPLAINT_NOISE_RESIDENTIAL, COMPLAINT_HOT_WATER],
  boroughs: [BOROUGH_MANHATTAN, BOROUGH_BROOKLYN],
  statuses: [STATUS_OPEN, STATUS_CLOSED, STATUS_IN_PROGRESS],
  agency: [AGENCY_NYPD, AGENCY_DOT],
};

export const EMPTY_FILTER_OPTIONS = {
  boroughs: [] as Borough[],
  complaintTypes: [] as ComplaintType[],
  statuses: [] as Status[],
  agency: [] as Agency[],
};

export const HOISTED_MOCK_POINT = {
  uniqueKey: "1",
  latitude: 40.71,
  longitude: -74.0,
  complaintType: "Noise - Residential",
  borough: "MANHATTAN",
  createdDate: "2025-03-01",
  status: "Open" as const,
  agency: "NYPD",
};
