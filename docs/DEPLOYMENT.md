# Building and deploying NYC311

The live site is a static build on **Azure Static Web Apps (Free)**, refreshed by
**GitHub Actions** every 8 hours. It costs $0 and has no server to keep running.
For what each part does, see [ARCHITECTURE.md](ARCHITECTURE.md).

- Live: https://nyc311.bharat.has-a.tech (Azure's own address: https://mango-bush-01127470f.1.azurestaticapps.net)
- Workflow: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)
- Azure resources: resource group `nyc311-rg` (Canada Central), Static Web App `nyc311`
  (Free; app region East US 2, content served worldwide)

## What a deploy run does

Triggered every 8 hours, on pushes to `main` that touch the app, or by hand
(**Actions → Build and deploy → Run workflow**).

1. Starts an empty MariaDB 11 as a service container and creates the schema from `database/init.sql`.
2. Runs the ingestor once (`RUN_ONCE=1`, pages of 10,000) to load the newest ~100,000
   requests, about 10 days, from NYC Open Data using the `NYC_API_KEY_ID` /
   `NYC_API_KEY_SECRET` secrets.
3. Builds the Spring Boot API (`./gradlew bootJar`) and starts it against that database
   with the `prod` profile, which checks the schema matches the entities.
4. `node scripts/build-snapshot.mjs http://localhost:8080 public/data` saves every API
   response the frontend needs as JSON.
5. `VITE_DATA_SOURCE=static npm run build` builds the frontend so it reads those files
   instead of calling an API.
6. Uploads `frontend/build/client` to the Static Web App with the
   `AZURE_STATIC_WEB_APPS_API_TOKEN` secret.

A run takes about 8–10 minutes. If any step fails, nothing is uploaded and the
previous version stays live. The snapshot script refuses to publish an empty data set.

## One-time setup

Already done for this repo; listed so it can be rebuilt from scratch.

### 1. Static Web App

```bash
az login
az staticwebapp create -n nyc311 -g nyc311-rg -l eastus2 --sku Free
az staticwebapp show -n nyc311 -g nyc311-rg --query defaultHostname -o tsv
```

The app isn't linked to GitHub through Azure. The workflow uploads with a deployment token instead.

### 2. GitHub secrets

| Secret | Where it comes from |
|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | `az staticwebapp secrets list -n nyc311 -g nyc311-rg --query properties.apiKey -o tsv` |
| `NYC_API_KEY_ID` | NYC Open Data → your profile → Developer Settings → API Keys |
| `NYC_API_KEY_SECRET` | Same place, shown once when the key is created |

Set them without the values ever appearing on screen:

```bash
az staticwebapp secrets list -n nyc311 -g nyc311-rg --query properties.apiKey -o tsv \
  | gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN -R bharatpatel7/nyc311
gh secret set NYC_API_KEY_ID -R bharatpatel7/nyc311        # paste when prompted
gh secret set NYC_API_KEY_SECRET -R bharatpatel7/nyc311    # paste when prompted
```

### 3. Custom domain (has-a.tech)

1. Add `domains/nyc311.bharat.json` to [has-a-tech/register](https://github.com/has-a-tech/register):
   ```json
   {
     "description": "NYC 311 complaint explorer, hosted on Azure Static Web Apps.",
     "owner": { "username": "bharatpatel7" },
     "records": { "CNAME": "mango-bush-01127470f.1.azurestaticapps.net" }
   }
   ```
   It's nested under `bharat` because has-a.tech allows one top-level name per person.
   Leave `proxied` out: Azure has to see the CNAME directly to verify the domain and
   issue the certificate.
2. Once the PR is merged and the record is live (`dig +short nyc311.bharat.has-a.tech CNAME`):
   ```bash
   az staticwebapp hostname set -n nyc311 -g nyc311-rg --hostname nyc311.bharat.has-a.tech
   ```
   Azure validates the CNAME and adds a free, auto-renewing HTTPS certificate. This can
   take up to an hour.

## Everyday tasks

| Task | How |
|---|---|
| Refresh the data now | Actions → Build and deploy → Run workflow, or `gh workflow run deploy.yml` |
| Deploy a code change | Push to `main`; the workflow runs if `frontend/`, `backend/`, `ingestor/` or `database/` changed |
| Change how often it refreshes | Edit the `cron` line in `deploy.yml` (times are UTC) |
| Rotate the NYC API key | Create a new key pair on NYC Open Data, update both `NYC_API_KEY_*` secrets and your local `.env`, delete the old key |
| Rotate the deploy token | `az staticwebapp secrets reset-api-key -n nyc311 -g nyc311-rg`, then set the secret again |
| Update the Power BI pages | See "Put it on the Insights page" in [analytics/README.md](../analytics/README.md) |
| Refresh Azure SQL for Power BI | Locally: `docker compose --profile analytics run --rm azure-sync` |

## Staying at $0

| Service | Free allowance | This project's use |
|---|---|---|
| Azure Static Web Apps, Free plan | 100 GB bandwidth/month, 250 MB per app, custom domains + HTTPS | ~6 MB site; a visit downloads ~1.5 MB |
| GitHub Actions, private repo | 2,000 minutes/month | 3 runs/day × ~10 min ≈ 900 min/month, plus pushes |
| Azure SQL Database, free offer | 100,000 vCore-seconds + 32 GB per month; pauses instead of billing when used up | Only touched by manual syncs for Power BI |
| has-a.tech | Free student subdomain | `nyc311.bharat` |

If the repo becomes public, GitHub Actions minutes become unlimited and the schedule
could run more often. Nothing here has a paid tier switched on. The Static Web App
stays on Free unless someone changes it to Standard on purpose.

## Troubleshooting

- **The ingest step fails with 401/403:** the NYC API key secrets are missing or were rotated. Update them.
- **"The backend returned no complaints":** NYC Open Data returned nothing (outage or bad key). The site keeps the previous build. Re-run later.
- **The API step times out:** open the step log. It prints `api.log`, usually showing a schema mismatch after a change to `database/init.sql` or the entities.
- **Deploy fails with "deployment token":** reset the token (see the table above) and update the secret.
- **Pages show "Demo data" or blank charts:** the browser couldn't load `/data/*.json`. Check the files exist in the build (`frontend/build/client/data`).
- **Deep links 404:** `frontend/public/staticwebapp.config.json` rewrites unknown paths to `index.html`. Make sure it's still in `public/`.
