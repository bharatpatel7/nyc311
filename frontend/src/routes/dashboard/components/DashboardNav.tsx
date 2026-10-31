import { NavLink } from "react-router";

const navItems = [
  { to: "/dashboard", label: "Dashboard", end: true },
  { to: "/dashboard/map", label: "Map" },
  { to: "/dashboard/trendchart", label: "Resolution Times" },
  { to: "/dashboard/timechart", label: "Complaint Volumes" },
];

const DashboardNav = () => (
  <nav
    aria-label="Dashboard views"
    className="inline-flex mb-1 items-center gap-2 overflow-x-auto rounded-xl border border-white/50 bg-white/35 p-1.5 shadow-sm backdrop-blur-md dark:border-white/20 dark:bg-white/10 dark:shadow-black/30"
  >
    {navItems.map(({ to, label, end }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        className={({ isActive }) =>
          [
            "rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
            isActive
              ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
          ].join(" ")
        }
      >
        {label}
      </NavLink>
    ))}
  </nav>
);

export default DashboardNav;
