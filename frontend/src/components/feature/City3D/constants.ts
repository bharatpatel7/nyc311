import type { Color, MapViewState } from "deck.gl";
import type { Status } from "@/types/api";

export const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json";

export const MAP_ATTRIBUTION = "© OpenStreetMap contributors © CARTO";

export const INITIAL_VIEW: MapViewState = {
  longitude: -73.94,
  latitude: 40.7,
  zoom: 10.4,
  pitch: 55,
  bearing: -20,
  minZoom: 9,
  maxZoom: 16,
};

export const INITIAL_VIEW_CAMERA = {
  longitude: INITIAL_VIEW.longitude,
  latitude: INITIAL_VIEW.latitude,
  zoom: INITIAL_VIEW.zoom,
  pitch: INITIAL_VIEW.pitch,
  bearing: INITIAL_VIEW.bearing,
};

/** Degrees of bearing added per animation frame while auto-rotating. */
export const ROTATE_STEP = 0.06;

// one-hue blue ramp, dark → bright, so low counts recede into the dark basemap
export const HEX_COLOR_RANGE: Color[] = [
  [16, 66, 129],
  [28, 92, 171],
  [42, 120, 214],
  [85, 152, 231],
  [134, 182, 239],
  [205, 226, 251],
];

export type StatusGroup = "Open" | "Closed" | "In progress";

// three categorical slots, validated together against the dark surface
export const STATUS_GROUP_COLORS: Record<StatusGroup, Color> = {
  Open: [57, 135, 229],
  Closed: [25, 158, 112],
  "In progress": [217, 89, 38],
};

export const toStatusGroup = (status: Status): StatusGroup => {
  if (status === "Open") return "Open";
  if (status === "Closed") return "Closed";
  return "In progress";
};

export type LayerMode = "columns" | "heatmap" | "points";

export const LAYER_MODES: { value: LayerMode; label: string }[] = [
  { value: "columns", label: "3D columns" },
  { value: "heatmap", label: "Heatmap" },
  { value: "points", label: "Points" },
];
