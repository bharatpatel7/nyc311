import { NavLink } from "react-router";
import { FiActivity, FiBarChart, FiBox, FiClock, FiGrid, FiMapPin } from "react-icons/fi";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: FiGrid, end: true },
  { to: "/dashboard/city", label: "3D City", icon: FiBox },
  { to: "/dashboard/explorer", label: "Explorer", icon: FiMapPin },
  { to: "/dashboard/scorecard", label: "Scorecard", icon: FiClock },
  { to: "/dashboard/pulse", label: "City Pulse", icon: FiActivity },
  { to: "/dashboard/insights", label: "Insights", icon: FiBarChart },
];

const DashboardNav = () => (
  <nav
    aria-label="Dashboard views"
    className="glass flex max-w-full items-center gap-1 overflow-x-auto rounded-full p-1"
  >
    {navItems.map(({ to, label, icon: Icon, end }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        className={({ isActive }) =>
          [
            "flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
            isActive
              ? "bg-white text-ink shadow-[0_0_24px_-6px_rgba(34,211,238,0.9)]"
              : "text-slate-300 hover:bg-white/10 hover:text-white",
          ].join(" ")
        }
      >
        <Icon aria-hidden className="size-4" />
        {label}
      </NavLink>
    ))}
  </nav>
);

export default DashboardNav;
