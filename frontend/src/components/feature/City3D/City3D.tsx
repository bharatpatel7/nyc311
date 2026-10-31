import { useEffect, useMemo, useRef, useState } from "react";
import {
  HeatmapLayer,
  HexagonLayer,
  MapLibreOverlay,
  ScatterplotLayer,
  type MapLibreOverlayProps,
  type PickingInfo,
} from "deck.gl";
import { AttributionControl, Map, useControl, type MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { GeoPoint } from "@/types/geopoints";
import {
  HEX_COLOR_RANGE,
  INITIAL_VIEW,
  INITIAL_VIEW_CAMERA,
  MAP_STYLE,
  ROTATE_STEP,
  STATUS_GROUP_COLORS,
  toStatusGroup,
  type LayerMode,
} from "./constants";

export interface City3DProps {
  points: GeoPoint[];
  mode?: LayerMode;
  /** Hexagon radius in metres. */
  radius?: number;
  elevationScale?: number;
  autoRotate?: boolean;
  /** When false the camera can't be moved and nothing is pickable (used as a backdrop). */
  interactive?: boolean;
  /** Bump this number to fly the camera back to the starting view. */
  resetKey?: number;
  /**
   * Where the map data credits sit, so they don't collide with overlaid UI.
   * "none" means the page shows MAP_ATTRIBUTION itself.
   */
  attributionPosition?: "top-right" | "bottom-right" | "bottom-left" | "none";
}

interface HexObject {
  count: number;
  pointIndices: number[];
}

/** Most common value of `key` among the given points. */
const topValue = (points: GeoPoint[], key: "complaintType" | "borough") => {
  const counts = new globalThis.Map<string, number>();
  for (const p of points) counts.set(p[key], (counts.get(p[key]) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
};

const tooltipStyle = {
  background: "rgba(10, 14, 25, 0.85)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "12px",
  color: "#f0efec",
  fontFamily: "Inter Variable, sans-serif",
  fontSize: "12px",
  padding: "10px 12px",
};

/** Mounts deck.gl inside the MapLibre map so the map owns the camera. */
const DeckOverlay = (props: MapLibreOverlayProps) => {
  const overlay = useControl(() => new MapLibreOverlay(props));
  overlay.setProps(props);
  return null;
};

/**
 * Tilted 3D map of NYC complaints built on deck.gl over a dark MapLibre basemap.
 * Renders extruded hexagon columns, a heatmap, or individual points.
 */
const City3D = ({
  points,
  mode = "columns",
  radius = 250,
  elevationScale = 6,
  autoRotate = false,
  interactive = true,
  resetKey = 0,
  attributionPosition = "bottom-right",
}: City3DProps) => {
  const mapRef = useRef<MapRef>(null);
  // columns grow from flat once the first data arrives
  const [grown, setGrown] = useState(false);
  const userMovingRef = useRef(false);
  const hasData = points.length > 0;

  useEffect(() => {
    if (!hasData || grown) return;
    const t = setTimeout(() => setGrown(true), 200);
    return () => clearTimeout(t);
  }, [hasData, grown]);

  useEffect(() => {
    if (resetKey > 0) mapRef.current?.flyTo({ ...INITIAL_VIEW_CAMERA, duration: 1200 });
  }, [resetKey]);

  // slowly orbit the camera; pauses while the user is dragging or zooming
  useEffect(() => {
    if (!autoRotate) return;
    let frame: number;
    const tick = () => {
      const map = mapRef.current;
      if (map && !userMovingRef.current) map.setBearing((map.getBearing() + ROTATE_STEP) % 360);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [autoRotate]);

  const layers = useMemo(() => {
    if (mode === "heatmap") {
      return [
        new HeatmapLayer<GeoPoint>({
          id: "heat",
          data: points,
          getPosition: (d) => [d.longitude, d.latitude],
          radiusPixels: 40,
          intensity: 1.2,
          colorRange: HEX_COLOR_RANGE,
        }),
      ];
    }
    if (mode === "points") {
      return [
        new ScatterplotLayer<GeoPoint>({
          id: "points",
          data: points,
          getPosition: (d) => [d.longitude, d.latitude],
          getFillColor: (d) => STATUS_GROUP_COLORS[toStatusGroup(d.status)],
          getRadius: 40,
          radiusMinPixels: 3,
          stroked: true,
          getLineColor: [11, 15, 25],
          lineWidthMinPixels: 1,
          pickable: interactive,
        }),
      ];
    }
    return [
      new HexagonLayer<GeoPoint>({
        id: "hex",
        data: points,
        getPosition: (d) => [d.longitude, d.latitude],
        gpuAggregation: false,
        // square root keeps a few extreme addresses from flattening every other column
        getElevationValue: (pts: GeoPoint[]) => Math.sqrt(pts.length),
        colorScaleType: "quantile",
        radius,
        coverage: 0.82,
        extruded: true,
        elevationScale: grown ? elevationScale : 0,
        colorRange: HEX_COLOR_RANGE,
        material: { ambient: 0.6, diffuse: 0.6, shininess: 40, specularColor: [80, 140, 255] },
        pickable: interactive,
        autoHighlight: interactive,
        highlightColor: [34, 211, 238, 220],
        transitions: { elevationScale: 1400 },
      }),
    ];
  }, [mode, points, radius, elevationScale, grown, interactive]);

  const getTooltip = ({ object, layer }: PickingInfo) => {
    if (!object || !layer) return null;
    if (layer.id === "hex") {
      const hex = object as HexObject;
      const inHex = hex.pointIndices.map((i) => points[i]);
      return {
        html: `<div style="font-weight:600;font-size:14px">${hex.count.toLocaleString()} complaints</div>
               <div style="opacity:.75;margin-top:4px">Top issue: ${topValue(inHex, "complaintType") ?? "—"}</div>
               <div style="opacity:.75">${topValue(inHex, "borough") ?? ""}</div>`,
        style: tooltipStyle,
      };
    }
    const p = object as GeoPoint;
    return {
      html: `<div style="font-weight:600">${p.complaintType}</div>
             <div style="opacity:.75;margin-top:4px">${p.borough} · ${p.status}</div>
             <div style="opacity:.75">${p.createdDate.slice(0, 10)} · ${p.agency}</div>`,
      style: tooltipStyle,
    };
  };

  return (
    <Map
      ref={mapRef}
      initialViewState={INITIAL_VIEW_CAMERA}
      minZoom={INITIAL_VIEW.minZoom}
      maxZoom={INITIAL_VIEW.maxZoom}
      maxPitch={70}
      interactive={interactive}
      mapStyle={MAP_STYLE}
      attributionControl={false}
      onMoveStart={(e) => {
        if (e.originalEvent) userMovingRef.current = true;
      }}
      onMoveEnd={() => {
        userMovingRef.current = false;
      }}
    >
      {attributionPosition !== "none" && (
        <AttributionControl position={attributionPosition} compact />
      )}
      <DeckOverlay layers={layers} getTooltip={interactive ? getTooltip : undefined} />
    </Map>
  );
};

export default City3D;
