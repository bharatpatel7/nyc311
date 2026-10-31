// Freeze the backend API into static JSON files for the static (no server) build.
//
//   node scripts/build-snapshot.mjs [apiBase] [outDir]
//   node scripts/build-snapshot.mjs http://localhost:8080 public/data
//
// Each /api endpoint the frontend calls is saved as-is, except the complaint list,
// which is stored column by column (complaints.json) to keep the download small.
// src/lib/staticApi.ts answers the same /api requests from these files in the browser.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const apiBase = (process.argv[2] ?? "http://localhost:8080").replace(/\/$/, "");
const outDir = path.resolve(process.argv[3] ?? "public/data");

const FILES = {
  "health.json": "/api/health",
  "summary.json": "/api/stats/summary",
  "refresh.json": "/api/refreshlogs/latest",
  "filter-options.json": "/api/complaints/filter-options",
  "resolution-time.json": "/api/complaints/resolution-time",
  "volume-by-type.json": "/api/complaints/volume-by-type",
};

const get = async (endpoint) => {
  const response = await fetch(apiBase + endpoint);
  if (!response.ok) throw new Error(`${endpoint} returned ${response.status}`);
  return response.json();
};

/** Minutes between two "YYYY-MM-DDTHH:mm:ss" local timestamps, compared as if UTC. */
const minutesFrom = (base, iso) =>
  Math.round((Date.parse(iso + "Z") - Date.parse(base + "Z")) / 60000);

/** Turn the geopoints list into columns with lookup tables for repeated strings. */
const toColumns = (points) => {
  const dicts = { type: [], borough: [], status: [], agency: [] };
  const index = { type: new Map(), borough: new Map(), status: new Map(), agency: new Map() };
  const code = (field, value) => {
    const v = value ?? "";
    if (!index[field].has(v)) {
      index[field].set(v, dicts[field].length);
      dicts[field].push(v);
    }
    return index[field].get(v);
  };

  const withTimes = points.filter((p) => p.createdAt);
  const base = withTimes.reduce(
    (min, p) => (p.createdAt < min ? p.createdAt : min),
    withTimes[0]?.createdAt ?? "1970-01-01T00:00:00"
  );
  const round = (n) => Math.round(n * 1e5) / 1e5;

  return {
    version: 1,
    base,
    dicts,
    key: withTimes.map((p) => p.uniqueKey),
    lat: withTimes.map((p) => round(p.latitude)),
    lng: withTimes.map((p) => round(p.longitude)),
    created: withTimes.map((p) => minutesFrom(base, p.createdAt)),
    closed: withTimes.map((p) => (p.closedAt ? minutesFrom(base, p.closedAt) : null)),
    type: withTimes.map((p) => code("type", p.complaintType)),
    borough: withTimes.map((p) => code("borough", p.borough)),
    status: withTimes.map((p) => code("status", p.status)),
    agency: withTimes.map((p) => code("agency", p.agencyName)),
  };
};

await mkdir(outDir, { recursive: true });

for (const [file, endpoint] of Object.entries(FILES)) {
  await writeFile(path.join(outDir, file), JSON.stringify(await get(endpoint)));
  console.log(`${file} ← ${endpoint}`);
}

const points = await get("/api/complaints/geopoints");
if (points.length === 0)
  throw new Error("The backend returned no complaints; refusing to publish an empty snapshot");
const columns = toColumns(points);
await writeFile(path.join(outDir, "complaints.json"), JSON.stringify(columns));
console.log(`complaints.json ← /api/complaints/geopoints (${columns.key.length} complaints)`);
