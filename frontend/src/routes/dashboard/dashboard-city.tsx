import { lazy, Suspense, useState, type ReactNode } from "react";
import { FiPause, FiPlay, FiRefreshCw, FiRotateCcw } from "react-icons/fi";
import { useFilters } from "@/context/FilterProvider";
import { useCityPoints } from "@/components/feature/City3D/useCityPoints";
import {
  HEX_COLOR_RANGE,
  LAYER_MODES,
  STATUS_GROUP_COLORS,
  type LayerMode,
} from "@/components/feature/City3D/constants";
import { BOROUGHS, COMPLAINT_TYPES, STATUSES } from "@/lib/api.constants";
import { cn } from "@/lib/util";
import type { Borough, ComplaintType, Status } from "@/types/api";
import type { Color } from "deck.gl";

const City3D = lazy(() => import("@/components/feature/City3D/City3D"));

const rgb = ([r, g, b]: Color) => `rgb(${r} ${g} ${b})`;
const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-medium text-slate-400">{label}</span>
    {children}
  </label>
);

const selectClass =
  "w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 [&>option]:bg-slate-900";

export default function DashboardCity() {
  const filters = useFilters();
  const { points, isLoading, isDemo } = useCityPoints();
  const [mode, setMode] = useState<LayerMode>("columns");
  const [radius, setRadius] = useState(250);
  const [height, setHeight] = useState(6);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const boroughs = filters.options.boroughs.length ? filters.options.boroughs : BOROUGHS;
  const types = filters.options.complaintTypes.length
    ? filters.options.complaintTypes
    : COMPLAINT_TYPES;
  const statuses = filters.options.statuses.length ? filters.options.statuses : STATUSES;

  return (
    <div className="glass relative h-[calc(100vh-150px)] min-h-[560px] overflow-hidden rounded-2xl">
      <Suspense fallback={<div className="h-full animate-pulse bg-white/5" />}>
        <City3D
          points={points}
          mode={mode}
          radius={radius}
          elevationScale={height}
          autoRotate={autoRotate}
          resetKey={resetKey}
        />
      </Suspense>

      {isLoading && (
        <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-white/5">
          <div className="h-full w-1/3 bg-linear-to-r from-transparent via-cyan-400 to-transparent [animation:slide_1.2s_linear_infinite]" />
        </div>
      )}

      {/* Control panel */}
      <aside className="glass-strong absolute left-4 top-4 z-10 max-h-[calc(100%-2rem)] w-72 overflow-y-auto rounded-2xl p-5">
        <div className="flex items-baseline justify-between">
          <h1 className="text-lg font-semibold text-white">3D City</h1>
          {isDemo && (
            <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[11px] font-medium text-amber-300 ring-1 ring-amber-400/30">
              Demo data
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-400">
          <span className="font-semibold text-white tabular-nums">
            {points.length.toLocaleString()}
          </span>{" "}
          complaints shown
        </p>

        <div className="mt-5 grid grid-cols-3 gap-1 rounded-xl bg-white/5 p-1" role="radiogroup">
          {LAYER_MODES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={mode === value}
              onClick={() => setMode(value)}
              className={cn(
                "rounded-lg px-2 py-1.5 text-xs font-medium transition",
                mode === value ? "bg-white text-ink" : "text-slate-300 hover:bg-white/10"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "columns" && (
          <div className="mt-5 space-y-4">
            <Field label={`Hexagon size · ${radius} m`}>
              <input
                type="range"
                min={100}
                max={600}
                step={50}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </Field>
            <Field label={`Column height · ${height}×`}>
              <input
                type="range"
                min={2}
                max={20}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </Field>
          </div>
        )}

        <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
          <Field label="Borough">
            <select
              className={selectClass}
              value={filters.borough ?? ""}
              onChange={(e) => filters.setBorough((e.target.value || undefined) as Borough)}
            >
              <option value="">All boroughs</option>
              {boroughs.map((b) => (
                <option key={b} value={b}>
                  {titleCase(b)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Complaint type">
            <select
              className={selectClass}
              value={filters.complaintType ?? ""}
              onChange={(e) =>
                filters.setComplaintType((e.target.value || undefined) as ComplaintType)
              }
            >
              <option value="">All types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              className={selectClass}
              value={filters.status ?? ""}
              onChange={(e) => filters.setStatus((e.target.value || undefined) as Status)}
            >
              <option value="">Any status</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          {filters.activeEntries.length > 0 && (
            <button
              type="button"
              onClick={filters.reset}
              className="flex items-center gap-1.5 text-xs font-medium text-cyan-300 hover:text-cyan-200"
            >
              <FiRefreshCw aria-hidden /> Clear filters
            </button>
          )}
        </div>
      </aside>

      {/* Camera controls */}
      <div className="glass-strong absolute right-4 top-4 z-10 flex gap-1 rounded-full p-1">
        <button
          type="button"
          onClick={() => setAutoRotate((v) => !v)}
          aria-pressed={autoRotate}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10"
        >
          {autoRotate ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
          {autoRotate ? "Stop orbit" : "Orbit"}
        </button>
        <button
          type="button"
          onClick={() => setResetKey((k) => k + 1)}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10"
        >
          <FiRotateCcw aria-hidden /> Reset view
        </button>
      </div>

      {/* Legend */}
      <div className="glass-strong absolute bottom-10 right-4 z-10 w-56 rounded-2xl p-4 text-xs">
        {mode === "points" ? (
          <>
            <div className="mb-2 font-medium text-slate-200">Status</div>
            <ul className="space-y-1.5">
              {Object.entries(STATUS_GROUP_COLORS).map(([label, color]) => (
                <li key={label} className="flex items-center gap-2 text-slate-300">
                  <span className="size-2.5 rounded-full" style={{ background: rgb(color) }} />
                  {label}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <div className="mb-2 font-medium text-slate-200">Complaints per area</div>
            <div
              className="h-2 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${HEX_COLOR_RANGE.map(rgb).join(", ")})`,
              }}
            />
            <div className="mt-1.5 flex justify-between text-slate-400">
              <span>Fewer</span>
              <span>More</span>
            </div>
          </>
        )}
        <p className="mt-3 border-t border-white/10 pt-3 leading-relaxed text-slate-500">
          Drag to pan · Right-drag to tilt and rotate · Scroll to zoom
        </p>
      </div>
    </div>
  );
}
