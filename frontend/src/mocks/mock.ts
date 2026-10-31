import { http, HttpResponse, type JsonBodyType } from "msw";
import { server } from "./server";
import { ENDPOINTS as E } from "./constants";
import { HTTP, FIXTURES as F } from "./fixtures";
import { DEFAULT_LOADING_MS } from "./constants";
import type { DomainFixtures, HealthCheck, HttpCode } from "@/types/api";
import type { FilterOptionsResponse } from "@/types/ClusterMap";
import type { ResolutionTimeDto } from "@/types/agency";
import type { GeoPoint } from "@/types/geopoints";
import type { DataRefresh } from "@/types/logs";
import type { ComplaintVolumeDto } from "@/hooks/types";

const domainMock = <T extends JsonBodyType>(endpoint: string, fixtures: DomainFixtures<T>) => ({
  loaded: (data: T = fixtures.ok) => server.use(http.get(endpoint, () => HttpResponse.json(data))),
  empty: () => server.use(http.get(endpoint, () => HttpResponse.json(fixtures.empty))),
  loading: (ms = DEFAULT_LOADING_MS) =>
    server.use(
      http.get(endpoint, async () => {
        await new Promise((r) => setTimeout(r, ms));
        return HttpResponse.json(null);
      })
    ),
  failure: (status: HttpCode = HTTP.serverError) =>
    server.use(http.get(endpoint, () => HttpResponse.json(null, { status }))),
  offline: () => server.use(http.get(endpoint, () => HttpResponse.error())),
});

export const mock = {
  health: domainMock<HealthCheck>(E.health, F.health),
  geoPoints: domainMock<GeoPoint[]>(E.geoPoints, F.geoPoints),
  lastRefresh: domainMock<DataRefresh | null>(E.lastRefresh, F.lastRefresh),
  filterOptions: domainMock<FilterOptionsResponse>(E.filterOptions, F.filterOptions),
  resolutionTime: domainMock<ResolutionTimeDto[]>(E.resolutionTime, F.resolutionTime),
  complaintVolume: domainMock<ComplaintVolumeDto[]>(E.volumeByType, F.complaintVolume),
};
