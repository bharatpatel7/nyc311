export const FEATURES = [
  {
    title: "3D hotspot map",
    description:
      "Complaints stack into glowing columns over a tilted city. Hotspots jump out at a glance.",
  },
  {
    title: "Filter anything",
    description:
      "Narrow by borough, complaint type, status and date range. Every view updates together.",
  },
  {
    title: "Response times",
    description: "Compare how quickly each city agency closes the requests it receives.",
  },
  {
    title: "Trends over time",
    description:
      "Follow complaint volume day by day and spot seasonal spikes, like heat in winter.",
  },
];

export const PIPELINE = [
  { title: "NYC Open Data", description: "Public 311 service request feed" },
  { title: "Python ingestor", description: "Pulls new records on a schedule" },
  { title: "MariaDB", description: "Stores and indexes every request" },
  { title: "Spring Boot API", description: "Serves filtered points and stats" },
  { title: "React + deck.gl", description: "Renders the 3D map and charts" },
];
