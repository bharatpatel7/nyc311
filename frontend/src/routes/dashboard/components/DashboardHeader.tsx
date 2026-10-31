import Logo from "@/components/layout/Logo";
import { formatDate, formatTime } from "@/lib/util";
import type { DataRefresh } from "@/types/logs";
import DashboardNav from "./DashboardNav";

interface DashboardHeaderProps {
  refresh: DataRefresh | null;
}

const DashboardHeader = ({ refresh }: DashboardHeaderProps) => (
  <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <div className="flex items-center justify-between gap-4">
      <Logo />
      <LiveBadge refresh={refresh} />
    </div>
    <DashboardNav />
  </header>
);

const LiveBadge = ({ refresh }: DashboardHeaderProps) => {
  const live = Boolean(refresh?.refreshStartedAt);
  return (
    <span className="glass flex items-center gap-2 rounded-full px-3 py-1 text-xs text-slate-300 lg:hidden xl:flex">
      <span className="relative flex size-2">
        {live && (
          <span className="absolute inset-0 rounded-full bg-emerald-400 [animation:pulse-ring_1.8s_ease-out_infinite]" />
        )}
        <span
          className={`relative size-2 rounded-full ${live ? "bg-emerald-400" : "bg-slate-500"}`}
        />
      </span>
      {live && refresh?.refreshStartedAt
        ? `Updated ${formatDate(refresh.refreshStartedAt)}, ${formatTime(refresh.refreshStartedAt)}`
        : "Demo data"}
    </span>
  );
};

export default DashboardHeader;
