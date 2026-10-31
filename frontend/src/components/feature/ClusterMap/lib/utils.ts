import type { FeatureGroup, MarkerClusterGroup } from "leaflet";
import type { ClusterLayer, ClusterMouseEvent, FGLayer } from "./types";

/** Cast an unknown layer to MarkerClusterGroup — Leaflet's plugin types don't always align. */
export function toMarkerClusterGroup(layer: unknown): MarkerClusterGroup {
  return layer as MarkerClusterGroup;
}

/** Pull the internal _featureGroup off a cluster group so we can walk its layers directly. */
export function getFeatureGroup(cluster: MarkerClusterGroup): FeatureGroup | undefined {
  return (cluster as unknown as FGLayer)._featureGroup;
}

/** Cast a raw Leaflet event to our typed ClusterMouseEvent. */
export function toClusterMouseEvent(e: unknown): ClusterMouseEvent {
  return e as unknown as ClusterMouseEvent;
}

/** Cast a generic layer to ClusterLayer so we can call cluster-specific methods on it. */
export function toClusterLayer(layer: unknown): ClusterLayer {
  return layer as unknown as ClusterLayer;
}
