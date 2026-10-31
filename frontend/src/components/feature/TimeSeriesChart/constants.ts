import type { ComplaintVolumeDto } from "@/hooks/types";
import { MOCK_COMPLAINT_VOLUME, MOCK_COMPLAINT_VOLUME_SINGLE } from "./mock";

export const VOLUME_CHART_TITLE = "Complaint Volume by Type";
export const VOLUME_CHART_HEIGHT = 400;
export const VOLUME_CHART_YAXIS_LABEL = "Complaints";
export const VOLUME_STORAGE_KEY = "dashboard:selectedComplaintType";

export const HIDDEN_TYPES_KEY = "dashboard:hiddenComplaintTypes";

export const DEFAULT_VISIBLE = 5;
export const TOP_N = 3;
export const BOTTOM_N = 3;

export const SERIES_COLORS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#9333ea",
  "#ea580c",
  "#0891b2",
  "#ca8a04",
  "#be185d",
  "#4f46e5",
  "#059669",
];

export const CHART_TITLE = "Complaint Volume by Type";
export const LEGEND_ITEM_NOISE = "Noise - Residential";
export const LOADING_TEXT = "Loading...";
export const ERROR_TEXT = "Failed to load complaint volume data.";
export const EMPTY_TEXT = "No complaint volume data available.";
export const VISIBLE_COUNT_PATTERN = /\/.*visible/;
export const TOGGLE_BUTTON_PATTERN = /Show All|Hide All/;
export const STRIKETHROUGH_STYLE = { textDecoration: "line-through" };

export const SELECTOR_LINE = ".recharts-line";
export const SELECTOR_LINE_CHART = ".recharts-line-chart";
export const SELECTOR_Y_AXIS = ".recharts-yAxis";
export const SELECTOR_X_AXIS = ".recharts-xAxis";

export const HOOK_LOADED = {
  data: MOCK_COMPLAINT_VOLUME,
  isLoading: false,
  isError: false,
  isFallback: false,
};

export const HOOK_SINGLE = {
  data: MOCK_COMPLAINT_VOLUME_SINGLE,
  isLoading: false,
  isError: false,
  isFallback: false,
};

export const HOOK_LOADING = {
  data: [],
  isLoading: true,
  isError: false,
  isFallback: false,
};

export const HOOK_ERROR = {
  data: [],
  isLoading: false,
  isError: true,
  isFallback: false,
};

export const HOOK_EMPTY = {
  data: [],
  isLoading: false,
  isError: false,
  isFallback: false,
};

export const FALLBACK_VOLUME_DATA: ComplaintVolumeDto[] = [
  { period: "2025-04", complaintType: "Noise - Residential", count: 320 },
  { period: "2025-05", complaintType: "Noise - Residential", count: 410 },
  { period: "2025-06", complaintType: "Noise - Residential", count: 580 },
  { period: "2025-07", complaintType: "Noise - Residential", count: 620 },
  { period: "2025-08", complaintType: "Noise - Residential", count: 590 },
  { period: "2025-09", complaintType: "Noise - Residential", count: 430 },
  { period: "2025-10", complaintType: "Noise - Residential", count: 310 },
  { period: "2025-11", complaintType: "Noise - Residential", count: 280 },
  { period: "2025-12", complaintType: "Noise - Residential", count: 260 },
  { period: "2026-01", complaintType: "Noise - Residential", count: 270 },
  { period: "2026-02", complaintType: "Noise - Residential", count: 290 },
  { period: "2026-03", complaintType: "Noise - Residential", count: 350 },
  { period: "2025-04", complaintType: "Heat/Hot Water", count: 180 },
  { period: "2025-05", complaintType: "Heat/Hot Water", count: 90 },
  { period: "2025-06", complaintType: "Heat/Hot Water", count: 40 },
  { period: "2025-07", complaintType: "Heat/Hot Water", count: 20 },
  { period: "2025-08", complaintType: "Heat/Hot Water", count: 25 },
  { period: "2025-09", complaintType: "Heat/Hot Water", count: 60 },
  { period: "2025-10", complaintType: "Heat/Hot Water", count: 150 },
  { period: "2025-11", complaintType: "Heat/Hot Water", count: 310 },
  { period: "2025-12", complaintType: "Heat/Hot Water", count: 380 },
  { period: "2026-01", complaintType: "Heat/Hot Water", count: 400 },
  { period: "2026-02", complaintType: "Heat/Hot Water", count: 360 },
  { period: "2026-03", complaintType: "Heat/Hot Water", count: 200 },
];
