import { http, HttpResponse } from "msw";
import { ENDPOINTS as E } from "./constants";
import { FIXTURES as F } from "./fixtures";

export const handlers = [
  http.get(E.health, () => HttpResponse.json(F.health.ok)),
  http.get(E.geoPoints, () => HttpResponse.json(F.geoPoints.ok)),
  http.get(E.lastRefresh, () => HttpResponse.json(F.lastRefresh.ok)),
  http.get(E.filterOptions, () => HttpResponse.json(F.filterOptions.ok)),
  http.get(E.resolutionTime, () => HttpResponse.json(F.resolutionTime.ok)),
  http.get(E.volumeByType, () => HttpResponse.json(F.complaintVolume.ok)),
];
