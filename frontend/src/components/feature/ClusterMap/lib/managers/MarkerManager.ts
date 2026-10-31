import L from "leaflet";
import { IconFactory } from "./IconFactory";
import { PopupFactory } from "./PopupFactory";
import { CHUNK_SIZE, PAN_TO_OPTIONS } from "./constants";
import { hidePaneImmediately, fadePaneIn } from "./utils";
import type { GeoPoint } from "@/types/geopoints";
import type { MarkerManagerCallbacks } from "./types";

/**
 * owns the lifecycle of individual point-markers: creation, icon swaps,
 * popup binding, chunked insertion, and diffing against stale state
 */
export class MarkerManager {
  private markers = new Map<string, L.Marker>();
  private geoPointMap = new WeakMap<L.Marker, GeoPoint>();
  private buildGeneration = 0;
  private iconFactory: IconFactory;
  private popupFactory: PopupFactory;
  private callbacks: MarkerManagerCallbacks;

  constructor(
    iconFactory: IconFactory,
    popupFactory: PopupFactory,
    callbacks: MarkerManagerCallbacks
  ) {
    this.iconFactory = iconFactory;
    this.popupFactory = popupFactory;
    this.callbacks = callbacks;
  }

  getMarkers(): Map<string, L.Marker> {
    return this.markers;
  }

  getGeoPoint(marker: L.Marker): GeoPoint | undefined {
    return this.geoPointMap.get(marker);
  }

  /** Remove all tracked markers. Does not touch the cluster layer — callers must do that. */
  clear(): void {
    this.markers.clear();
  }

  /**
   * incrementally build markers from a list of GeoPoints, chunked
   * across animation frames to avoid blocking the main thread
   *
   * @returns a promise that resolves when all chunks are processed
   */
  buildMarkers(
    points: GeoPoint[],
    cluster: L.MarkerClusterGroup,
    map: L.Map,
    clusterPane: HTMLElement | null
  ): Promise<void> {
    const generation = ++this.buildGeneration;

    return new Promise((resolve) => {
      hidePaneImmediately(clusterPane);

      let i = 0;
      const nextMap = new Map<string, L.Marker>();
      const toAdd: L.Marker[] = [];
      const colourByStatus = this.callbacks.getColourByStatus();

      const processChunk = () => {
        // if a newer buildMarkers call has started, abandon this one
        if (generation !== this.buildGeneration) {
          resolve();
          return;
        }

        const end = Math.min(i + CHUNK_SIZE, points.length);

        for (; i < end; i++) {
          const p = points[i];
          if (p.latitude == null || p.longitude == null) continue;

          const key = MarkerManager.markerKey(p.latitude, p.longitude, p.complaintType);
          const existing = this.markers.get(key);

          if (existing) {
            existing.setIcon(this.iconFactory.getMarkerIcons(p.status, colourByStatus).normal);
            nextMap.set(key, existing);
          } else {
            const marker = this.createMarker(p, colourByStatus);
            nextMap.set(key, marker);
            toAdd.push(marker);
          }
        }

        if (i < points.length) {
          requestAnimationFrame(processChunk);
          return;
        }

        this.diffAndApply(cluster, map, nextMap, toAdd);
        this.markers = nextMap;
        fadePaneIn(clusterPane);
        resolve();
      };

      requestAnimationFrame(processChunk);
    });
  }

  // helpers

  /** Create a new Leaflet marker for a GeoPoint and attach its event handlers */
  private createMarker(p: GeoPoint, colourByStatus: boolean): L.Marker {
    const icons = this.iconFactory.getMarkerIcons(p.status, colourByStatus);
    const marker = L.marker([p.latitude, p.longitude], { icon: icons.normal });
    this.geoPointMap.set(marker, p);
    this.bindMarkerEvents(marker, p);
    return marker;
  }

  /**
   * Bind hover, mouseout, and click events to a marker.
   * The popup is created lazily on first hover to avoid building HTML for
   * every marker upfront
   */
  private bindMarkerEvents(marker: L.Marker, p: GeoPoint): void {
    let popupBound = false;

    marker.on("mouseover", () => {
      if (!popupBound) {
        marker.bindPopup(this.popupFactory.createHTML(p), { autoPan: false });
        popupBound = true;
      }
      marker.setIcon(
        this.iconFactory.getMarkerIcons(p.status, this.callbacks.getColourByStatus()).hovered
      );
      marker.openPopup();
      this.popupFactory.styleElement(marker.getPopup()?.getElement());
    });

    marker.on("mouseout", () => {
      marker.setIcon(
        this.iconFactory.getMarkerIcons(p.status, this.callbacks.getColourByStatus()).normal
      );
      marker.closePopup();
    });

    marker.on("click", () => {
      const map = this.callbacks.getMap();
      if (this.callbacks.getPanOnMarker() && map) {
        map.panTo([p.latitude, p.longitude], PAN_TO_OPTIONS);
      }
    });
  }

  /**
   * Diff the current marker set against the next one and apply the min
   * set of cluster layer mutations (removeLayers / addLayers)
   * Then re-ranks cluster icons for the new viewport state
   */
  private diffAndApply(
    cluster: L.MarkerClusterGroup,
    map: L.Map,
    next: Map<string, L.Marker>,
    toAdd: L.Marker[]
  ): void {
    const nextKeys = new Set(next.keys());
    const toRemove: L.Marker[] = [];

    for (const [key, marker] of this.markers) {
      if (!nextKeys.has(key)) toRemove.push(marker);
    }

    if (toRemove.length > 0) cluster.removeLayers(toRemove);
    if (toAdd.length > 0) cluster.addLayers(toAdd);

    this.refreshRankedIcons(cluster, map);
  }

  /** Recompute icon tier cutoffs from visible cluster counts and re-render cluster icons. */
  private refreshRankedIcons(cluster: L.MarkerClusterGroup, map: L.Map): void {
    const counts = MarkerManager.collectVisibleClusterCounts(cluster, map);
    this.iconFactory.clearClusterCache();
    this.iconFactory.computeRankCutoffs(counts);
    cluster.refreshClusters();
  }

  // utils

  /** Stable string key for a marker — used to detect duplicates across builds. */
  static markerKey(lat: number, lng: number, type: string): string {
    return `${lat.toFixed(6)},${lng.toFixed(6)},${type}`;
  }

  /**
   * Walk the cluster's internal feature group and collect child counts
   * for every visible cluster in the current map bounds
   * Used to compute icon tier cutoffs
   */
  static collectVisibleClusterCounts(cg: L.MarkerClusterGroup, map: L.Map): number[] {
    const counts: number[] = [];
    let bounds: L.LatLngBounds;
    try {
      bounds = map.getBounds();
    } catch {
      return counts;
    }

    type FGLayer = L.FeatureGroup & { _featureGroup: L.FeatureGroup };
    const fg = (cg as unknown as FGLayer)._featureGroup;
    if (!fg) return counts;

    fg.eachLayer((layer: L.Layer) => {
      const cluster = layer as L.MarkerCluster;
      if (typeof cluster.getChildCount !== "function") return;
      if (!bounds.contains(cluster.getLatLng())) return;
      counts.push(cluster.getChildCount());
    });

    return counts;
  }
}
