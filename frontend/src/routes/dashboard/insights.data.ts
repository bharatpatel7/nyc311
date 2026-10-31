export const REPORT_PAGES = [
  {
    title: "City Overview",
    src: "/powerbi/page-1.png",
    caption: "Headline KPIs, daily complaint volume and the most common complaint categories.",
  },
  {
    title: "Response Time",
    src: "/powerbi/page-2.png",
    caption:
      "How fast each agency closes requests: share closed within 24 hours, median hours by category, and volume vs speed by complaint type.",
  },
  {
    title: "When & Where",
    src: "/powerbi/page-3.png",
    caption: "An hour-by-weekday heatmap of when New Yorkers call 311, and complaints by borough.",
  },
];

export const REPORT_FILES = [
  {
    kind: "pbix",
    label: "Download .pbix",
    detail: "Open in Power BI Desktop",
    href: "/powerbi/nyc311.pbix",
  },
  {
    kind: "pdf",
    label: "Download PDF",
    detail: "All three report pages",
    href: "/powerbi/nyc311.pdf",
  },
] as const;

// figures from the report's snapshot of 54,084 complaints filed Oct 25–30, 2026
export const FINDINGS = [
  { value: "84%", text: "of closed complaints were resolved within 24 hours" },
  { value: "2.1 h", text: "median time to close a complaint" },
  { value: "29 h", text: "median for housing issues like heat and plumbing, vs 1.3 h for noise" },
  { value: "10 AM", text: "is the busiest hour for calls, with about 8× more than at 3 AM" },
];

export const PIPELINE = [
  { title: "NYC Open Data", detail: "311 API" },
  { title: "Python ingestor", detail: "MariaDB" },
  { title: "Sync job", detail: "Docker → Azure" },
  { title: "Azure SQL", detail: "Star schema" },
  { title: "Power BI Desktop", detail: "DAX + report" },
];
