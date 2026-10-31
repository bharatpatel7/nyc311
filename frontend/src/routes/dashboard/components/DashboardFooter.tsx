import { formatDate, formatTime } from "@/lib/util";
import type { DataRefresh } from "@/types/logs";
import { Link } from "react-router";

interface DashboardFooterProps {
  refresh: DataRefresh | null;
}

const DashboardFooter = ({ refresh }: DashboardFooterProps) => {
  return (
    <footer className="mt-4 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
      <span>
        Data source:{" "}
        <Link to="https://opendata.cityofnewyork.us/" className="hover:text-emerald-500/50">
          NYC Open Data
        </Link>
      </span>

      {refresh?.refreshStartedAt && (
        <span>
          Last refresh: {formatDate(refresh.refreshStartedAt)} at{" "}
          {formatTime(refresh.refreshStartedAt)}
        </span>
      )}
    </footer>
  );
};

export default DashboardFooter;
