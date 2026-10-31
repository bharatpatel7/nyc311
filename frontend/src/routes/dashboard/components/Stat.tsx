import type { ReactNode } from "react";

interface StatProps {
  label: string;
  value: ReactNode;
  detail?: string;
  icon: ReactNode;
}

/** KPI tile: one headline number with a label and optional detail line. */
const Stat = ({ label, value, detail, icon }: StatProps) => (
  <div className="glass relative overflow-hidden rounded-2xl p-5">
    <div className="flex items-start justify-between">
      <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</span>
      <span className="grid size-8 place-items-center rounded-lg bg-white/5 text-cyan-300 ring-1 ring-white/10">
        {icon}
      </span>
    </div>
    <div className="mt-3 truncate font-display text-3xl font-semibold text-white tabular-nums">
      {value}
    </div>
    {detail && <div className="mt-1 truncate text-sm text-slate-400">{detail}</div>}
  </div>
);

export default Stat;
