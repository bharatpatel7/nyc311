interface StatProps {
  label: string;
  value: string;
}

const Stat = ({ label, value }: StatProps) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
      {label}
    </span>
    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</span>
  </div>
);

export default Stat;
