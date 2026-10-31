/**
 * Static data mode (VITE_DATA_SOURCE=static): the deployed site has no backend, so this
 * answers the app's `/api/...` requests from JSON files in `/data`, written by
 * `scripts/build-snapshot.mjs`. Components keep calling the same endpoints either way.
 *
 * Filters the backend applies in SQL (geopoints, resolution-time, volume-by-type query
 * parameters) are applied here in the browser with the same rules.
 */

export const IS_STATIC_DATA = import.meta.env.VITE_DATA_SOURCE === "static";

const DATA_URL = `${import.meta.env.BASE_URL}data`;

/** Saved responses for endpoints that take no parameters, or whose parameters are applied below. */
const FILES: Record<string, string> = {
  "/api/health": "health.json",
  "/api/stats/summary": "summary.json",
  "/api/refreshlogs/latest": "refresh.json",
  "/api/complaints/filter-options": "filter-options.json",
  "/api/complaints/resolution-time": "resolution-time.json",
  "/api/complaints/volume-by-type": "volume-by-type.json",
};

/** complaints.json: the geopoints list stored column by column, strings replaced by lookup indexes. */
interface ComplaintColumns {
  version: 1;
  base: string;
  dicts: { type: string[]; borough: string[]; status: string[]; agency: string[] };
  key: string[];
  lat: number[];
  lng: number[];
  created: number[];
  closed: (number | null)[];
  type: number[];
  borough: number[];
  status: number[];
  agency: number[];
}

/** One complaint in the shape `/api/complaints/geopoints` returns. */
export interface GeoPointDto {
  uniqueKey: string;
  latitude: number;
  longitude: number;
  complaintType: string;
  borough: string;
  createdDate: string;
  status: string;
  agencyName: string | null;
  createdAt: string;
  closedAt: string | null;
}

/** Add whole minutes to a "YYYY-MM-DDTHH:mm:ss" local timestamp without involving time zones. */
const addMinutes = (base: string, minutes: number) =>
  new Date(Date.parse(base + "Z") + minutes * 60000).toISOString().slice(0, 19);

export const decodeComplaints = (c: ComplaintColumns): GeoPointDto[] =>
  c.key.map((uniqueKey, i) => {
    const createdAt = addMinutes(c.base, c.created[i]);
    const closed = c.closed[i];
    return {
      uniqueKey,
      latitude: c.lat[i],
      longitude: c.lng[i],
      complaintType: c.dicts.type[c.type[i]],
      borough: c.dicts.borough[c.borough[i]],
      createdDate: createdAt.slice(0, 10),
      status: c.dicts.status[c.status[i]],
      agencyName: c.dicts.agency[c.agency[i]] || null,
      createdAt,
      closedAt: closed === null ? null : addMinutes(c.base, closed),
    };
  });

const cache = new Map<string, Promise<unknown>>();

/** Fetch a data file once per page load; later calls share the same promise. */
const load = <T>(file: string, realFetch: typeof fetch): Promise<T> => {
  if (!cache.has(file)) {
    const promise = realFetch(`${DATA_URL}/${file}`).then((r) => {
      if (!r.ok) throw new Error(`Missing data file ${file}: ${r.status}`);
      return r.json();
    });
    promise.catch(() => cache.delete(file));
    cache.set(file, promise);
  }
  return cache.get(file) as Promise<T>;
};

const loadComplaints = (realFetch: typeof fetch) =>
  load<ComplaintColumns>("complaints.json", realFetch).then((columns) => {
    if (!cache.has("decoded")) cache.set("decoded", Promise.resolve(decodeComplaints(columns)));
    return cache.get("decoded") as Promise<GeoPointDto[]>;
  });

/** MariaDB's default collation compares strings case-insensitively; match that. */
const same = (a: string | null | undefined, b: string) =>
  (a ?? "").toLowerCase() === b.toLowerCase();

const nextDay = (date: string) => {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

/** Same rules as GeoController + ComplaintSpecification. */
const filterGeoPoints = (points: GeoPointDto[], q: URLSearchParams) => {
  const type = q.get("complaintType");
  const borough = q.get("borough");
  const status = q.get("status");
  const agency = q.get("agency");
  const from = q.get("dateFrom");
  const to = q.get("dateTo");
  const toExclusive = to ? nextDay(to) : null;
  return points.filter(
    (p) =>
      (!type || same(p.complaintType, type)) &&
      (!borough || same(p.borough, borough)) &&
      (!status || same(p.status, status)) &&
      (!agency || same(p.agencyName, agency)) &&
      (!from || p.createdDate >= from) &&
      (!toExclusive || p.createdDate < toExclusive)
  );
};

/** The response body for a static `/api` request, or undefined if there is no such endpoint. */
export const resolveStatic = async (url: URL, realFetch: typeof fetch): Promise<unknown> => {
  const q = url.searchParams;

  if (url.pathname === "/api/complaints/geopoints") {
    const points = filterGeoPoints(await loadComplaints(realFetch), q);
    const limit = Number(q.get("limit"));
    return limit > 0 ? points.slice(0, limit) : points;
  }

  const file = FILES[url.pathname];
  if (!file) return undefined;
  const body = await load<unknown>(file, realFetch);

  if (url.pathname === "/api/complaints/resolution-time" && q.get("agency")) {
    return (body as { agency: string }[]).filter((r) => same(r.agency, q.get("agency")!));
  }
  if (url.pathname === "/api/complaints/volume-by-type" && q.get("complaintType")) {
    return (body as { complaintType: string }[]).filter((r) =>
      same(r.complaintType, q.get("complaintType")!)
    );
  }
  return body;
};

/** Route same-origin `/api/...` fetches to the static files. Call once, in the browser. */
export const installStaticApi = () => {
  const realFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const href = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin || !url.pathname.startsWith("/api/")) {
      return realFetch(input, init);
    }

    const signal = init?.signal ?? (input instanceof Request ? input.signal : undefined);
    signal?.throwIfAborted();
    try {
      const body = await resolveStatic(url, realFetch);
      signal?.throwIfAborted();
      return body === undefined
        ? new Response(null, { status: 404 })
        : Response.json(body, { headers: { "x-data-source": "static" } });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      return new Response(null, { status: 503 });
    }
  };
};
