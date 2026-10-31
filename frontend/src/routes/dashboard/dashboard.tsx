import { useEffect, useState } from "react";
import { fetchSummary } from "@/lib/api";
import type { Summary } from "@/types/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import Stat from "./components/Stat";
import { MOCK_SUMMARY } from "@/lib/api.mocks";

const BOROUGH_COLORS = ["#3b82f6", "#ff8c00", "#6366f1", "#a855f7", "#ec4899"];

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary>(MOCK_SUMMARY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary()
      .then(setSummary)
      .finally(() => setLoading(false));
  }, []);

  const fastest = [...summary.complaintsByAgency].sort((a, b) => a.count - b.count)[0];
  const busiest = [...summary.complaintsByAgency].sort((a, b) => b.count - a.count)[0];

  if (loading) return null;

  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-black/30 dark:backdrop-blur-sm">
      <div className="flex flex-col gap-6 p-4  h-[calc(100vh-220px)] min-h-[500px] bg-slate-100 dark:bg-slate-800">
        <div className="flex gap-4">
          <div className="flex-1 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <Stat label="Total Complaints" value={summary.totalComplaints.toLocaleString()} />
          </div>
          <div className="flex-1 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <Stat
              label="Fewest Complaints - Agency"
              value={`${fastest?.agency ?? "—"} (${fastest?.count.toLocaleString()})`}
            />
          </div>
          <div className="flex-1 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <Stat
              label="Most Complaints - Agency"
              value={`${busiest?.agency ?? "—"} (${busiest?.count.toLocaleString()})`}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Complaints by Borough
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={summary.complaintsByBorough}
                  dataKey="count"
                  nameKey="borough"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ borough }) => borough}
                >
                  {summary.complaintsByBorough.map((_, i) => (
                    <Cell key={i} fill={BOROUGH_COLORS[i % BOROUGH_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => value.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Complaints by Agency
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={summary.complaintsByAgency} margin={{ bottom: 20 }}>
                <XAxis
                  dataKey="agency"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={60}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => value.toLocaleString()} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
