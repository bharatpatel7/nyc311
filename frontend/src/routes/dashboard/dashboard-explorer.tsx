import { lazy, Suspense, useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import { useComplaints } from "@/hooks/useComplaints";
import { getAgencyLabel, isAgency } from "@/lib/agency";
import {
  CATEGORIES,
  CATEGORY_COLORS,
  HOUR_MS,
  formatDateTime,
  formatHour,
  formatHours,
  type Category,
  type Complaint,
} from "@/lib/complaints";
import { cn } from "@/lib/util";

const ExplorerMap = lazy(() => import("@/components/feature/Explorer/ExplorerMap"));

type StatusFilter = "all" | "open" | "closed";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
];

const TIME_OPTIONS = [
  { value: "any", label: "Any time", from: 0, to: 24 },
  { value: "night", label: "Night", from: 0, to: 6 },
  { value: "morning", label: "Morning", from: 6, to: 12 },
  { value: "afternoon", label: "Afternoon", from: 12, to: 18 },
  { value: "evening", label: "Evening", from: 18, to: 24 },
] as const;

type TimeFilter = (typeof TIME_OPTIONS)[number]["value"];

const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const hourOf = (c: Complaint) => new Date(c.created).getUTCHours();

const Segmented = <T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) => (
  <div role="radiogroup" aria-label={label} className="flex gap-1 rounded-xl bg-white/5 p-1">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        role="radio"
        aria-checked={value === o.value}
        onClick={() => onChange(o.value)}
        className={cn(
          "flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition",
          value === o.value ? "bg-white text-ink" : "text-slate-300 hover:bg-white/10"
        )}
      >
        {o.label}
      </button>
    ))}
  </div>
);

/** When the shown complaints were filed, hour by hour; the chosen time window is highlighted. */
const HourStrip = ({ counts, from, to }: { counts: number[]; from: number; to: number }) => {
  const max = Math.max(1, ...counts);
  return (
    <div>
      <div className="flex h-12 items-end gap-0.5" aria-hidden>
        {counts.map((n, hour) => (
          <div
            key={hour}
            title={`${formatHour(hour)}: ${n.toLocaleString()}`}
            className={cn(
              "flex-1 rounded-t-[3px] transition-colors",
              hour >= from && hour < to ? "bg-cyan-400/80" : "bg-white/15"
            )}
            style={{ height: `${Math.max(4, (n / max) * 100)}%` }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-500">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>12 AM</span>
      </div>
    </div>
  );
};

const Detail = ({
  complaint,
  latest,
  onClose,
}: {
  complaint: Complaint;
  latest: number;
  onClose: () => void;
}) => {
  const agency = isAgency(complaint.agency) ? getAgencyLabel(complaint.agency) : null;
  const rows: [string, string][] = [
    ["Filed", formatDateTime(complaint.created)],
    ["Agency", agency ? `${complaint.agency} · ${agency}` : complaint.agency],
    ["Borough", titleCase(complaint.borough)],
    ["Status", complaint.status],
    complaint.hours !== null
      ? ["Closed after", formatHours(complaint.hours)]
      : ["Open for", `${formatHours((latest - complaint.created) / HOUR_MS)} so far`],
    ["Request #", complaint.key],
  ];
  return (
    <div className="glass-strong absolute right-4 bottom-12 z-10 w-80 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <span
              className="size-2 rounded-full"
              style={{ background: CATEGORY_COLORS[complaint.category] }}
            />
            {complaint.category}
          </span>
          <h2 className="mt-1 font-semibold text-white">{complaint.type}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="rounded-full p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <FiX />
        </button>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex gap-3">
            <dt className="w-24 shrink-0 text-slate-500">{label}</dt>
            <dd className="text-slate-200 tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default function DashboardExplorer() {
  const { complaints, latest, isLoading, error } = useComplaints();
  const [hidden, setHidden] = useState<Set<Category>>(new Set());
  const [status, setStatus] = useState<StatusFilter>("all");
  const [time, setTime] = useState<TimeFilter>("any");
  const [selected, setSelected] = useState<Complaint | null>(null);

  const slot = TIME_OPTIONS.find((o) => o.value === time)!;

  // status + time first, so each category chip can show how many it would add
  const inStatusAndTime = useMemo(
    () =>
      complaints.filter((c) => {
        if (status === "open" && c.closed !== null) return false;
        if (status === "closed" && c.closed === null) return false;
        const h = hourOf(c);
        return h >= slot.from && h < slot.to;
      }),
    [complaints, status, slot]
  );

  const shown = useMemo(
    () => inStatusAndTime.filter((c) => !hidden.has(c.category)),
    [inStatusAndTime, hidden]
  );

  const categoryCounts = useMemo(() => {
    const counts = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<Category, number>;
    for (const c of inStatusAndTime) counts[c.category]++;
    return counts;
  }, [inStatusAndTime]);

  // the strip ignores the time filter so you can see what the window leaves out
  const hourCounts = useMemo(() => {
    const counts = Array<number>(24).fill(0);
    for (const c of complaints) {
      if (hidden.has(c.category)) continue;
      if (status === "open" && c.closed !== null) continue;
      if (status === "closed" && c.closed === null) continue;
      counts[hourOf(c)]++;
    }
    return counts;
  }, [complaints, hidden, status]);

  const toggle = (category: Category) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });

  const only = (category: Category) => setHidden(new Set(CATEGORIES.filter((c) => c !== category)));

  return (
    <div className="glass relative h-[calc(100vh-150px)] min-h-[560px] overflow-hidden rounded-2xl">
      <Suspense fallback={<div className="h-full animate-pulse bg-white/5" />}>
        <ExplorerMap complaints={shown} selected={selected} onSelect={setSelected} />
      </Suspense>

      {isLoading && (
        <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-white/5">
          <div className="h-full w-1/3 bg-linear-to-r from-transparent via-cyan-400 to-transparent [animation:slide_1.2s_linear_infinite]" />
        </div>
      )}

      <aside className="glass-strong absolute top-4 left-4 z-10 max-h-[calc(100%-2rem)] w-76 overflow-y-auto rounded-2xl p-5">
        <h1 className="text-lg font-semibold text-white">Complaint Explorer</h1>
        <p className="mt-1 text-sm text-slate-400">
          {error ? (
            "Couldn't load complaints."
          ) : (
            <>
              <span className="font-semibold text-white tabular-nums">
                {shown.length.toLocaleString()}
              </span>{" "}
              complaints · click a dot for details
            </>
          )}
        </p>

        <div className="mt-5 space-y-2">
          <span className="text-xs font-medium text-slate-400">Status</span>
          <Segmented label="Status" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
        </div>

        <div className="mt-5 space-y-2">
          <span className="text-xs font-medium text-slate-400">Time of day</span>
          <select
            aria-label="Time of day"
            value={time}
            onChange={(e) => setTime(e.target.value as TimeFilter)}
            className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 [&>option]:bg-slate-900"
          >
            {TIME_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.value === "any"
                  ? o.label
                  : `${o.label} · ${formatHour(o.from)}–${formatHour(o.to % 24)}`}
              </option>
            ))}
          </select>
          <HourStrip counts={hourCounts} from={slot.from} to={slot.to} />
        </div>

        <div className="mt-5 border-t border-white/10 pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-slate-400">Categories</span>
            {hidden.size > 0 && (
              <button
                type="button"
                onClick={() => setHidden(new Set())}
                className="text-xs text-cyan-300 hover:text-cyan-200"
              >
                Show all
              </button>
            )}
          </div>
          <ul className="mt-2 space-y-0.5">
            {CATEGORIES.map((category) => {
              const off = hidden.has(category);
              return (
                <li key={category} className="group flex items-center">
                  <button
                    type="button"
                    aria-pressed={!off}
                    onClick={() => toggle(category)}
                    className={cn(
                      "flex flex-1 items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-white/5",
                      off && "opacity-40"
                    )}
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: CATEGORY_COLORS[category] }}
                    />
                    <span className="flex-1 text-slate-200">{category}</span>
                    <span className="text-xs text-slate-400 tabular-nums">
                      {categoryCounts[category].toLocaleString()}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => only(category)}
                    className="ml-1 rounded-md px-1.5 py-1 text-[11px] text-slate-500 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-slate-200 focus:opacity-100"
                  >
                    Only
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {selected && (
        <Detail complaint={selected} latest={latest} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
