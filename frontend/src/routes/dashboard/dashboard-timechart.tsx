import { Chart } from "@/components/feature/TimeSeriesChart";

export default function DashboardTimeChart() {
  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-black/30 dark:backdrop-blur-sm">
      <div className="flex h-[calc(100vh-220px)] min-h-[500px] flex-col">
        <div className="min-h-0 flex-1 overflow-hidden">
          <Chart />
        </div>
      </div>
    </div>
  );
}
