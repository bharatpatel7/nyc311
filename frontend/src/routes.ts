import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/landing/landing.tsx"),
  layout("routes/layout.tsx", [
    route("dashboard", "routes/dashboard/dashboard-layout.tsx", [
      index("routes/dashboard/dashboard.tsx"),
      route("city", "routes/dashboard/dashboard-city.tsx"),
      route("explorer", "routes/dashboard/dashboard-explorer.tsx"),
      route("scorecard", "routes/dashboard/dashboard-scorecard.tsx"),
      route("pulse", "routes/dashboard/dashboard-pulse.tsx"),
      route("insights", "routes/dashboard/dashboard-insights.tsx"),
    ]),
  ]),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
