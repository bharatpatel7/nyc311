import type { Borough, ComplaintType, Status } from "@/types/api";

import type { FeatureGroup, LatLng, LeafletMouseEvent } from "leaflet";

export interface MapControllerCallbacks {
  onLoadingChange: (loading: boolean) => void;
  onEmptyChange: (isEmpty: boolean) => void;
  onZoomChange: (zoom: number) => void;
  onViewChange?: (atDefault: boolean) => void;
  onPointsChange?: (total: number, filtered: number) => void;
  onViewportCountChange?: (count: number) => void;
  getColourByStatus: () => boolean;
  getPanOnMarker: () => boolean;
  getPanOnCluster: () => boolean;
}

export type FilterParams = {
  borough?: Borough;
  complaintType?: ComplaintType;
  status?: Status;
  dateFrom?: string;
  dateTo?: string;
};

export interface FGLayer {
  _featureGroup: FeatureGroup;
}

export interface ClusterLayer {
  getChildCount(): number;
  getLatLng(): LatLng;
  spiderfy(): void;
}

export interface ClusterMouseEvent extends LeafletMouseEvent {
  propagatedFrom: ClusterLayer;
}

export type DebouncedFn<T extends (...args: Parameters<T>) => void> = T & {
  cancel(): void;
};

export type IntervalTimer = ReturnType<typeof setInterval>;
export type TimeoutTimer = ReturnType<typeof setTimeout>;

export type LeafletContainer = HTMLElement & { _leaflet_id?: number };

export type AnyVoidFn = (...args: unknown[]) => void;
