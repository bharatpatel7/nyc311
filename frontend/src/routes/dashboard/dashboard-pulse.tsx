import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { useComplaints } from "@/hooks/useComplaints";
import {
  CATEGORIES,
  CATEGORY_COLORS,
  DAY_MS,
  HOUR_MS,
  formatHour,
  type Category,
  type Complaint,
} from "@/lib/complaints";
import { Panel } from "./components";

const ACCENT = "#3987e5";
const MUTED_BAR = "rgba(148, 163, 184, 0.35)";
const AXIS_TICK = { fill: "#94a3b8", fontSize: 12 };
const GRID = "rgba(255,255,255,0.06)";

/** Fewest requests in the last 24 h for a type to count as "rising"; smaller counts swing wildly. */
const MIN_RECENT = 25;
/** Full days before the last 24 h used as the baseline. */
const BASELINE_DAYS = 4;

const weekdayDay = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "short",
  day: "numeric",
});
/** "Mon 26" */
const dayLabel = (t: number) => {
  const parts = weekdayDay.formatToParts(t);
  const part = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${part("weekday")} ${part("day")}`;
};

const hourLabel = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
});

const GlassTooltip = ({
  active,
  payload,
  label,
  formatLabel,
}: TooltipContentProps<ValueType, NameType> & { formatLabel: (label: number) => string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs">
      <div className="font-semibold text-white">{formatLabel(Number(label))}</div>
      <div className="mt-0.5 text-slate-300">
        {Number(payload[0].value).toLocaleString()} requests
      </div>
    </div>
  );
};

/** Requests per hour across the whole snapshot. */
const hourlySeries = (complaints: Complaint[]) => {
  if (complaints.length === 0) return [];
  const counts = new Map<number, number>();
  let first = Infinity;
  let last = -Infinity;
  for (const c of complaints) {
    const hour = Math.floor(c.created / HOUR_MS) * HOUR_MS;
    counts.set(hour, (counts.get(hour) ?? 0) + 1);
    first = Math.min(first, hour);
    last = Math.max(last, hour);
  }
  const series = [];
  for (let t = first; t <= last; t += HOUR_MS) series.push({ t, count: counts.get(t) ?? 0 });
  return series;
};

interface Rising {
  type: string;
  category: Category;
  recent: number;
  baseline: number;
  change: number;
  daily: number[];
}

/**
 * Types with the biggest jump in the last 24 h compared with their daily average over the
 * previous BASELINE_DAYS full days. Days are counted back from the newest request, since
 * the snapshot is always a little behind the clock.
 */
const risingTypes = (complaints: Complaint[], latest: number): Rising[] => {
  if (complaints.length === 0) return [];
  const first = complaints.reduce((min, c) => Math.min(min, c.created), Infinity);
  const days = Math.min(BASELINE_DAYS, Math.floor((latest - first) / DAY_MS) - 1);
  if (days < 1) return [];

  // daily[0] is the last 24 h, daily[1] the 24 h before that, and so on
  const byType = new Map<string, { category: Category; daily: number[] }>();
  for (const c of complaints) {
    const day = Math.floor((latest - c.created) / DAY_MS);
    if (day > days) continue;
    let entry = byType.get(c.type);
    if (!entry) {
      entry = { category: c.category, daily: Array<number>(days + 1).fill(0) };
      byType.set(c.type, entry);
    }
    entry.daily[day]++;
  }

  return [...byType]
    .map(([type, { category, daily }]) => {
      const recent = daily[0];
      const baseline = daily.slice(1).reduce((a, b) => a + b, 0) / days;
      return {
        type,
        category,
        recent,
        baseline,
        change: recent / Math.max(baseline, 1) - 1,
        daily: [...daily].reverse(),
      };
    })
    .filter((r) => r.recent >= MIN_RECENT && r.change > 0)
    .sort((a, b) => b.change - a.change)
    .slice(0, 6);
};

/** Tiny daily bars; the last bar (the most recent 24 h) is highlighted. */
const Spark = ({ values }: { values: number[] }) => {
  const max = Math.max(1, ...values);
  return (
    <div className="flex h-6 w-16 items-end gap-0.5" aria-hidden>
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-[2px]"
          style={{
            height: `${Math.max(8, (v / max) * 100)}%`,
            background: i === values.length - 1 ? ACCENT : MUTED_BAR,
          }}
        />
      ))}
    </div>
  );
};

export default function DashboardPulse() {
  const { complaints, latest, isLoading, error } = useComplaints();
  const [category, setCategory] = useState<Category | "all">("all");

  const filtered = useMemo(
    () => (category === "all" ? complaints : complaints.filter((c) => c.category === category)),
    [complaints, category]
  );

  const hourly = useMemo(() => hourlySeries(filtered), [filtered]);
  const rising = useMemo(() => risingTypes(complaints, latest), [complaints, latest]);

  const typicalDay = useMemo(() => {
    const counts = Array<number>(24).fill(0);
    for (const c of filtered) counts[new Date(c.created).getUTCHours()]++;
    const days = Math.max(1, hourly.length / 24);
    const rows = counts.map((n, hour) => ({ hour, avg: Math.round(n / days) }));
    const busiest = rows.reduce((a, b) => (b.avg > a.avg ? b : a), rows[0]);
    const quietest = rows.reduce((a, b) => (b.avg < a.avg ? b : a), rows[0]);
    return { rows, busiest, quietest };
  }, [filtered, hourly.length]);

  const midnightTicks = hourly.filter((p) => new Date(p.t).getUTCHours() === 0).map((p) => p.t);
  const status = error ? "Couldn't load complaints." : isLoading ? "Loading…" : null;

  return (
    <div className="space-y-4">
      <Panel>
        <div className="flex flex-wrap items-end justify-between gap-4 px-5 pt-5">
          <div>
            <h1 className="text-sm font-semibold text-slate-100">Requests per hour</h1>
            <p className="mt-0.5 text-xs text-slate-400">
              {status ??
                "Every 311 request in the latest data, by the hour it was filed (NYC time)."}
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category | "all")}
              className="appearance-none rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-100 outline-none transition focus:border-cyan-400/60 [&>option]:bg-slate-900"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="h-72 px-2 pt-4 pb-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourly} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="pulse-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis
                dataKey="t"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                ticks={midnightTicks}
                tickFormatter={(t) => dayLabel(t)}
                tick={AXIS_TICK}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={44} />
              <Tooltip
                cursor={{ stroke: "rgba(255,255,255,0.35)", strokeWidth: 1 }}
                content={(props) => (
                  <GlassTooltip
                    {...(props as TooltipContentProps<ValueType, NameType>)}
                    formatLabel={(t) => hourLabel.format(t)}
                  />
                )}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={category === "all" ? ACCENT : CATEGORY_COLORS[category]}
                strokeWidth={2}
                fill="url(#pulse-fill)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Panel
          title="Rising in the last 24 hours"
          subtitle={`Compared with each type's daily average over the ${BASELINE_DAYS} days before`}
          className="pb-4"
        >
          {rising.length === 0 ? (
            <p className="px-5 pt-4 text-sm text-slate-400">
              {status ?? "Nothing is clearly rising right now."}
            </p>
          ) : (
            <ol className="mt-3 divide-y divide-white/5 px-5">
              {rising.map((r) => (
                <li key={r.type} className="flex items-center gap-3 py-2.5">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: CATEGORY_COLORS[r.category] }}
                    title={r.category}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-slate-200">{r.type}</span>
                    <span className="block text-xs text-slate-500 tabular-nums">
                      {r.recent.toLocaleString()} vs {Math.round(r.baseline).toLocaleString()} a day
                    </span>
                  </span>
                  <Spark values={r.daily} />
                  <span className="w-14 text-right text-sm font-semibold text-white tabular-nums">
                    +{Math.round(r.change * 100)}%
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <Panel
          title="A typical day"
          subtitle={
            filtered.length
              ? `Average requests per hour · busiest at ${formatHour(typicalDay.busiest.hour)}, quietest at ${formatHour(typicalDay.quietest.hour)}`
              : "Average requests per hour"
          }
          className="pb-2"
        >
          <div className="h-80 px-2 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typicalDay.rows} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis
                  dataKey="hour"
                  ticks={[0, 6, 12, 18, 23]}
                  tickFormatter={formatHour}
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={44} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  content={(props) => (
                    <GlassTooltip
                      {...(props as TooltipContentProps<ValueType, NameType>)}
                      formatLabel={(h) =>
                        `${formatHour(h)}–${formatHour((h + 1) % 24)}, on average`
                      }
                    />
                  )}
                />
                <Bar dataKey="avg" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {typicalDay.rows.map((r) => (
                    <Cell
                      key={r.hour}
                      fill={r.hour === typicalDay.busiest.hour ? ACCENT : MUTED_BAR}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}
