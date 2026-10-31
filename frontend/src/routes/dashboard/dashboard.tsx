import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router";
import { FiArrowUpRight, FiBriefcase, FiHash, FiMapPin, FiMoon } from "react-icons/fi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { fetchSummary } from "@/lib/api";
import { MOCK_SUMMARY } from "@/lib/api.mocks";
import { useCountUp } from "@/hooks/useCountUp";
import { useCityPoints } from "@/components/feature/City3D/useCityPoints";
import type { Summary } from "@/types/api";
import { Panel, Stat } from "./components";

const City3D = lazy(() => import("@/components/feature/City3D/City3D"));

const SERIES_COLOR = "#3987e5";
const AXIS_TICK = { fill: "#94a3b8", fontSize: 12 };

const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const GlassTooltip = ({ active, payload, label }: TooltipContentProps<ValueType, NameType>) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs">
      <div className="font-semibold text-white">{label}</div>
      <div className="mt-0.5 text-slate-300">
        {Number(payload[0].value).toLocaleString()} complaints
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary>(MOCK_SUMMARY);
  const [loading, setLoading] = useState(true);
  const { points } = useCityPoints();

  useEffect(() => {
    fetchSummary()
      .then(setSummary)
      .finally(() => setLoading(false));
  }, []);

  const total = useCountUp(loading ? 0 : summary.totalComplaints);

  const boroughs = summary.complaintsByBorough
    .filter((b) => b.borough !== "Unspecified")
    .sort((a, b) => b.count - a.count)
    .map((b) => ({ ...b, borough: titleCase(b.borough) }));
  const agencies = [...summary.complaintsByAgency].sort((a, b) => b.count - a.count);
  const busiestBorough = boroughs[0];
  const busiest = agencies[0];
  const quietest = agencies[agencies.length - 1];

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total complaints" value={total.toLocaleString()} icon={<FiHash />} />
        <Stat
          label="Busiest borough"
          value={busiestBorough?.borough ?? "—"}
          detail={busiestBorough && `${busiestBorough.count.toLocaleString()} complaints`}
          icon={<FiMapPin />}
        />
        <Stat
          label="Busiest agency"
          value={busiest?.agency ?? "—"}
          detail={busiest && `${busiest.count.toLocaleString()} complaints`}
          icon={<FiBriefcase />}
        />
        <Stat
          label="Quietest agency"
          value={quietest?.agency ?? "—"}
          detail={quietest && `${quietest.count.toLocaleString()} complaints`}
          icon={<FiMoon />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Link
          to="/dashboard/city"
          className="glass group relative h-[360px] overflow-hidden rounded-2xl lg:col-span-3"
          aria-label="Open the 3D city view"
        >
          <div className="pointer-events-none absolute inset-0 z-0">
            <Suspense fallback={<div className="h-full animate-pulse bg-white/5" />}>
              {points.length > 0 && (
                <City3D
                  points={points}
                  autoRotate
                  interactive={false}
                  attributionPosition="top-right"
                />
              )}
            </Suspense>
          </div>
          <div className="pointer-events-none absolute inset-0 z-[1] bg-linear-to-t from-ink/90 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 z-[2] flex items-end justify-between p-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Complaint density in 3D</h2>
              <p className="text-sm text-slate-300">
                {points.length.toLocaleString()} complaints with your current filters
              </p>
            </div>
            <span className="glass flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white transition group-hover:bg-white/15">
              Explore <FiArrowUpRight />
            </span>
          </div>
        </Link>

        <Panel title="Complaints by borough" className="lg:col-span-2">
          <div className="h-[300px] px-2 pb-4 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={boroughs} layout="vertical" margin={{ right: 56, left: 8 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="borough"
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip content={GlassTooltip} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="count" fill={SERIES_COLOR} radius={[0, 4, 4, 0]} barSize={22}>
                  <LabelList
                    dataKey="count"
                    position="right"
                    fill="#cbd5e1"
                    fontSize={12}
                    formatter={(v) => Number(v).toLocaleString()}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel
        title="Complaints by agency"
        subtitle="Every agency that received a request, busiest first"
      >
        <div className="h-[320px] px-2 pb-3 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agencies} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="agency"
                tick={AXIS_TICK}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                tick={AXIS_TICK}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => v.toLocaleString()}
                width={56}
              />
              <Tooltip content={GlassTooltip} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="count" fill={SERIES_COLOR} radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
