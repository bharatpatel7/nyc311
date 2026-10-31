# How NYC311 works

NYC311 turns New York City's public 311 service-request feed into an interactive
dashboard: a 3D density map, a complaint explorer, an agency scorecard, an hourly
"city pulse", and a Power BI report.

The same code runs in two ways:

| | Local development | Live site |
|---|---|---|
| Data | Ingestor refreshes MariaDB on a schedule | Rebuilt by GitHub Actions every 8 hours |
| API | Spring Boot, called live | Saved as JSON files at build time |
| Hosting | Docker Compose on your machine | Azure Static Web Apps (Free) |
| Cost | Free | $0 |

## The pieces

```
                         ┌────────────── local (docker compose) ───────────────┐
NYC Open Data (311 API) ─┼→ ingestor (Python) → MariaDB → backend (Spring Boot) ─┼→ frontend (React)
                         └──────────────────────────────────────────────────────┘
                                                   │
          GitHub Actions, every 8 h: same chain in CI, then snapshot the API → static JSON
                                                   │
                                   Azure Static Web Apps → https://nyc311.bharat.has-a.tech

MariaDB → azure-sync → Azure SQL (star schema) → Power BI Desktop → report images on /dashboard/insights
```

| Folder | What it is |
|---|---|
| `ingestor/` | Python job that pulls requests from NYC Open Data (newest first) and upserts them into MariaDB. Loops forever locally; `RUN_ONCE=1` does one refresh and exits (used in CI). |
| `database/init.sql` | MariaDB schema: `complaints`, `agencies`, `data_refresh_log`. |
| `backend/` | Spring Boot API over MariaDB: `/api/complaints/geopoints`, `/api/stats/summary`, `/api/complaints/resolution-time`, `/api/complaints/volume-by-type`, `/api/complaints/filter-options`, `/api/refreshlogs/latest`, `/api/health`. |
| `frontend/` | React Router 7 single-page app (Vite, Tailwind 4, deck.gl + MapLibre, Recharts). |
| `analytics/` | Azure SQL star schema, the MariaDB → Azure SQL sync job, DAX measures and the Power BI notes. See [analytics/README.md](../analytics/README.md). |
| `.github/workflows/deploy.yml` | Builds the live site with fresh data and uploads it to Azure. See [DEPLOYMENT.md](DEPLOYMENT.md). |

## Where each page gets its data

All of the newer pages compute everything in the browser from a single list: every
complaint with its location, type, agency, status and created/closed timestamps
(`/api/complaints/geopoints`). `src/hooks/useComplaints.ts` loads it once per visit and
shares it, and `src/lib/complaints.ts` turns each row into a `Complaint` with its
category and hours-to-close.

| Page | Route | Data |
|---|---|---|
| Overview | `/dashboard` | `/api/stats/summary` plus the complaint list for the 3D preview |
| 3D City | `/dashboard/city` | `/api/complaints/geopoints` with the shared borough/type/status filters |
| Explorer | `/dashboard/explorer` | `useComplaints()`: one dot per complaint, filtered by category, status and time of day |
| Scorecard | `/dashboard/scorecard` | `useComplaints()`: per-agency medians, % closed within 24 h, open backlog, time-to-close buckets |
| City Pulse | `/dashboard/pulse` | `useComplaints()`: requests per hour, a typical day, types rising in the last 24 h |
| Insights | `/dashboard/insights` | Exported Power BI pages in `frontend/public/powerbi/` |

### Things worth knowing about the numbers

- **Timestamps are NYC wall-clock time.** NYC Open Data publishes local times without a
  zone. The frontend stores them as if they were UTC and always formats them with
  `timeZone: "UTC"`, so "10 AM" means 10 AM in New York for every visitor.
- **Categories** (Housing, Noise, Parking & Traffic, …) come from keyword rules shared
  with the Power BI model: `CATEGORY_KEYWORDS` in `src/lib/complaints.ts` and
  `analytics/sync/sync_to_azure_sql.py`. Change both together.
- **Time to close** only counts closed requests. The data covers roughly the last 10
  days, so requests that take longer than that are still open and not yet in the
  medians. The Scorecard says this on the page.
- **"Rising"** compares the last 24 hours with each type's daily average over the four
  days before, counted back from the newest request rather than the clock, because the
  public feed runs about a day behind.

## Static data mode

The live site has no server. Two files make that work without changing any page:

1. **`frontend/scripts/build-snapshot.mjs`** calls each API endpoint the frontend uses
   and writes the responses to `frontend/public/data/`. The complaint list is stored
   column by column with lookup tables for repeated strings (`complaints.json`), which
   shrinks about 11 MB of JSON to 2.6 MB (around 630 KB compressed).
2. **`frontend/src/lib/staticApi.ts`**: when the app is built with
   `VITE_DATA_SOURCE=static`, `root.tsx` installs a small `fetch` wrapper that answers
   `/api/...` requests from those files. Query filters the backend applies in SQL
   (borough, type, status, agency, date range) are applied in the browser with the same
   rules: case-insensitive matches, `dateTo` inclusive.

Components keep calling the same `/api` URLs either way, so local development against
the live API and the static site behave the same.

| File in `public/data/` | Saved from |
|---|---|
| `complaints.json` | `/api/complaints/geopoints` (column format) |
| `summary.json` | `/api/stats/summary` |
| `refresh.json` | `/api/refreshlogs/latest` |
| `filter-options.json` | `/api/complaints/filter-options` |
| `resolution-time.json` | `/api/complaints/resolution-time` |
| `volume-by-type.json` | `/api/complaints/volume-by-type` |
| `health.json` | `/api/health` |

`public/data/` is generated and git-ignored.

## Analytics (Azure SQL + Power BI)

`analytics/sync` copies MariaDB into a star schema in a free-offer Azure SQL Database
(`fact_complaint` plus date, borough, agency and complaint-type dimensions). The report
was built in Power BI Desktop with DAX measures (`analytics/powerbi/measures.dax`).
Since the school tenant blocks the Power BI service, the Insights page shows exported
page images with the `.pbix` and PDF as downloads. Full steps:
[analytics/README.md](../analytics/README.md).

## Running it locally

```bash
cp .env.example .env        # add your NYC Open Data API key pair and DB passwords
docker compose up -d --build
open http://localhost:3000
```

To try the static build exactly as it's deployed, with the local stack running:

```bash
cd frontend
node scripts/build-snapshot.mjs http://localhost:3000 public/data
VITE_DATA_SOURCE=static npm run build
npx serve -s build/client -l 4173      # then open http://localhost:4173
```
