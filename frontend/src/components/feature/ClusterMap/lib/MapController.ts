import L, { type Map, type MarkerClusterGroup } from "leaflet";
import {
  IconFactory,
  PopupFactory,
  MarkerManager,
  hidePaneImmediately,
  fadePaneIn,
  CLUSTER_ZOOM_OPTIONS,
  FLY_TO_OPTIONS,
  RESET_VIEW_OPTIONS,
  PANE_TRANSITION_EASE,
} from "./managers";
import {
  CLUSTER_OPTIONS,
  MAP_OPTIONS,
  MAX_ZOOM,
  MIN_LOAD_MS,
  MIN_ZOOM,
  NYC_CENTER,
  PAN_RERANK_DEBOUNCE,
  REFRESH_INTERVAL,
  TEN_SECONDS,
  FIFTEEN_SECONDS,
  TILE_ATTRIBUTION,
  TILE_OPTIONS,
  TILE_URL,
} from "./constants";
import { DataService } from "./DataService";
import {
  getFeatureGroup,
  toClusterLayer,
  toClusterMouseEvent,
  toMarkerClusterGroup,
} from "./utils";
import type {
  AnyVoidFn,
  DebouncedFn,
  FilterParams,
  IntervalTimer,
  LeafletContainer,
  MapControllerCallbacks,
  TimeoutTimer,
} from "./types";
import type { GeoPoint } from "@/types";

/**
 * Top-level controller for the cluster map. Owns the Leaflet map instance,
 * the marker cluster group, and all supporting services (data fetching,
 * icon/popup creation, marker lifecycle).
 *
 * Typical usage:
 *   const ctrl = new MapController(callbacks);
 *   await ctrl.mount(containerElement);
 *   // later...
 *   ctrl.destroy();
 */
export class MapController {
  private iconFactory: IconFactory;
  private popupFactory: PopupFactory;
  private markerManager: MarkerManager;
  private dataService: DataService;

  private map: Map | null = null;
  private cluster: MarkerClusterGroup | null = null;
  private clusterPane: HTMLElement | null = null;

  // background refresh that re-fetches points on a fixed interval
  private refreshTimer: IntervalTimer | null = null;
  // used when polling for live data while the API is still empty
  private pollTimer: TimeoutTimer | null = null;

  private debouncedRefresh: DebouncedFn<() => void> | null = null;
  private loadStartedAt = 0;
  private isDisposed = false;
  private isAnimating = false;
  private isResettingView = false;
  private totalComplaintCount = 0;
  private callbacks: MapControllerCallbacks;
  private filters: FilterParams = {};

  constructor(callbacks: MapControllerCallbacks) {
    this.callbacks = callbacks;
    this.iconFactory = new IconFactory();
    this.popupFactory = new PopupFactory();
    this.dataService = new DataService();

    this.markerManager = new MarkerManager(this.iconFactory, this.popupFactory, {
      getColourByStatus: callbacks.getColourByStatus,
      getPanOnMarker: callbacks.getPanOnMarker,

      getMap: () => this.map,
    });
  }

  /**
   * Initialise the Leaflet map inside `container` and kick off the first data load.
   * Leaflet and its CSS are imported dynamically so they don't bloat the initial bundle.
   * Safe to call after destroy() — will no-op if already disposed.
   */
  async mount(container: HTMLElement): Promise<void> {
    if (this.map) return;

    const [{ default: L }] = await Promise.all([
      import("leaflet"),
      import("leaflet/dist/leaflet.css"),
      import("leaflet.markercluster/dist/MarkerCluster.css"),
      import("leaflet.markercluster/dist/MarkerCluster.Default.css"),
      import("leaflet.markercluster"),
    ]);

    if (this.isDisposed) return;

    // Leaflet leaves a _leaflet_id on the DOM node after unmount; clear it so
    // re-mounting into the same element doesn't throw.
    const leafletContainer = container as LeafletContainer;
    if (leafletContainer._leaflet_id) {
      leafletContainer._leaflet_id = undefined;
      container.innerHTML = "";
    }

    this.map = L.map(container, MAP_OPTIONS).setView(NYC_CENTER, MIN_ZOOM);
    L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, ...TILE_OPTIONS }).addTo(this.map);

    CLUSTER_OPTIONS.iconCreateFunction = this.iconFactory.createClusterIcon;
    this.cluster = toMarkerClusterGroup(L.markerClusterGroup(CLUSTER_OPTIONS));
    this.map.addLayer(this.cluster);

    // grab the pane so we can fade it in/out during zoom transitions
    this.clusterPane = this.cluster.getPane() ?? null;
    if (this.clusterPane) this.clusterPane.style.transition = PANE_TRANSITION_EASE;

    this.bindMapEvents(L);
    await this.initialLoad();
    this.refreshTimer = setInterval(() => this.loadPoints(), REFRESH_INTERVAL);
  }

  /**
   * Tear down the map and cancel all pending work (timers, fetches, debounces).
   * Safe to call multiple times.
   */
  destroy(): void {
    this.isDisposed = true;
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    this.debouncedRefresh?.cancel();
    this.dataService.cancelPending();
    this.markerManager.clear();
    this.iconFactory.clearAll();
    this.map?.remove();
    this.map = null;
    this.cluster = null;
  }

  zoomIn(): void {
    this.map?.zoomIn();
  }

  zoomOut(): void {
    this.map?.zoomOut();
  }

  /**
   * Snap the map back to the default NYC view and zoom level.
   * Cancels any in-progress animation or debounced refresh first.
   */
  resetView(): void {
    if (!this.map) return;
    this.map.stop();
    this.isAnimating = false;
    this.isResettingView = true;
    this.debouncedRefresh?.cancel();
    this.map.setView(NYC_CENTER, MIN_ZOOM, RESET_VIEW_OPTIONS);
  }

  /** Toggle between mock and live data, then reload markers. */
  setUseMock(value: boolean): void {
    this.dataService.setUseMock(value);
    this.reload();
  }

  //Apply new filter params and reload markers from scratch
  applyFilters(params: FilterParams): void {
    this.filters = params;
    this.reload();
  }

  /**
   * Clear all markers and re-fetch points with the current filters.
   * Cancels any in-flight request before starting a new one.
   */
  reload(): void {
    this.dataService.cancelPending();
    this.callbacks.onLoadingChange(true);
    if (!this.cluster) return;
    this.cluster.clearLayers();
    this.markerManager.clear();
    this.iconFactory.clearAll();
    this.loadPoints();
  }

  getMaxZoom(): number {
    return MAX_ZOOM;
  }

  getMinZoom(): number {
    return MIN_ZOOM;
  }

  getUseMock(): boolean {
    return this.dataService.getUseMock();
  }

  /**
   * Switch from mock data to the live API. Clears the poll timer, cancels
   * pending fetches, reloads markers, then restarts the background refresh interval.
   */
  async switchToLive(): Promise<void> {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.dataService.cancelPending();
    this.dataService.setUseMock(false);
    this.callbacks.onLoadingChange(true);
    if (this.cluster) {
      this.cluster.clearLayers();
      this.markerManager.clear();
      this.iconFactory.clearAll();
    }
    await this.loadPoints();
    this.refreshTimer = setInterval(() => this.loadPoints(), REFRESH_INTERVAL);
  }

  /**
   * Periodically probe the live API until it returns at least one result,
   * then automatically switch out of mock mode.
   * Retries every TEN_SECONDS; stops as soon as live data is available.
   */
  private pollForLiveData(): void {
    const poll = async () => {
      if (this.isDisposed) return;
      try {
        const response = await fetch("/api/complaints/geopoints?limit=1");
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            // Real data is available — switch automatically
            this.dataService.setUseMock(false);
            this.reload();
            return;
          }
        }
      } catch {
        /* ignore */
      }
      setTimeout(poll, TEN_SECONDS);
    };
    setTimeout(poll, TEN_SECONDS);
  }

  /**
   * Count how many complaints are currently visible in the viewport
   * and emit the result via onViewportCountChange.
   * Walks the cluster's feature group and sums child counts for clusters
   * and individual markers that fall within the current map bounds.
   */
  private emitViewportCount(): void {
    let count = 0;

    if (!this.map || !this.cluster) return;

    const bounds = this.map.getBounds();

    const fg = getFeatureGroup(this.cluster);
    if (!fg) return;

    fg.eachLayer((layer: L.Layer) => {
      const asCluster = toClusterLayer(layer);
      if (typeof asCluster.getChildCount === "function") {
        if (bounds.contains(asCluster.getLatLng())) {
          count += asCluster.getChildCount();
        }
      } else {
        const marker = layer as L.Marker;
        if (bounds.contains(marker.getLatLng())) {
          count++;
        }
      }
    });

    this.callbacks.onViewportCountChange?.(count);
  }

  /**
   * Attach all Leaflet map and cluster event listeners.
   * Handles cluster clicks, zoom transitions, pan/move end, and the
   * debounced icon re-rank that runs after the user stops panning.
   */
  private bindMapEvents(L: typeof import("leaflet")): void {
    if (!this.map || !this.cluster) return;

    const map = this.map;
    const cluster = this.cluster;
    const pane = this.clusterPane;

    const isAtDefault = () => map.getZoom() === MIN_ZOOM;

    cluster.on("clusterclick", (event) => {
      const e = toClusterMouseEvent(event);
      map.stop();
      this.isAnimating = false;
      this.debouncedRefresh?.cancel();
      const currentZoom = map.getZoom();

      if (currentZoom >= MAX_ZOOM) {
        e.propagatedFrom.spiderfy();
        return;
      }

      L.DomEvent.stop(e);
      const center = e.propagatedFrom.getLatLng();
      const nextZoom = currentZoom + 1;

      if (this.callbacks.getPanOnCluster()) {
        this.isAnimating = true;
        map.setView(center, nextZoom, FLY_TO_OPTIONS);
      } else {
        map.setZoom(nextZoom, CLUSTER_ZOOM_OPTIONS);
      }
    });

    map.on("zoomstart", () => {
      if (pane) hidePaneImmediately(pane);
    });

    map.on("zoomend", () => {
      this.callbacks.onZoomChange?.(map.getZoom());
      this.refreshClusterIcons();
      fadePaneIn(pane);
    });

    this.debouncedRefresh = MapController.debounce(
      () => this.refreshClusterIcons(),
      PAN_RERANK_DEBOUNCE
    );

    map.on("moveend", () => {
      if (this.isResettingView) {
        this.isResettingView = false;
        this.callbacks.onViewChange?.(true);
        this.refreshClusterIcons();
        this.emitViewportCount();
        return;
      }
      if (this.isAnimating) {
        this.isAnimating = false;
        this.refreshClusterIcons();
        this.callbacks.onViewChange?.(isAtDefault());
        this.emitViewportCount();
        return;
      }
      this.callbacks.onViewChange?.(isAtDefault());
      this.debouncedRefresh!();
      this.emitViewportCount();
    });
  }

  /**
   * Filter the raw point list on the client side using the current filter params.
   * Returns the original array unchanged if no filters are active.
   */
  private applyClientFilters(points: GeoPoint[]): GeoPoint[] {
    const { borough, complaintType, status, dateFrom, dateTo } = this.filters;
    if (!borough && !complaintType && !status && !dateFrom && !dateTo) return points;
    const norm = (s?: string) => s?.trim().toLowerCase();

    return points.filter((p) => {
      if (borough && norm(p.borough) !== norm(borough)) return false;
      if (complaintType && norm(p.complaintType) !== norm(complaintType)) return false;
      if (status && norm(p.status) !== norm(status)) return false;
      if (dateFrom && p.createdDate < dateFrom) return false;
      if (dateTo && p.createdDate > dateTo) return false;
      return true;
    });
  }

  /**
   * Recompute cluster icon tiers based on what's currently visible,
   * then tell Leaflet to re-render all cluster icons.
   * Skipped while an animation is in progress to avoid visual glitches.
   */
  private refreshClusterIcons(): void {
    if (!this.cluster || !this.map || this.isAnimating) return;
    const counts = MarkerManager.collectVisibleClusterCounts(this.cluster, this.map);
    this.iconFactory.clearClusterCache();
    this.iconFactory.computeRankCutoffs(counts);
    this.cluster.refreshClusters();
  }

  /**
   * Fire the onLoadingChange(false) callback, but wait at least MIN_LOAD_MS
   * from when the load started to avoid a loading bar flash on fast responses.
   */
  private finishLoading(): void {
    const elapsed = Date.now() - this.loadStartedAt;
    setTimeout(() => this.callbacks.onLoadingChange(false), Math.max(0, MIN_LOAD_MS - elapsed));
  }

  /**
   * Apply client-side filters to raw points, hand them off to MarkerManager
   * to diff and update the cluster layer, then finish the loading state.
   */
  private async renderLoadedPoints(raw: GeoPoint[], isInitialLoad: boolean): Promise<void> {
    const points = this.applyClientFilters(raw);
    this.callbacks.onPointsChange?.(this.totalComplaintCount, points.length);

    if (!this.cluster || !this.map) {
      this.callbacks.onLoadingChange(false);
      return;
    }

    const isEmpty = isInitialLoad
      ? points.length === 0
      : points.length === 0 && !this.dataService.getUseMock();

    this.callbacks.onEmptyChange(isEmpty);
    await this.markerManager.buildMarkers(points, this.cluster, this.map, this.clusterPane);
    this.emitViewportCount();
    this.finishLoading();
  }

  /**
   * First data load after mount. Races the fetch against a 15-second timeout —
   * if no data comes back in time (or the API is empty), falls back to mock data
   * and starts polling for live data in the background.
   */
  private async initialLoad(): Promise<void> {
    this.loadStartedAt = Date.now();

    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), FIFTEEN_SECONDS)
    );

    const fetchPromise = this.dataService.fetchPoints(this.filters);
    const raw = await Promise.race([fetchPromise, timeoutPromise]);

    if (!raw || raw.length === 0) {
      this.dataService.setUseMock(true);
      await this.loadPoints();
      this.pollForLiveData();
      return;
    }

    // only store the total count when no filters are active
    const hasFilters = Object.values(this.filters).some(Boolean);
    if (!hasFilters) this.totalComplaintCount = raw.length;

    await this.renderLoadedPoints(raw, true);
  }

  /** Fetch the latest points and update markers. Silently no-ops if the request was cancelled. */
  private async loadPoints(): Promise<void> {
    this.loadStartedAt = Date.now();
    const raw = await this.dataService.fetchPoints(this.filters);
    if (raw === null) return;

    await this.renderLoadedPoints(raw, false);
  }

  /**
   * Returns a debounced version of `fn` that delays execution by `ms`.
   * The returned function has a `.cancel()` method to clear the pending call.
   */
  static debounce<T extends AnyVoidFn>(fn: T, ms: number): DebouncedFn<T> {
    let id: TimeoutTimer | null = null;
    const debounced = (...args: Parameters<T>) => {
      if (id !== null) clearTimeout(id);
      id = setTimeout(() => fn(...args), ms);
    };
    debounced.cancel = () => {
      if (id !== null) clearTimeout(id);
    };
    return debounced as DebouncedFn<T>;
  }
}
