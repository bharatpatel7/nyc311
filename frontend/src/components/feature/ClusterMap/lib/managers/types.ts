import type L from "leaflet";

export interface ClusterTier {
  colour: string;
  size: number;
  key: string;
}

export interface MarkerStrokeStyle {
  colour: string;
  width: string;
  opacity: number;
}

export interface StatusFill {
  colour: string;
  normal: string;
  hovered: string;
}

export interface MarkerManagerCallbacks {
  getColourByStatus: () => boolean;
  getPanOnMarker: () => boolean;
  getMap: () => L.Map | null;
}
