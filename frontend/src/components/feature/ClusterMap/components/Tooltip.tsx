import type { TooltipProps } from "./types";

const Tooltip = ({ label }: TooltipProps) => (
  <div className="pointer-events-none absolute left-0 top-full mt-1 rounded bg-slate-50 dark:bg-[#0d0d0d]/70 px-2 py-1 text-xs font-black text-gray-600 dark:text-gray-100 opacity-0 transition group-hover:opacity-100">
    {label}
  </div>
);

export default Tooltip;
