import type { DataRefresh } from "@/types/logs";
import { getMockPoints } from "./util";
import type { Summary } from "@/types/api";

export const MOCK_REFRESH: DataRefresh = {
  refreshStartedAt: new Date().toISOString(),
  refreshCompletedAt: new Date().toISOString(),
  recordsProcessed: getMockPoints().length,
  status: "completed",
};

export const MOCK_SUMMARY: Summary = {
  totalComplaints: 34196,
  complaintsByBorough: [
    { borough: "BROOKLYN", count: 8432 },
    { borough: "QUEENS", count: 2891 },
    { borough: "MANHATTAN", count: 8756 },
    { borough: "BRONX", count: 5213 },
    { borough: "STATEN ISLAND", count: 8904 },
  ],
  complaintsByAgency: [
    { agency: "HPD", count: 2340 },
    { agency: "NYPD", count: 5120 },
    { agency: "DOT", count: 8450 },
    { agency: "DSNY", count: 2100 },
    { agency: "DEP", count: 8760 },
    { agency: "DOB", count: 5430 },
    { agency: "DPR", count: 2890 },
  ],
};
