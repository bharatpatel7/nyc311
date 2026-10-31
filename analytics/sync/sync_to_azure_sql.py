"""Copy NYC 311 complaints from the app's MariaDB into the Azure SQL star schema.

Run with:  docker compose --profile analytics run --rm azure-sync

Each run rebuilds the fact table from scratch (the dataset is small) and
upserts the dimensions, all inside one transaction so Power BI never sees a
half-loaded table.
"""

import os
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import pymssql
import pymysql

SCHEMA_FILE = Path(__file__).parent / "01_star_schema.sql"

# rows per INSERT; SQL Server allows at most 2100 parameters per statement
FACT_BATCH = 140

AGENCY_NAMES = {
    "NYPD": "Police Department",
    "HPD": "Housing Preservation and Development",
    "DOT": "Department of Transportation",
    "DSNY": "Department of Sanitation",
    "DEP": "Department of Environmental Protection",
    "DOB": "Department of Buildings",
    "DPR": "Parks and Recreation",
    "DOHMH": "Health and Mental Hygiene",
    "DHS": "Homeless Services",
    "TLC": "Taxi and Limousine Commission",
    "DCWP": "Consumer and Worker Protection",
    "EDC": "Economic Development Corporation",
    "OOS": "Office of the Sheriff",
    "OTI": "Office of Technology and Innovation",
}

# first matching keyword wins; anything else is "Other"
CATEGORY_KEYWORDS = [
    ("Noise", ["noise"]),
    ("Parking & Traffic", ["parking", "driveway", "vehicle", "traffic", "taxi", "bike"]),
    (
        "Housing",
        ["heat", "plumbing", "unsanitary", "paint", "door", "water leak", "electric",
         "flooring", "appliance", "elevator", "mold", "general construction"],
    ),
    ("Sanitation", ["sanitation", "dirty", "litter", "garbage", "rodent", "dumping", "waste"]),
    ("Streets & Sidewalks", ["street", "sidewalk", "curb", "pothole", "sign", "tree"]),
    ("Water & Sewer", ["water", "sewer", "hydrant"]),
    ("Homeless & Social", ["homeless", "encampment", "panhandling"]),
]


def env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise SystemExit(f"Missing required environment variable {name}")
    return value


def category_for(complaint_type: str) -> str:
    lowered = complaint_type.lower()
    for category, keywords in CATEGORY_KEYWORDS:
        if any(k in lowered for k in keywords):
            return category
    return "Other"


def normalize_type(complaint_type: str) -> str:
    """The source mixes "PLUMBING" and "Plumbing"; title-case the all-caps ones so they merge."""
    cleaned = complaint_type.strip()
    return cleaned.title() if cleaned.isupper() else cleaned


def date_key(d: date) -> int:
    return d.year * 10000 + d.month * 100 + d.day


def read_source() -> list[dict]:
    conn = pymysql.connect(
        host=env("DB_HOST"),
        port=int(os.environ.get("DB_PORT", "3306")),
        user=env("DB_USER"),
        password=env("DB_PASSWORD"),
        database=env("DB_NAME"),
        cursorclass=pymysql.cursors.DictCursor,
    )
    with conn, conn.cursor() as cur:
        cur.execute(
            """
            SELECT c.unique_key, c.created_date, c.closed_date, c.complaint_type,
                   c.borough, c.status, c.latitude, c.longitude, a.name AS agency
            FROM complaints c
            LEFT JOIN agencies a ON a.id = c.agency_id
            """
        )
        return list(cur.fetchall())


def upsert_dimension(cur, table: str, key_col: str, natural_col: str, rows: dict) -> dict:
    """Insert missing members of a dimension and return natural value → surrogate key."""
    cur.execute(f"SELECT {natural_col} FROM dbo.{table}")
    existing = {r[0] for r in cur.fetchall()}
    for value, extra in rows.items():
        if value in existing:
            continue
        cols = [natural_col, *extra.keys()]
        placeholders = ", ".join(["%s"] * len(cols))
        cur.execute(
            f"INSERT INTO dbo.{table} ({', '.join(cols)}) VALUES ({placeholders})",
            (value, *extra.values()),
        )
    cur.execute(f"SELECT {natural_col}, {key_col} FROM dbo.{table}")
    return {r[0]: r[1] for r in cur.fetchall()}


def fill_dates(cur, first: date, last: date) -> None:
    cur.execute("SELECT date_key FROM dbo.dim_date")
    existing = {r[0] for r in cur.fetchall()}
    d = first
    while d <= last:
        if date_key(d) not in existing:
            cur.execute(
                "INSERT INTO dbo.dim_date VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (
                    date_key(d), d, d.year, d.month, d.strftime("%B"), d.day,
                    d.isoweekday(), d.strftime("%A"), int(d.isoweekday() >= 6),
                ),
            )
        d += timedelta(days=1)


def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def main() -> None:
    rows = read_source()
    for r in rows:
        r["complaint_type"] = normalize_type(r["complaint_type"])
    print(f"Read {len(rows):,} complaints from MariaDB")
    if not rows:
        raise SystemExit("Nothing to load; run the ingestor first")

    conn = pymssql.connect(
        server=env("AZURE_SQL_SERVER"),
        user=env("AZURE_SQL_USER"),
        password=env("AZURE_SQL_PASSWORD"),
        database=env("AZURE_SQL_DATABASE"),
        login_timeout=120,  # serverless databases take a moment to wake up
        timeout=600,
        autocommit=False,
    )
    with conn:
        cur = conn.cursor()
        started = utc_now()

        for statement in SCHEMA_FILE.read_text().split(";"):
            if statement.strip():
                cur.execute(statement)
        conn.commit()

        boroughs = upsert_dimension(
            cur, "dim_borough", "borough_key", "borough_name",
            {r["borough"]: {} for r in rows},
        )
        agencies = upsert_dimension(
            cur, "dim_agency", "agency_key", "agency_code",
            {r["agency"]: {"agency_name": AGENCY_NAMES.get(r["agency"], r["agency"])}
             for r in rows if r["agency"]},
        )
        types = upsert_dimension(
            cur, "dim_complaint_type", "complaint_type_key", "complaint_type",
            {r["complaint_type"]: {"category": category_for(r["complaint_type"])} for r in rows},
        )
        all_dates = [r["created_date"].date() for r in rows] + [
            r["closed_date"].date() for r in rows if r["closed_date"]
        ]
        fill_dates(cur, min(all_dates), max(all_dates))

        cur.execute("DELETE FROM dbo.fact_complaint")
        facts = []
        for r in rows:
            closed = r["closed_date"]
            # the source has a few closed dates before the created date; treat those as unknown
            hours = None
            if closed and closed >= r["created_date"]:
                hours = round((closed - r["created_date"]).total_seconds() / 3600, 2)
            facts.append((
                r["unique_key"],
                date_key(r["created_date"].date()),
                date_key(closed.date()) if closed else None,
                boroughs[r["borough"]],
                agencies.get(r["agency"]),
                types[r["complaint_type"]],
                r["created_date"],
                closed,
                r["created_date"].hour,
                r["status"],
                int(closed is not None),
                hours,
                r["latitude"],
                r["longitude"],
            ))

        row_sql = "(" + ", ".join(["%s"] * 14) + ")"
        for i in range(0, len(facts), FACT_BATCH):
            batch = facts[i : i + FACT_BATCH]
            cur.execute(
                "INSERT INTO dbo.fact_complaint VALUES " + ", ".join([row_sql] * len(batch)),
                tuple(v for row in batch for v in row),
            )

        cur.execute(
            "INSERT INTO dbo.etl_run_log (started_at, finished_at, rows_loaded, status) "
            "VALUES (%s, %s, %s, 'SUCCESS')",
            (started, utc_now(), len(facts)),
        )
        conn.commit()
    print(f"Loaded {len(facts):,} complaints into Azure SQL")


if __name__ == "__main__":
    main()
