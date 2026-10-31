# NYC 311 analytics: Azure SQL + Power BI

This folder holds the analytics side of the project: a star schema in Azure SQL
Database, a job that loads it from the app's MariaDB, and a Power BI report
built in Power BI Desktop and shown on the app's **Insights** page.

```
NYC Open Data → ingestor → MariaDB → azure-sync → Azure SQL (star schema)
                                                     → Power BI Desktop (model + DAX + report) → /dashboard/insights
```

| Path | What it is |
|---|---|
| `azure/provision.sh` | Creates the resource group, SQL server and free-offer database, and writes the connection details to `.env` |
| `sql/01_star_schema.sql` | Star schema: `fact_complaint` plus `dim_date`, `dim_borough`, `dim_agency`, `dim_complaint_type` |
| `sync/` | Docker job that copies MariaDB into Azure SQL (`docker compose --profile analytics run --rm azure-sync`) |
| `azure/create_vm.sh` | Optional Windows VM with Power BI Desktop, for building the report from a Mac |
| `powerbi/measures.dax` | DAX measures for the semantic model |
| `powerbi/measures-query.dax` | The same measures as one script for Power BI Desktop's DAX query view |
| `../frontend/public/powerbi/` | The finished report: `nyc311.pbix`, a PDF export and the page images used on the Insights page |

## 1. Create the database

```bash
az login
./analytics/azure/provision.sh            # defaults to canadacentral
```

On a brand-new subscription, enable the SQL service once first:
`az provider register --namespace Microsoft.Sql --wait`.

The database uses the **Azure SQL free offer** (100,000 vCore-seconds and 32 GB
per month) and pauses itself after an hour idle. When the monthly free amount
runs out it pauses until next month instead of billing.

## 2. Load the data

```bash
docker compose --profile analytics run --rm azure-sync
```

Rerun it whenever you want Power BI to see fresh data. The first connection can
take up to a minute while a paused database wakes up.

## 3. Build the report in Power BI Desktop

Power BI Desktop is free but Windows-only. On a Mac, create a VM on your Azure
credit with `./analytics/azure/create_vm.sh` (it installs Power BI Desktop, only
accepts Remote Desktop from your IP and shuts down nightly), then connect with
the Windows App using the details it prints. Run `./analytics/azure/create_vm.sh delete`
when you're done; the database is untouched.

1. **Get data → SQL Server.** Use the server and database from `.env`, **Import** mode,
   and **Database** credentials (`AZURE_SQL_USER` / `AZURE_SQL_PASSWORD`). Select the
   four `dim_*` tables and `fact_complaint`.
2. In **Model view**, create these relationships (many-to-one, single direction). Add
   the inactive one first, otherwise Power BI reports ambiguous paths:
   - `fact_complaint[created_date_key]` → `dim_date[date_key]` (active)
   - `fact_complaint[closed_date_key]` → `dim_date[date_key]` (inactive)
   - `fact_complaint[borough_key]` → `dim_borough[borough_key]`
   - `fact_complaint[agency_key]` → `dim_agency[agency_key]`
   - `fact_complaint[complaint_type_key]` → `dim_complaint_type[complaint_type_key]`
3. Open **DAX query view**, paste `powerbi/measures-query.dax`, click **Update model with
   changes**, then **Run** to check the numbers. Format `Closure Rate`, `Closed Within 24h %`
   and `Share of Complaints` as percentages.
4. Build the pages. A suggested layout:

   | Page | Visuals |
   |---|---|
   | **City overview** | Cards: Complaints, Closure Rate, Median Resolution Hours, Open Complaints · line chart of Complaints by `dim_date[date]` · bar chart of Complaints by `dim_complaint_type[category]` · map of `latitude`/`longitude` |
   | **Response times** | Matrix of `dim_agency[agency_code]` × `dim_complaint_type[category]` showing Median Resolution Hours with background colour scale · bar chart of Closed Within 24h % by agency · scatter of Complaints vs Median Resolution Hours by complaint type |
   | **When & where** | Matrix of `created_hour` × `dim_date[day_name]` showing Complaints, colour-scaled (a heatmap) · Complaints by borough · slicers for borough, category and date |

## 4. Put it on the Insights page

The Insights page shows `frontend/public/powerbi/page-*.png` with the `.pbix` and
PDF as downloads. After changing the report, save it there as `nyc311.pbix`,
export a PDF (**File → Export → Export to PDF**), and render each page to a
1920 px PNG.

If your account can publish to the Power BI service, you can embed the live report
instead: **File → Embed report → Publish to web (public)**, then set
`POWERBI_EMBED_URL=<iframe src>` in `.env` and restart the frontend
(`docker compose up -d frontend`). Many school tenants disable this.
