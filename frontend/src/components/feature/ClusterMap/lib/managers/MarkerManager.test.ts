import L from "leaflet";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MarkerManager } from "./MarkerManager";
import { IconFactory } from "./IconFactory";
import { PopupFactory } from "./PopupFactory";
import { POINT, POINTS } from "@/mocks";
import { PANE_OPACITY_VISIBLE } from "./constants";
import type { MarkerManagerCallbacks } from "./types";
import { COMPLAINT_TYPES } from "@/lib/api.constants";

const POINT_A = {
  ...POINT,
  uniqueKey: "test-a",
  latitude: POINT.latitude,
  complaintType: COMPLAINT_TYPES[0],
};
const POINT_B = {
  ...POINT,
  uniqueKey: "test-b",
  latitude: POINT.latitude + 0.01,
  complaintType: COMPLAINT_TYPES[8], // Rodent
};

const CLUSTER_COUNT_A = 10;
const CLUSTER_COUNT_B = 5;

const MARKER_KEY_LAT = 40.71;
const MARKER_KEY_LNG = -74.0;
const MARKER_KEY_TYPE = COMPLAINT_TYPES[0];
const MARKER_KEY_EXPECTED = `${MARKER_KEY_LAT.toFixed(6)},${MARKER_KEY_LNG.toFixed(6)},${MARKER_KEY_TYPE}`;
const MARKER_KEY_ALT_LAT = MARKER_KEY_LAT + 0.01;

// factories

const makeMap = (boundsContains = true) =>
  ({
    getBounds: () => ({ contains: () => boundsContains }),
    panTo: vi.fn(),
  }) as unknown as L.Map;

const makeCallbacks = (
  overrides: Partial<MarkerManagerCallbacks> = {}
): MarkerManagerCallbacks => ({
  getColourByStatus: () => true,
  getPanOnMarker: () => true,
  getMap: () => makeMap(),
  ...overrides,
});

const makeCluster = () =>
  ({
    addLayers: vi.fn(),
    removeLayers: vi.fn(),
    refreshClusters: vi.fn(),
    _featureGroup: { eachLayer: vi.fn() },
  }) as unknown as L.MarkerClusterGroup;

// tests

let iconFactory: IconFactory;
let popupFactory: PopupFactory;

beforeEach(() => {
  iconFactory = new IconFactory();
  popupFactory = new PopupFactory();
});

describe("MarkerManager.buildMarkers", () => {
  it("skips points with null latitude or longitude", async () => {
    const manager = new MarkerManager(iconFactory, popupFactory, makeCallbacks());
    const cluster = makeCluster();
    await manager.buildMarkers(POINTS, cluster, makeMap(), null);
    const added = (cluster.addLayers as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(added).toHaveLength(1);
  });

  it("reuses existing marker on rebuild with same key", async () => {
    const manager = new MarkerManager(iconFactory, popupFactory, makeCallbacks());
    const cluster = makeCluster();
    await manager.buildMarkers([POINT], cluster, makeMap(), null);
    const firstMarkers = new Map(manager.getMarkers());

    await manager.buildMarkers([POINT], cluster, makeMap(), null);
    const [key, marker] = [...manager.getMarkers().entries()][0];
    expect(firstMarkers.get(key)).toBe(marker);
  });

  it("removes stale markers on rebuild", async () => {
    const manager = new MarkerManager(iconFactory, popupFactory, makeCallbacks());
    const cluster = makeCluster();
    await manager.buildMarkers([POINT_A, POINT_B], cluster, makeMap(), null);
    await manager.buildMarkers([POINT_A], cluster, makeMap(), null);
    expect(cluster.removeLayers).toHaveBeenCalledWith(expect.arrayContaining([expect.any(Object)]));
  });

  it("fades pane in after build completes", async () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });
    const manager = new MarkerManager(iconFactory, popupFactory, makeCallbacks());
    const pane = document.createElement("div");
    await manager.buildMarkers([POINT], makeCluster(), makeMap(), pane);
    expect(pane.style.opacity).toBe(PANE_OPACITY_VISIBLE);
  });
});

describe("MarkerManager marker events", () => {
  const buildAndGetMarker = async (overrides: Partial<MarkerManagerCallbacks> = {}) => {
    const callbacks = makeCallbacks(overrides);
    const manager = new MarkerManager(iconFactory, popupFactory, callbacks);
    await manager.buildMarkers([POINT], makeCluster(), makeMap(), null);
    const marker = [...manager.getMarkers().values()][0];
    return { marker, callbacks };
  };

  it("mouseover binds popup on first trigger only", async () => {
    const { marker } = await buildAndGetMarker();
    // Spy must call through so popupBound closure sets to true after first call
    const bindSpy = vi.spyOn(marker, "bindPopup").mockReturnThis();
    marker.fire("mouseover");
    marker.fire("mouseover");
    expect(bindSpy).toHaveBeenCalledOnce();
  });

  it("mouseover sets hovered icon", async () => {
    const { marker } = await buildAndGetMarker();
    const iconSpy = vi.spyOn(marker, "setIcon");
    marker.fire("mouseover");
    expect(iconSpy).toHaveBeenCalled();
  });

  it("mouseout resets to normal icon and closes popup", async () => {
    const { marker } = await buildAndGetMarker();
    const iconSpy = vi.spyOn(marker, "setIcon");
    const closeSpy = vi.spyOn(marker, "closePopup");
    marker.fire("mouseout");
    expect(iconSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  });
});

describe("MarkerManager.collectVisibleClusterCounts", () => {
  it("returns empty array when getBounds throws", () => {
    const map = {
      getBounds: () => {
        throw new Error("destroyed");
      },
    } as unknown as L.Map;
    expect(
      MarkerManager.collectVisibleClusterCounts({} as unknown as L.MarkerClusterGroup, map)
    ).toEqual([]);
  });

  it("returns empty array when _featureGroup is missing", () => {
    const map = { getBounds: () => ({ contains: () => true }) } as unknown as L.Map;
    expect(
      MarkerManager.collectVisibleClusterCounts({} as unknown as L.MarkerClusterGroup, map)
    ).toEqual([]);
  });

  it("skips layers without getChildCount", () => {
    const map = { getBounds: () => ({ contains: () => true }) } as unknown as L.Map;
    const cg = {
      _featureGroup: {
        eachLayer: (cb: (l: unknown) => void) => [{ getLatLng: () => ({}) }].forEach(cb),
      },
    } as unknown as L.MarkerClusterGroup;
    expect(MarkerManager.collectVisibleClusterCounts(cg, map)).toEqual([]);
  });

  it("skips clusters outside visible bounds", () => {
    const map = { getBounds: () => ({ contains: () => false }) } as unknown as L.Map;
    const cg = {
      _featureGroup: {
        eachLayer: (cb: (l: unknown) => void) =>
          [{ getChildCount: () => CLUSTER_COUNT_A, getLatLng: () => ({}) }].forEach(cb),
      },
    } as unknown as L.MarkerClusterGroup;
    expect(MarkerManager.collectVisibleClusterCounts(cg, map)).toEqual([]);
  });

  it("collects counts from visible clusters", () => {
    const map = { getBounds: () => ({ contains: () => true }) } as unknown as L.Map;
    const cg = {
      _featureGroup: {
        eachLayer: (cb: (l: unknown) => void) =>
          [
            { getChildCount: () => CLUSTER_COUNT_A, getLatLng: () => ({}) },
            { getChildCount: () => CLUSTER_COUNT_B, getLatLng: () => ({}) },
          ].forEach(cb),
      },
    } as unknown as L.MarkerClusterGroup;
    expect(MarkerManager.collectVisibleClusterCounts(cg, map)).toEqual([
      CLUSTER_COUNT_A,
      CLUSTER_COUNT_B,
    ]);
  });
});

describe("MarkerManager.markerKey", () => {
  it("produces a stable key from lat, lng, type", () => {
    expect(MarkerManager.markerKey(MARKER_KEY_LAT, MARKER_KEY_LNG, MARKER_KEY_TYPE)).toBe(
      MARKER_KEY_EXPECTED
    );
  });

  it("produces unique keys for different points", () => {
    const a = MarkerManager.markerKey(MARKER_KEY_LAT, MARKER_KEY_LNG, MARKER_KEY_TYPE);
    const b = MarkerManager.markerKey(MARKER_KEY_ALT_LAT, MARKER_KEY_LNG, MARKER_KEY_TYPE);
    expect(a).not.toBe(b);
  });
});

describe("MarkerManager marker click event", () => {
  it("pans map when getPanOnMarker returns true", async () => {
    const panFn = vi.fn();
    const map = {
      getBounds: () => ({ contains: () => true }),
      panTo: panFn,
    } as unknown as L.Map;

    const callbacks: MarkerManagerCallbacks = {
      getColourByStatus: () => true,
      getPanOnMarker: () => true,
      getMap: () => map,
    };
    const manager = new MarkerManager(iconFactory, popupFactory, callbacks);
    await manager.buildMarkers([POINT], makeCluster(), map, null);
    const marker = [...manager.getMarkers().values()][0];
    marker.fire("click");
    expect(panFn).toHaveBeenCalled();
  });

  it("does not pan when getPanOnMarker returns false", async () => {
    const panFn = vi.fn();
    const map = {
      getBounds: () => ({ contains: () => true }),
      panTo: panFn,
    } as unknown as L.Map;

    const callbacks: MarkerManagerCallbacks = {
      getColourByStatus: () => true,
      getPanOnMarker: () => false,
      getMap: () => map,
    };
    const manager = new MarkerManager(iconFactory, popupFactory, callbacks);
    await manager.buildMarkers([POINT], makeCluster(), map, null);
    const marker = [...manager.getMarkers().values()][0];
    marker.fire("click");
    expect(panFn).not.toHaveBeenCalled();
  });

  it("does not pan when getMap returns null", async () => {
    const callbacks: MarkerManagerCallbacks = {
      getColourByStatus: () => true,
      getPanOnMarker: () => true,
      getMap: () => null,
    };
    const manager = new MarkerManager(iconFactory, popupFactory, callbacks);
    await manager.buildMarkers([POINT], makeCluster(), makeMap(), null);
    const marker = [...manager.getMarkers().values()][0];
    expect(() => marker.fire("click")).not.toThrow();
  });
});

describe("MarkerManager.buildMarkers generation cancellation", () => {
  it("cancels an in-flight build when a newer build starts", async () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      setTimeout(() => cb(0), 0);
      return 0;
    });

    const manager = new MarkerManager(iconFactory, popupFactory, makeCallbacks());
    const cluster = makeCluster();
    const map = makeMap();

    const first = manager.buildMarkers([POINT_A], cluster, map, null);
    const second = manager.buildMarkers([POINT_B], cluster, map, null);

    await Promise.all([first, second]);

    const keys = [...manager.getMarkers().keys()];
    expect(keys).toHaveLength(1);
    expect(keys[0]).toContain(POINT_B.complaintType);

    vi.restoreAllMocks();
  });
});
