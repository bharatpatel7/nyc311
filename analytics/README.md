# NYC 311 analytics: Azure SQL + Power BI

This folder holds the analytics side of the project: a star schema in Azure SQL
Database, a job that loads it from the app's MariaDB, and a Power BI report
built in Microsoft Fabric and embedded on the app's **Insights** page.

```
NYC Open Data → ingestor → MariaDB → azure-sync → Azure SQL (star schema)
                                                     → Fabric Lakehouse → semantic model + DAX → Power BI report → /dashboard/insights
```

| Path | What it is |
|---|---|
| `azure/provision.sh` | Creates the resource group, SQL server and free-offer database, and writes the connection details to `.env` |
| `sql/01_star_schema.sql` | Star schema: `fact_complaint` plus `dim_date`, `dim_borough`, `dim_agency`, `dim_complaint_type` |
| `sync/` | Docker job that copies MariaDB into Azure SQL (`docker compose --profile analytics run --rm azure-sync`) |
| `powerbi/measures.dax` | DAX measures for the semantic model |

## 1. Create the database

```bash
az login
./analytics/azure/provision.sh            # defaults to canadacentral
```

The database uses the **Azure SQL free offer** (100,000 vCore-seconds and 32 GB
per month) and pauses itself after an hour idle. When the monthly free amount
runs out it pauses until next month instead of billing.

## 2. Load the data

```bash
docker compose --profile analytics run --rm azure-sync
```

Rerun it whenever you want Power BI to see fresh data. The first connection can
take up to a minute while a paused database wakes up.

## 3. Build the report in Fabric (browser, no Windows needed)

1. Go to [app.fabric.microsoft.com](https://app.fabric.microsoft.com), sign in with your
   school account, and start the free Fabric trial (account menu → **Start trial**).
2. Create a workspace, for example **NYC311**.
3. **New item → Lakehouse**, name it `nyc311_lakehouse`.
4. **New item → Dataflow Gen2 → Get data → Azure SQL database.** Use the server and
   database from `.env`, authentication **Basic**, with `AZURE_SQL_USER` and
   `AZURE_SQL_PASSWORD`. Select the four `dim_*` tables and `fact_complaint`, set
   the data destination of each to `nyc311_lakehouse`, then publish. Schedule a
   daily refresh.
5. In the lakehouse, choose **New semantic model**, select the five tables, and open
   the data model. Create these relationships (many-to-one, single direction):
   - `fact_complaint[created_date_key]` → `dim_date[date_key]` (active)
   - `fact_complaint[closed_date_key]` → `dim_date[date_key]` (inactive)
   - `fact_complaint[borough_key]` → `dim_borough[borough_key]`
   - `fact_complaint[agency_key]` → `dim_agency[agency_key]`
   - `fact_complaint[complaint_type_key]` → `dim_complaint_type[complaint_type_key]`
6. Add the measures from `powerbi/measures.dax`, and format `Closure Rate`, `Closed
   Within 24h %` and `Share of Complaints` as percentages.
7. Create a report from the semantic model. A suggested layout:

   | Page | Visuals |
   |---|---|
   | **City overview** | Cards: Complaints, Closure Rate, Median Resolution Hours, Open Complaints · line chart of Complaints by `dim_date[date]` · bar chart of Complaints by `dim_complaint_type[category]` · map of `latitude`/`longitude` |
   | **Response times** | Matrix of `dim_agency[agency_code]` × `dim_complaint_type[category]` showing Median Resolution Hours with background colour scale · bar chart of Closed Within 24h % by agency · scatter of Complaints vs Median Resolution Hours by complaint type |
   | **When & where** | Matrix of `created_hour` × `dim_date[day_name]` showing Complaints, colour-scaled (a heatmap) · Complaints by borough · slicers for borough, category and date |

## 4. Put it on the Insights page

1. In the report: **File → Embed report → Publish to web (public)** and copy the
   `src` URL from the iframe code.
2. Add it to `.env` as `POWERBI_EMBED_URL=...` and restart the frontend
   (`docker compose up -d frontend`).

"Publish to web" makes the report public and can be switched off by your school's
Power BI admin. If it's unavailable, use **Embed report → Website or portal**
instead; that link works the same way but viewers have to sign in.
