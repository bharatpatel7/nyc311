import { useEffect, useState } from "react";
import { ENDPOINTS } from "@/lib/api.constants";
import { toComplaint, type Complaint } from "@/lib/complaints";
import type { GeoPointDto } from "@/lib/staticApi";

interface ComplaintData {
  complaints: Complaint[];
  /** newest created time in the data; "now" for anything relative, since snapshots lag */
  latest: number;
}

let request: Promise<ComplaintData> | null = null;

/** Every complaint, loaded once per page load and shared by all pages. */
const loadComplaints = () => {
  request ??= fetch(ENDPOINTS.geoPoints)
    .then((r) => {
      if (!r.ok) throw new Error(`Failed to load complaints: ${r.status}`);
      return r.json() as Promise<GeoPointDto[]>;
    })
    .then((rows) => {
      const complaints = rows.map(toComplaint).filter((c): c is Complaint => c !== null);
      const latest = complaints.reduce((max, c) => Math.max(max, c.created), 0);
      return { complaints, latest };
    })
    .catch((error) => {
      request = null;
      throw error;
    });
  return request;
};

export const useComplaints = () => {
  const [data, setData] = useState<ComplaintData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    loadComplaints()
      .then((d) => active && setData(d))
      .catch((e: Error) => active && setError(e));
    return () => {
      active = false;
    };
  }, []);

  return {
    complaints: data?.complaints ?? [],
    latest: data?.latest ?? 0,
    isLoading: !data && !error,
    error,
  };
};
