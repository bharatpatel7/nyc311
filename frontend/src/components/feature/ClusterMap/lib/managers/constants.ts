import type L from "leaflet";
import type { Status } from "@/types/api";
import type { ClusterTier, MarkerStrokeStyle, StatusFill } from "./types";

export const CHUNK_SIZE = 1500;

export const FLY_TO_OPTIONS: L.ZoomPanOptions = { duration: 0.35, easeLinearity: 0.25 };
export const CLUSTER_ZOOM_OPTIONS: L.ZoomOptions = { animate: true };
export const RESET_VIEW_OPTIONS: L.ZoomPanOptions = { animate: false };

export const PAN_TO_OPTIONS: L.PanOptions = { animate: true, duration: 0.4, easeLinearity: 0.15 };
export const PANE_TRANSITION_EASE = "opacity 0.2s ease";
export const PANE_TRANSITION_EASE_IN = "opacity 0.15s ease-in";
export const PANE_TRANSITION_NONE = "none";
export const PANE_OPACITY_HIDDEN = "0";
export const PANE_OPACITY_VISIBLE = "1";

export const CLUSTER_TIERS: Record<"red" | "yellow" | "green", ClusterTier> = {
  red: { colour: "rgba(200,60,60,0.7)", size: 50, key: "r" },
  yellow: { colour: "rgba(190,150,30,0.7)", size: 40, key: "y" },
  green: { colour: "rgba(40,160,90,0.7)", size: 30, key: "g" },
};

export const CLUSTER_ICON = {
  padding: 12,
  outerRingOffset: 5,
  outerRingOpacity: 0.3,
  outerRingStrokeWidth: 0.75,
  fillOpacity: 0.85,
  strokeWidth: 2.5,
  fontSizeSmall: 11,
  fontSizeLarge: 13,
  fontSizeThreshold: 36,
  textColour: "#fff",
  fontFamily: "ui-monospace,monospace",
} as const;

export const STATUS_FILLS: Record<Status, StatusFill> = {
  Open: { colour: "#16a34a", normal: "rgba(34,197,94,0.85)", hovered: "rgba(22,163,74,1)" },
  "In Progress": {
    colour: "#9333ea",
    normal: "rgba(168,85,247,0.85)",
    hovered: "rgba(147,51,234,1)",
  },
  Assigned: { colour: "#2563eb", normal: "rgba(59,130,246,0.85)", hovered: "rgba(37,99,235,1)" },
  Started: { colour: "#ca8a04", normal: "rgba(234,179,8,0.85)", hovered: "rgba(202,138,4,1)" },
  Closed: { colour: "#64748b", normal: "rgba(148,163,184,0.85)", hovered: "rgba(100,116,139,1)" },
  Pending: { colour: "#db2777", normal: "rgba(234,179,8,0.85)", hovered: "rgba(202,138,4,1)" },
  default: { colour: "#64748b", normal: "rgba(99,102,241,0.85)", hovered: "rgba(79,70,229,1)" },
};

export const MARKER_ICON = {
  width: 22,
  height: 30,
  anchorX: 11,
  anchorY: 30,
  popupOffsetY: -32,
  circleRadius: 4,
  circleCx: 11,
  circleCy: 11,
} as const;

export const MARKER_STROKE: Record<"normal" | "hovered", MarkerStrokeStyle> = {
  normal: { colour: "rgba(255,255,255,0.9)", width: "1.5", opacity: 0.9 },
  hovered: { colour: "white", width: "2", opacity: 1 },
};

export const CLUSTER_ICON_CLASS = "cluster-icon-circle";

export const COUNTS_INITIAL = [100, 50, 10];
export const COUNT_POST_RESET = 999;

export const COUNTS_FEWER_THAN_THREE = [10, 5];
export const COUNT_TOP_OF_TWO = COUNTS_FEWER_THAN_THREE[0];

export const COUNTS_EXACTLY_THREE = [30, 20, 10];
export const COUNT_MIDDLE_OF_THREE = COUNTS_EXACTLY_THREE[1];

export const COUNTS_FIVE = [100, 80, 60, 40, 20];
export const COUNT_FOURTH_OF_FIVE = COUNTS_FIVE[3];

export const COUNT_SMALL = 5;
export const COUNT_K_FORMAT = 1500;
export const EXPECTED_K_LABEL = "1.5k";

export const STATUS_UNKNOWN = "default";

export const CUSTOM_OPACITY = "0.5";
export const CUSTOM_TRANSITION = "opacity 0.3s linear";
