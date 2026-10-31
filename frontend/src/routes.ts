import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/landing/landing.tsx"),
  layout("routes/layout.tsx", [
    route("dashboard", "routes/dashboard/dashboard-layout.tsx", [
      index("routes/dashboard/dashboard.tsx"),
      route("map", "routes/dashboard/dashboard-map.tsx"),
      route("trendchart", "routes/dashboard/dashboard-trendchart.tsx"),
      route("timechart", "routes/dashboard/dashboard-timechart.tsx"),
    ]),
  ]),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
