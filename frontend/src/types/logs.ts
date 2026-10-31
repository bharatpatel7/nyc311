export type DataRefreshStatus = "in progress" | "completed" | "failed" | null;

export interface DataRefresh {
  refreshCompletedAt: string | null;
  refreshStartedAt: string;
  recordsProcessed: number;
  status: DataRefreshStatus;
}
