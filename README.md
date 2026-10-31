# 311 Complaint Patterns and Response Times

An interactive map-based dashboard for NYC 311 complaint data, highlighting trends, resolution times, and service hotspots. It enables users to explore patterns and identify areas requiring attention.

## Features

- **3D city view**: complaints stack into extruded hexagon columns over a tilted, rotatable map of NYC (deck.gl + MapLibre), with heatmap and point modes
- **Glass-style dark UI**: animated landing page, KPI overview, and dashboard views built with React, Tailwind CSS and Recharts
- **Cluster map**: clustered markers across NYC with zoom, pan, and popup details
- **Complaint filtering**: filter by borough, complaint type, status, and date range; every view shares the same filters
- **Resolution times and volume trends**: compare agency response times and complaint volume over time
- **Auto-refresh**: data reloads on a configurable interval with a "Last updated" indicator

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/)
- [NYC Open Data API Token](https://data.cityofnewyork.us)
- [CONTRIBUTING.md](CONTRIBUTING.md) for branching strategy, commit conventions, code style, and testing guidelines

## Quick Start

1. Clone the repository

```bash
git clone https://github.com/bharatpatel7/nyc311.git
cd nyc311
```

2. Create your environment file

```bash
cp .env.example .env
```

3. Create API token: [NYC Open DataAPI Token](https://data.cityofnewyork.us)

4. Update `.env` to include the API token and database credentials.

Example:

```bash
NYC_APP_TOKEN=see_prerequisites

BATCH_SIZE=100
BATCH_DELAY_SECONDS=14400
REFRESH_INTERVAL_SECONDS=86400

DB_HOST=db
DB_PORT=3306
DB_NAME=devdb
DB_USER=dev
DB_PASSWORD=dev
DB_ROOT_PASSWORD=root
```

5. Build and start all services

```bash
make build
```

## Services

| Service  | URL                   |
| :------- | :-------------------- |
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:8080 |
| Ingestor | http://localhost:8001 |
| Database | localhost:3306        |

## Refresh Logger

The ingestor tracks each data refresh cycle in the `data_refresh_log` table. A `RefreshLogger` is initialized with the database connection at the start of each cycle, recording an `IN_PROGRESS` status. On success it writes `SUCCESS` with the total record count; on failure it writes `FAILED` and re-raises the exception. The frontend queries this table to display a "Last updated: X min ago" indicator.

## Useful Commands

```bash
make             # displays full list of available commands

make build       # docker compose up --build -d
make up          # docker compose up -d
make down        # docker compose down

make test        # run all tests
make lint        # lint all services
make ci          # run complete pipeline (lint/test/style)
```
