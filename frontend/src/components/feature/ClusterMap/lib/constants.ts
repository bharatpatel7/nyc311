import type L from "leaflet";

export const NYC_CENTER: L.LatLngExpression = [40.7128, -74.006];
export const NYC_BOUNDS: L.LatLngBoundsExpression = [
  [40.35, -74.4],
  [41.0, -73.55],
];

export const TOAST_TIMER = 8000;
export const TOAST_MESSAGE = "No complaints match.";

export const MAX_ZOOM = 18;
export const MIN_ZOOM = 10;

export const FIFTEEN_SECONDS = 15_000;
export const TEN_SECONDS = 10_000;
export const DEFAULT_REFRESH_INTERVAL_SECONDS = 3600;
export const DEFAULT_REFRESH_INTERVAL_MS = DEFAULT_REFRESH_INTERVAL_SECONDS * 1000;
export const REFRESH_INTERVAL =
  (Number(import.meta.env.VITE_REFRESH_INTERVAL_SECONDS) || DEFAULT_REFRESH_INTERVAL_SECONDS) *
  1000;
export const MIN_LOAD_MS = 300;
export const PAN_RERANK_DEBOUNCE = 300;
export const BG_COLOUR = "#f2efe9";
export const MAP_TESTID = "cluster-map";
export const WRAPPER_TESTID = "cluster-map-wrapper";
export const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const MAP_OPTIONS: L.MapOptions = {
  zoomControl: false,
  maxBounds: NYC_BOUNDS,
  maxBoundsViscosity: 0.8,
  minZoom: MIN_ZOOM,
  maxZoom: MAX_ZOOM,
  zoomSnap: 1,
  zoomDelta: 1,
  wheelDebounceTime: 120,
  zoomAnimation: true,
  fadeAnimation: true,
  markerZoomAnimation: true,
};

export const TILE_OPTIONS: L.TileLayerOptions = {
  updateWhenZooming: false,
  updateWhenIdle: true,
  keepBuffer: 8,
};

export const CLUSTER_OPTIONS: L.MarkerClusterGroupOptions = {
  chunkedLoading: false,
  animate: false,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: false,
  spiderfyOnMaxZoom: false,
  spiderfyDistanceMultiplier: 1.8,
  maxClusterRadius: (zoom: number) => {
    if (zoom >= 16) return 60;
    if (zoom >= 14) return 80;
    if (zoom >= 12) return 100;
    return 120;
  },
};

export const TEXT_LOAD_MOCK_DATA = "Load mock data";
export const TEXT_NO_COMPLAINT_DATA_AVAILABLE = "No complaints match.";
export const TEXT_COORDINATES = "Coordinates";
export const THEME_MUTATION_ATTR = "class";
export const ONE_HOUR_MS = 3_600_000;
export const TEST_WAITFOR_TIMEOUT_MS = 3_000;

export const CONTAINER_WIDTH = "800px";
export const CONTAINER_HEIGHT = "600px";

export const DEBOUNCE_MS = 100;
export const DEBOUNCE_HALF_MS = DEBOUNCE_MS / 2;
export const DEBOUNCE_JUST_UNDER_MS = DEBOUNCE_MS - 1;
export const DEBOUNCE_OVER_MS = DEBOUNCE_MS * 2;
export const INTERVAL_ADVANCE_MS = 10_000;
