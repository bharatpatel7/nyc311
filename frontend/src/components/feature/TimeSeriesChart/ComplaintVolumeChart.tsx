import type { ReactNode } from "react";
import { useState, useCallback, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { usePersistedState } from "@/hooks/usePersistedState";
import {
  VOLUME_CHART_TITLE,
  VOLUME_CHART_YAXIS_LABEL,
  VOLUME_STORAGE_KEY,
  SERIES_COLORS,
  TOP_N,
  BOTTOM_N,
  DEFAULT_VISIBLE,
  HIDDEN_TYPES_KEY,
} from "./constants";
import type { ComplaintVolumeDto } from "@/hooks/types";
import { useComplaintVolume } from "@/hooks/useComplaintVolume";
import { Button } from "@/components/ui";

interface PivotedRow {
  period: string;
  [complaintType: string]: string | number;
}

interface TooltipEntry {
  dataKey: string;
  value: number;
  color: string;
}

const ComplaintVolumeChartContainer = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col bg-white p-6 h-[calc(100vh-220px)] min-h-[500px] bg-slate-100 dark:bg-slate-800">
    <h2 className="mb-4 shrink-0 text-lg font-semibold text-gray-900">{VOLUME_CHART_TITLE}</h2>
    {children}
  </div>
);

const pivotData = (data: ComplaintVolumeDto[]): { rows: PivotedRow[]; types: string[] } => {
  const types = [...new Set(data.map((d) => d.complaintType))];
  const byPeriod = new Map<string, PivotedRow>();

  for (const d of data) {
    if (!byPeriod.has(d.period)) {
      byPeriod.set(d.period, { period: d.period });
    }
    byPeriod.get(d.period)![d.complaintType] = d.count;
  }

  const rows = [...byPeriod.values()].sort((a, b) => a.period.localeCompare(b.period));
  return { rows, types };
};

const rankTypesByVolume = (data: ComplaintVolumeDto[]): string[] => {
  const totals = new Map<string, number>();
  for (const d of data) {
    totals.set(d.complaintType, (totals.get(d.complaintType) ?? 0) + d.count);
  }
  return [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([type]) => type);
};

const CondensedTooltip = ({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string;
  payload?: TooltipEntry[];
}) => {
  if (!active || !payload || payload.length === 0) return null;

  const sorted = [...payload]
    .filter((e) => typeof e.value === "number")
    .sort((a, b) => b.value - a.value);

  const total = sorted.length;
  const showAll = total <= TOP_N + BOTTOM_N + 1;

  const top = showAll ? sorted : sorted.slice(0, TOP_N);
  const bottom = showAll ? [] : sorted.slice(-BOTTOM_N);
  const middleCount = showAll ? 0 : total - TOP_N - BOTTOM_N;

  return (
    <div className="rounded border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg max-w-[280px]">
      <p className="mb-1 font-semibold text-gray-900">{label}</p>
      {top.map((e) => (
        <div key={e.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 truncate">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: e.color }}
            />
            <span className="truncate">{e.dataKey}</span>
          </span>
          <span className="font-medium tabular-nums">{e.value.toLocaleString()}</span>
        </div>
      ))}
      {middleCount > 0 && (
        <div className="py-0.5 text-gray-400 text-center">
          +{middleCount} other{middleCount > 1 ? "s" : ""}
        </div>
      )}
      {bottom.map((e) => (
        <div key={e.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 truncate">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: e.color }}
            />
            <span className="truncate">{e.dataKey}</span>
          </span>
          <span className="font-medium tabular-nums">{e.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const ComplaintVolumeChart = () => {
  const { value: complaintType } = usePersistedState(VOLUME_STORAGE_KEY);

  const { data, isLoading, isError } = useComplaintVolume(complaintType);
  const { rows, types } = useMemo(() => pivotData(data), [data]);

  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(HIDDEN_TYPES_KEY);
    if (stored) {
      try {
        return new Set(JSON.parse(stored) as string[]);
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  const [initialized, setInitialized] = useState(
    () => localStorage.getItem(HIDDEN_TYPES_KEY) !== null
  );

  useEffect(() => {
    if (types.length === 0 || initialized) return;
    const ranked = rankTypesByVolume(data);
    const toHide = new Set(ranked.slice(DEFAULT_VISIBLE));
    setHiddenTypes(toHide);
    setInitialized(true);
  }, [types, data, initialized]);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem(HIDDEN_TYPES_KEY, JSON.stringify([...hiddenTypes]));
  }, [hiddenTypes, initialized]);

  const visibleCount = types.length - hiddenTypes.size;
  const allVisible = hiddenTypes.size === 0;

  const handleToggleAll = useCallback(() => {
    if (allVisible) {
      setHiddenTypes(new Set(types));
    } else {
      setHiddenTypes(new Set());
    }
  }, [allVisible, types]);

  const handleLegendClick = useCallback((type: string) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  if (isLoading) {
    return (
      <ComplaintVolumeChartContainer>
        <p className="text-gray-500">Loading...</p>
      </ComplaintVolumeChartContainer>
    );
  }

  if (isError) {
    return (
      <ComplaintVolumeChartContainer>
        <p className="text-red-600">Failed to load complaint volume data.</p>
      </ComplaintVolumeChartContainer>
    );
  }

  if (data.length === 0) {
    return (
      <ComplaintVolumeChartContainer>
        <p className="text-gray-500">No complaint volume data available.</p>
      </ComplaintVolumeChartContainer>
    );
  }

  return (
    <ComplaintVolumeChartContainer>
      <div className="flex shrink-0 items-center gap-4">
        {types.length > 0 && (
          <Button
            variant="none"
            onClick={handleToggleAll}
            className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            {allVisible ? "Hide All" : "Show All"}
          </Button>
        )}
        {types.length > 0 && (
          <span className="text-xs text-slate-400">
            {visibleCount}/{types.length} visible
          </span>
        )}
      </div>

      <>
        <div className="min-h-0 flex-1 outline-none mt-4" onMouseDown={(e) => e.preventDefault()}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 8, right: 24, left: 16, bottom: 48 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="period"
                angle={-35}
                textAnchor="end"
                tick={{ fontSize: 12 }}
                interval={0}
              />
              <YAxis
                label={{
                  value: VOLUME_CHART_YAXIS_LABEL,
                  angle: -90,
                  position: "insideLeft",
                  offset: -4,
                  style: { fontSize: 12 },
                }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip isAnimationActive={false} content={<CondensedTooltip />} />
              {types.map((type, i) => (
                <Line
                  key={type}
                  type="monotone"
                  dataKey={type}
                  stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  hide={hiddenTypes.has(type)}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="shrink-0 mt-3 flex flex-wrap gap-x-4 gap-y-1 justify-center overflow-y-auto max-h-24">
          {types.map((type, i) => (
            <Button
              variant="none"
              key={type}
              onClick={() => handleLegendClick(type)}
              className="flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor: hiddenTypes.has(type)
                    ? "#d1d5db"
                    : SERIES_COLORS[i % SERIES_COLORS.length],
                }}
              />
              <span
                style={{
                  color: hiddenTypes.has(type) ? "#9ca3af" : undefined,
                  textDecoration: hiddenTypes.has(type) ? "line-through" : undefined,
                }}
              >
                {type}
              </span>
            </Button>
          ))}
        </div>
      </>
    </ComplaintVolumeChartContainer>
  );
};

export default ComplaintVolumeChart;
