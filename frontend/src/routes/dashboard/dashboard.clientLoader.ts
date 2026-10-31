import { fetchLastRefresh } from "@/lib/api";

/**
 * Client-side data loader for the dashboard.
 * Fetches the timestamp of the last data refresh.
 */
export async function clientLoader() {
  const refresh = await fetchLastRefresh();
  return { refresh };
}
