import { useState, useEffect } from "react";
import { MIN_PERIODS, VOLUME_BY_TYPE_URL } from "./constants";
import type { ComplaintVolumeDto } from "./types";
import { FALLBACK_VOLUME_DATA } from "@/components/feature/TimeSeriesChart/constants";

const countDistinctPeriods = (data: ComplaintVolumeDto[]): number =>
  new Set(data.map((d) => d.period)).size;

export const useComplaintVolume = (complaintType: string | undefined) => {
  const [data, setData] = useState<ComplaintVolumeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);
      setIsFallback(false);

      try {
        const params = new URLSearchParams();
        if (complaintType) params.set("complaintType", complaintType);
        const qs = params.toString();
        const url = `${VOLUME_BY_TYPE_URL}${qs ? `?${qs}` : ""}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed: ${response.status}`);

        const json: ComplaintVolumeDto[] = await response.json();

        if (cancelled) return;

        if (countDistinctPeriods(json) < MIN_PERIODS) {
          setData(FALLBACK_VOLUME_DATA);
          setIsFallback(true);
        } else {
          setData(json);
        }
      } catch {
        if (cancelled) return;
        setData(FALLBACK_VOLUME_DATA);
        setIsFallback(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [complaintType]);

  return { data, isLoading, isError, isFallback };
};
