import { useMemo, useState } from "react";
import { FiAlertCircle, FiBriefcase, FiCheckCircle, FiClock } from "react-icons/fi";
import { useComplaints } from "@/hooks/useComplaints";
import { getAgencyLabel, isAgency } from "@/lib/agency";
import { DAY_MS, formatHours, median, type Complaint } from "@/lib/complaints";
import { cn } from "@/lib/util";
import { Panel, Stat } from "./components";

// time-to-close buckets; one-hue ramp that brightens as requests take longer,
// so slow agencies stand out against the dark page
const BUCKETS = [
  { label: "Under 1 h", max: 1, color: "#1c5cab" },
  { label: "1–4 h", max: 4, color: "#2a78d6" },
  { label: "4–24 h", max: 24, color: "#5598e7" },
  { label: "1–3 days", max: 72, color: "#86b6ef" },
  { label: "Over 3 days", max: Infinity, color: "#cde2fb" },
];

/** Agencies with fewer closed requests than this get no median; it would be noise. */
const MIN_CLOSED = 10;

interface AgencyRow {
  agency: string;
  name: string | null;
  requests: number;
  closed: number;
  open: number;
  median: number | null;
  within24: number | null;
  buckets: number[];
}

type SortKey = "requests" | "median" | "within24" | "open";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "requests", label: "Requests" },
  { key: "median", label: "Median time" },
  { key: "within24", label: "Closed in 24 h" },
  { key: "open", label: "Still open" },
];

const pct = (n: number | null) => (n === null ? "–" : `${Math.round(n * 100)}%`);

const bucketOf = (hours: number) => BUCKETS.findIndex((b) => hours < b.max);

const summarize = (agency: string, items: Complaint[]): AgencyRow => {
  const hours = items.flatMap((c) => (c.hours === null ? [] : [c.hours]));
  const buckets = BUCKETS.map(() => 0);
  for (const h of hours) buckets[bucketOf(h)]++;
  const enough = hours.length >= MIN_CLOSED;
  return {
    agency,
    name: isAgency(agency) ? getAgencyLabel(agency) : null,
    requests: items.length,
    closed: hours.length,
    open: items.filter((c) => c.closed === null).length,
    median: enough ? median(hours) : null,
    within24: enough ? hours.filter((h) => h <= 24).length / hours.length : null,
    buckets,
  };
};

const compare = (key: SortKey) => (a: AgencyRow, b: AgencyRow) => {
  // agencies without a median sink to the bottom whichever way you sort
  const va = a[key];
  const vb = b[key];
  if (va === null || vb === null) return va === null ? (vb === null ? 0 : 1) : -1;
  return key === "median" ? va - vb : vb - va;
};

const Distribution = ({ row }: { row: AgencyRow }) => {
  if (row.closed === 0) return <span className="text-xs text-slate-500">Nothing closed yet</span>;
  return (
    <div
      className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full"
      role="img"
      aria-label={BUCKETS.map((b, i) => `${b.label}: ${row.buckets[i]}`).join(", ")}
    >
      {BUCKETS.map((b, i) =>
        row.buckets[i] ? (
          <div
            key={b.label}
            title={`${b.label}: ${row.buckets[i].toLocaleString()} (${pct(row.buckets[i] / row.closed)})`}
            style={{ flexGrow: row.buckets[i], background: b.color }}
          />
        ) : null
      )}
    </div>
  );
};

/** Medians under this look like administrative closures rather than fixes. */
const INSTANT_HOURS = 5 / 60;

const TypeList = ({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: { type: string; median: number; closed: number }[];
}) => (
  <Panel title={title} subtitle={subtitle} className="pb-4">
    <ol className="mt-3 divide-y divide-white/5 px-5">
      {rows.map((r, i) => (
        <li key={r.type} className="flex items-baseline gap-3 py-2 text-sm">
          <span className="w-4 text-xs text-slate-500 tabular-nums">{i + 1}</span>
          <span className="flex-1 truncate text-slate-200">{r.type}</span>
          <span className="text-xs text-slate-500 tabular-nums">
            {r.closed.toLocaleString()} closed
          </span>
          <span className="w-16 text-right font-medium text-white tabular-nums">
            {formatHours(r.median)}
          </span>
        </li>
      ))}
    </ol>
  </Panel>
);

export default function DashboardScorecard() {
  const { complaints, isLoading, error } = useComplaints();
  const [sort, setSort] = useState<SortKey>("requests");

  const rows = useMemo(() => {
    const byAgency = new Map<string, Complaint[]>();
    for (const c of complaints) {
      const list = byAgency.get(c.agency);
      if (list) list.push(c);
      else byAgency.set(c.agency, [c]);
    }
    return [...byAgency].map(([agency, items]) => summarize(agency, items));
  }, [complaints]);

  const sorted = useMemo(() => [...rows].sort(compare(sort)), [rows, sort]);

  const overall = useMemo(() => {
    const hours = complaints.flatMap((c) => (c.hours === null ? [] : [c.hours]));
    return {
      median: median(hours),
      within24: hours.length ? hours.filter((h) => h <= 24).length / hours.length : null,
      open: complaints.filter((c) => c.closed === null).length,
    };
  }, [complaints]);

  const types = useMemo(() => {
    const byType = new Map<string, number[]>();
    for (const c of complaints) {
      if (c.hours === null) continue;
      const list = byType.get(c.type);
      if (list) list.push(c.hours);
      else byType.set(c.type, [c.hours]);
    }
    const ranked = [...byType]
      .filter(([, hours]) => hours.length >= 50)
      .map(([type, hours]) => ({ type, median: median(hours)!, closed: hours.length }))
      .sort((a, b) => a.median - b.median);
    return {
      fastest: ranked.filter((r) => r.median >= INSTANT_HOURS).slice(0, 6),
      slowest: ranked.slice(-6).reverse(),
    };
  }, [complaints]);

  const days = useMemo(() => {
    if (complaints.length === 0) return 0;
    let first = Infinity;
    let last = -Infinity;
    for (const c of complaints) {
      first = Math.min(first, c.created);
      last = Math.max(last, c.created);
    }
    return Math.max(1, Math.round((last - first) / DAY_MS));
  }, [complaints]);

  const loadingValue = isLoading ? "…" : undefined;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Agencies"
          icon={<FiBriefcase />}
          value={loadingValue ?? rows.length}
          detail="receiving 311 requests"
        />
        <Stat
          label="Median time to close"
          icon={<FiClock />}
          value={loadingValue ?? formatHours(overall.median)}
          detail="across every closed request"
        />
        <Stat
          label="Closed within 24 h"
          icon={<FiCheckCircle />}
          value={loadingValue ?? pct(overall.within24)}
          detail="of closed requests"
        />
        <Stat
          label="Still open"
          icon={<FiAlertCircle />}
          value={loadingValue ?? overall.open.toLocaleString()}
          detail={
            isLoading
              ? undefined
              : `${pct(overall.open / Math.max(1, complaints.length))} of all requests`
          }
        />
      </div>

      <Panel>
        <div className="flex flex-wrap items-end justify-between gap-4 px-5 pt-5">
          <div>
            <h1 className="text-sm font-semibold text-slate-100">Agency scorecard</h1>
            <p className="mt-0.5 text-xs text-slate-400">
              How quickly each city agency closes the requests it receives.
              {error && " Couldn't load complaints."}
            </p>
          </div>
          <div
            role="radiogroup"
            aria-label="Sort agencies by"
            className="flex gap-1 rounded-full bg-white/5 p-1"
          >
            {SORTS.map((s) => (
              <button
                key={s.key}
                type="button"
                role="radio"
                aria-checked={sort === s.key}
                onClick={() => setSort(s.key)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition",
                  sort === s.key ? "bg-white text-ink" : "text-slate-300 hover:bg-white/10"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 pt-4 text-xs text-slate-400">
          <span className="text-slate-500">Time to close:</span>
          {BUCKETS.map((b) => (
            <span key={b.label} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: b.color }} />
              {b.label}
            </span>
          ))}
        </div>

        <div className="overflow-x-auto px-5 pt-3 pb-5">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-slate-500">
                <th className="py-2 pr-4 font-medium">Agency</th>
                <th className="py-2 pr-4 text-right font-medium">Requests</th>
                <th className="py-2 pr-4 text-right font-medium">Median</th>
                <th className="py-2 pr-4 text-right font-medium">≤ 24 h</th>
                <th className="py-2 pr-4 text-right font-medium">Open</th>
                <th className="w-[34%] py-2 font-medium">Time to close</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading &&
                Array.from({ length: 6 }, (_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-3">
                      <div className="h-4 animate-pulse rounded bg-white/5" />
                    </td>
                  </tr>
                ))}
              {sorted.map((r) => (
                <tr key={r.agency} className="transition hover:bg-white/[0.03]">
                  <td className="py-2.5 pr-4">
                    <div className="font-semibold text-white">{r.agency}</div>
                    {r.name && <div className="text-xs text-slate-500">{r.name}</div>}
                  </td>
                  <td className="py-2.5 pr-4 text-right text-slate-200 tabular-nums">
                    {r.requests.toLocaleString()}
                  </td>
                  <td
                    className="py-2.5 pr-4 text-right font-medium text-white tabular-nums"
                    title={
                      r.median === null ? `Fewer than ${MIN_CLOSED} closed requests` : undefined
                    }
                  >
                    {formatHours(r.median)}
                  </td>
                  <td className="py-2.5 pr-4 text-right text-slate-200 tabular-nums">
                    {pct(r.within24)}
                  </td>
                  <td className="py-2.5 pr-4 text-right text-slate-200 tabular-nums">
                    {r.open.toLocaleString()}
                  </td>
                  <td className="py-2.5">
                    <Distribution row={r} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-slate-500">
            Times run from when a request was filed to when it was closed. This covers requests
            filed over the last {days} days, so anything taking longer than that is still open and
            not yet counted in the medians. Agencies with fewer than {MIN_CLOSED} closed requests
            show no median.
          </p>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <TypeList
          title="Fastest to close"
          subtitle="At least 50 closed requests; leaves out types usually closed within 5 minutes"
          rows={types.fastest}
        />
        <TypeList
          title="Slowest to close"
          subtitle="Complaint types with at least 50 closed requests"
          rows={types.slowest}
        />
      </div>
    </div>
  );
}
