import { useMemo } from "react";
import {
  MapLibreOverlay,
  ScatterplotLayer,
  type Color,
  type MapLibreOverlayProps,
  type PickingInfo,
} from "deck.gl";
import { AttributionControl, Map, useControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLE } from "@/components/feature/City3D/constants";
import { CATEGORY_COLORS, formatDateTime, type Complaint } from "@/lib/complaints";

export interface ExplorerMapProps {
  complaints: Complaint[];
  selected: Complaint | null;
  onSelect: (complaint: Complaint | null) => void;
}

const INITIAL_VIEW = { longitude: -73.87, latitude: 40.71, zoom: 10.3, minZoom: 9, maxZoom: 18 };

const hexToRgb = (hex: string): Color => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

const COLORS = Object.fromEntries(
  Object.entries(CATEGORY_COLORS).map(([k, v]) => [k, hexToRgb(v)])
) as Record<keyof typeof CATEGORY_COLORS, Color>;

const tooltipStyle = {
  background: "rgba(10, 14, 25, 0.85)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "12px",
  color: "#f0efec",
  fontFamily: "Inter Variable, sans-serif",
  fontSize: "12px",
  padding: "8px 10px",
};

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Mounts deck.gl inside the MapLibre map so the map owns the camera. */
const DeckOverlay = (props: MapLibreOverlayProps) => {
  const overlay = useControl(() => new MapLibreOverlay(props));
  overlay.setProps(props);
  return null;
};

/** Flat dark map with one dot per complaint, coloured by category. */
const ExplorerMap = ({ complaints, selected, onSelect }: ExplorerMapProps) => {
  const layers = useMemo(
    () => [
      new ScatterplotLayer<Complaint>({
        id: "complaints",
        data: complaints,
        getPosition: (d) => [d.lng, d.lat],
        getFillColor: (d) => COLORS[d.category],
        getRadius: 30,
        radiusMinPixels: 2.5,
        radiusMaxPixels: 10,
        opacity: 0.85,
        stroked: true,
        getLineColor: [11, 15, 25],
        lineWidthMinPixels: 0.5,
        pickable: true,
      }),
      new ScatterplotLayer<Complaint>({
        id: "selected",
        data: selected ? [selected] : [],
        getPosition: (d) => [d.lng, d.lat],
        getRadius: 60,
        radiusMinPixels: 9,
        filled: false,
        stroked: true,
        getLineColor: [255, 255, 255],
        lineWidthMinPixels: 2,
      }),
    ],
    [complaints, selected]
  );

  const getTooltip = ({ object }: PickingInfo<Complaint>) =>
    object && {
      html: `<div style="font-weight:600">${escapeHtml(object.type)}</div><div style="color:#9aa3b5;margin-top:2px">${formatDateTime(object.created)} · ${escapeHtml(object.status)}</div>`,
      style: tooltipStyle,
    };

  return (
    <Map
      initialViewState={INITIAL_VIEW}
      mapStyle={MAP_STYLE}
      attributionControl={false}
      dragRotate={false}
      pitchWithRotate={false}
      style={{ width: "100%", height: "100%" }}
    >
      <DeckOverlay
        layers={layers}
        // a few pixels of slack so the small dots are still easy to hover
        pickingRadius={4}
        getTooltip={getTooltip as MapLibreOverlayProps["getTooltip"]}
        onClick={(info: PickingInfo<Complaint>) => onSelect(info.object ?? null)}
        getCursor={({ isHovering }) => (isHovering ? "pointer" : "grab")}
      />
      <AttributionControl position="bottom-right" compact />
    </Map>
  );
};

export default ExplorerMap;
