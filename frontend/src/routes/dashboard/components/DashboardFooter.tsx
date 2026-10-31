import { formatDate, formatTime } from "@/lib/util";
import type { DataRefresh } from "@/types/logs";

interface DashboardFooterProps {
  refresh: DataRefresh | null;
}

const DashboardFooter = ({ refresh }: DashboardFooterProps) => (
  <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
    <span>
      Data source:{" "}
      <a
        href="https://opendata.cityofnewyork.us/"
        target="_blank"
        rel="noreferrer"
        className="text-slate-400 hover:text-cyan-300"
      >
        NYC Open Data
      </a>
    </span>
    <span>Built by Bharat Garsondiya</span>
    {refresh?.refreshStartedAt && (
      <span>
        Last refresh: {formatDate(refresh.refreshStartedAt)} at{" "}
        {formatTime(refresh.refreshStartedAt)}
      </span>
    )}
  </footer>
);

export default DashboardFooter;
