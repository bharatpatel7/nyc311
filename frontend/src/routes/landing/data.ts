export const FEATURES = [
  {
    title: "3D hotspot map",
    description:
      "Complaints stack into glowing columns over a tilted city. Hotspots jump out at a glance.",
  },
  {
    title: "Complaint explorer",
    description:
      "Every request on one map, coloured by category. Filter by status and time of day, then click a dot for its story.",
  },
  {
    title: "Agency scorecard",
    description:
      "See how quickly each city agency closes its requests, how many are still open, and which complaint types take longest.",
  },
  {
    title: "City pulse",
    description:
      "Requests hour by hour, the busiest time of day, and the complaint types rising in the last 24 hours.",
  },
];

export const PIPELINE = [
  { title: "NYC Open Data", description: "Public 311 service request feed" },
  { title: "Python ingestor", description: "Loads the latest requests into MariaDB" },
  { title: "Spring Boot API", description: "Serves filtered points and stats" },
  { title: "GitHub Actions", description: "Snapshots fresh data every few hours" },
  { title: "Azure", description: "Static Web Apps hosting, SQL + Power BI" },
];
