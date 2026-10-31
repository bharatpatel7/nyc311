import L, { divIcon } from "leaflet";
import { CLUSTER_ICON, CLUSTER_TIERS, MARKER_ICON, MARKER_STROKE, STATUS_FILLS } from "./constants";
import type { ClusterTier, StatusFill } from "./types";
import type { Status } from "@/types/api";

/**
 * responsible for creating, caching, and managing all Leaflet DivIcons
 * used by individual markers and cluster groups
 */
export class IconFactory {
  private clusterCache = new Map<string, L.DivIcon>();
  private markerCache = new Map<string, L.DivIcon>();

  // tier cutoffs — recomputed by computeRankCutoffs() after each viewport change
  private redMin = Infinity;
  private yellowMin = Infinity;

  //Clear only the cluster icon cache — called before re-ranking so stale tiers aren't reused
  clearClusterCache(): void {
    this.clusterCache.clear();
  }

  //Clear both caches — called on full reload or destroy
  clearAll(): void {
    this.clusterCache.clear();
    this.markerCache.clear();
  }

  /** recompute tier cut-offs from a list of visible cluster counts */
  computeRankCutoffs(counts: number[]): void {
    if (counts.length === 0) {
      this.redMin = Infinity;
      this.yellowMin = Infinity;
      return;
    }

    const sorted = [...counts].sort((a, b) => b - a);
    this.redMin = sorted.length >= 3 ? sorted[2] : sorted[sorted.length - 1];

    const yellowEnd = Math.min(8, sorted.length);
    this.yellowMin = yellowEnd > 3 ? sorted[yellowEnd - 1] : Infinity;
  }

  /** return the icon-create function expected by MarkerClusterGroup */
  createClusterIcon = (cluster: L.MarkerCluster): L.DivIcon => {
    const count = cluster.getChildCount();
    const tier = this.getTier(count);

    const key = `c:${tier.key}:${count}`;
    const cached = this.clusterCache.get(key);
    if (cached) return cached;

    const s = tier.size + CLUSTER_ICON.padding;
    const c = s / 2;
    const r = tier.size / 2;
    const fontSize =
      tier.size < CLUSTER_ICON.fontSizeThreshold
        ? CLUSTER_ICON.fontSizeSmall
        : CLUSTER_ICON.fontSizeLarge;

    const icon = divIcon({
      html: `
      <svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
        <circle cx="${c}" cy="${c}" r="${r + CLUSTER_ICON.outerRingOffset}" fill="none" stroke="${tier.colour}" stroke-width="${CLUSTER_ICON.outerRingStrokeWidth}" opacity="${CLUSTER_ICON.outerRingOpacity}"/>
        <circle cx="${c}" cy="${c}" r="${r}" fill="${tier.colour}" opacity="${CLUSTER_ICON.fillOpacity}"/>
        <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${tier.colour}" stroke-width="${CLUSTER_ICON.strokeWidth}"/>
        <text x="${c}" y="${c}" text-anchor="middle" dominant-baseline="central" fill="${CLUSTER_ICON.textColour}" font-weight="700" font-size="${fontSize}" font-family="${CLUSTER_ICON.fontFamily}">${this.fmt(count)}</text>
      </svg>`,
      className: "cluster-icon-circle",
      iconSize: [s, s],
      iconAnchor: [c, c],
    });

    this.clusterCache.set(key, icon);
    return icon;
  };

  /** return normal + hovered icons for a marker based on its status */
  getMarkerIcons(
    status: Status,
    colourByStatus: boolean
  ): { normal: L.DivIcon; hovered: L.DivIcon } {
    const fills: StatusFill = colourByStatus
      ? (STATUS_FILLS[status] ?? STATUS_FILLS.default)
      : STATUS_FILLS.default;
    return {
      normal: this.buildMarkerIcon(fills.normal, false),
      hovered: this.buildMarkerIcon(fills.hovered, true),
    };
  }

  // helpers

  /** Map a cluster count to its colour tier using the precomputed cutoffs */
  private getTier(count: number): ClusterTier {
    if (count >= this.redMin) return CLUSTER_TIERS.red;
    if (count >= this.yellowMin) return CLUSTER_TIERS.yellow;
    return CLUSTER_TIERS.green;
  }

  /** Format large counts as "1.2k" to keep cluster labels readable */
  private fmt(n: number): string {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
  }

  /** Build and cache a marker DivIcon for the given fill colour and hover state */
  private buildMarkerIcon(fill: string, hovered: boolean): L.DivIcon {
    const key = `${fill}:${hovered ? 1 : 0}`;
    const cached = this.markerCache.get(key);
    if (cached) return cached;

    const stroke = hovered ? MARKER_STROKE.hovered : MARKER_STROKE.normal;

    const icon = divIcon({
      html: `<svg xmlns="http://www.w3.org/2000/svg" width="${MARKER_ICON.width}" height="${MARKER_ICON.height}" viewBox="0 0 ${MARKER_ICON.width} ${MARKER_ICON.height}">
      <path d="M11 0C4.925 0 0 4.925 0 11c0 7.667 11 19 11 19s11-11.333 11-19c0-6.075-4.925-11-11-11z"
        fill="${fill}" stroke="${stroke.colour}" stroke-width="${stroke.width}"/>
      <circle cx="${MARKER_ICON.circleCx}" cy="${MARKER_ICON.circleCy}" r="${MARKER_ICON.circleRadius}" fill="white" opacity="${stroke.opacity}"/>
    </svg>`,
      className: "",
      iconSize: [MARKER_ICON.width, MARKER_ICON.height],
      iconAnchor: [MARKER_ICON.anchorX, MARKER_ICON.anchorY],
      popupAnchor: [0, MARKER_ICON.popupOffsetY],
    });

    this.markerCache.set(key, icon);
    return icon;
  }
}
