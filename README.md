# NYC311

An interactive dashboard for New York City's 311 service requests: where complaints
pile up, how fast each city agency responds, and what's rising right now. The live
site rebuilds itself from NYC Open Data every 8 hours and runs on Azure at $0.

**Live:** https://nyc311.bharat.has-a.tech

## What's in it

- **3D City**: complaints stacked into extruded hexagon columns over a tilted, rotatable map of NYC, with heatmap and point modes
- **Explorer**: every request on one map, coloured by category, filtered by status and time of day, with click-for-details
- **Scorecard**: each agency's median time to close, share closed within 24 hours, open backlog and time-to-close distribution, plus the fastest and slowest complaint types
- **City Pulse**: requests per hour, a typical day, and the complaint types rising in the last 24 hours
- **Insights**: a three-page Power BI report built on an Azure SQL star schema with DAX measures

## How it's built

```
NYC Open Data → Python ingestor → MariaDB → Spring Boot API → React (deck.gl, MapLibre, Recharts)
                                     │
GitHub Actions (every 8 h): run that chain, snapshot the API to JSON → Azure Static Web Apps
                                     │
                         azure-sync → Azure SQL → Power BI
```

| Doc | What it covers |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How it works: services, where each page gets its data, the static data mode, notes on the numbers |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | How it's built and deployed: the GitHub Actions run, Azure and domain setup, secrets, staying at $0, troubleshooting |
| [analytics/README.md](analytics/README.md) | Azure SQL star schema, the sync job, and building the Power BI report |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Branching, commit conventions, code style and tests |

**Stack:** React Router 7, TypeScript, Vite, Tailwind CSS 4, deck.gl, MapLibre, Recharts ·
Spring Boot 3 (Java 21) · Python 3.12 · MariaDB 11 · Docker Compose · GitHub Actions ·
Azure Static Web Apps, Azure SQL Database · Power BI Desktop, DAX

## Run it locally

You need Docker and an NYC Open Data API key pair (free: sign in at
[data.cityofnewyork.us](https://data.cityofnewyork.us) → Developer Settings → API Keys).

```bash
git clone https://github.com/bharatpatel7/nyc311.git
cd nyc311
cp .env.example .env          # add NYC_API_KEY_ID / NYC_API_KEY_SECRET and choose DB passwords
make build                    # docker compose up --build -d
```

| Service | URL |
| :-- | :-- |
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api/health |
| Database | localhost:3306 |

The ingestor starts loading the newest requests straight away; refresh the page after
a minute. Each refresh is logged in `data_refresh_log`, which drives the "Updated …"
badge in the header.

## Useful commands

```bash
make             # list every command
make up | down   # start / stop the stack
make test        # run all test suites
make lint        # lint all services
make ci          # lint, test and style checks
```

Frontend only (from `frontend/`): `npm run dev`, `npm test`, `npm run type-check`, `npm run lint`.
