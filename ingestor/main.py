"""NYC 311 complaint data ingestor.

Fetches complaint records from the NYC Open Data API in batches,
validates and parses each record, then upserts them into a database.
"""

import os
import time
from dataclasses import dataclass
from typing import Optional, cast
from datetime import datetime
import pymysql
import requests
from constants import (
    APP_TOKEN,
    BATCH_SIZE,
    HTTP,
    MAX_RETRIES,
    MAX_TIMEOUT,
    NYC_LAT_MAX,
    NYC_LAT_MIN,
    NYC_LNG_MAX,
    NYC_LNG_MIN,
    RETRY_CODES,
    NYC_OPEN_DATA,
    RETRY_DELAY,
    BATCH_DELAY_SECONDS,
    REFRESH_INTERVAL_SECONDS,
    MAX_RECORDS,
    TABLES,
)
from logger import RefreshLogger
from queries import UPSERT_COMPLAINT, UPSERT_AGENCY


def fetch(page: int = 1, page_size: int = BATCH_SIZE) -> list[dict]:
    """Fetch a page of complaint records from the NYC Open Data API.

    Args:
        page: page number to retrieve (defaults to ``1``)
        page_size: number of records per page (defaults to ``BATCH_SIZE``)

    Returns:
        A list of complaint record dicts from the API response.

    Raises:
        RuntimeError: If the request fails after ``MAX_RETRIES`` attempts.
    """
    print(f"Fetching complaint data: {page_size} complaints from page {page}")
    headers = {"Accept": "application/json", "X-App-Token": APP_TOKEN}
    data = {
        "query": "SELECT *",
        "page": {"pageNumber": page, "pageSize": page_size},
        "includeSynthetic": False,
    }

    for attempt in range(MAX_RETRIES):
        delay_time = RETRY_DELAY * (attempt + 1)
        try:
            response = requests.post(
                NYC_OPEN_DATA["complaints"],
                headers=headers,
                json=data,
                timeout=MAX_TIMEOUT,
            )

            print(f"API responded {response.status_code}")

            if response.status_code == HTTP["ok"]["code"]:
                return response.json()

            if response.status_code in RETRY_CODES:
                print(f"Retrying in {delay_time}s")
                time.sleep(delay_time)
                continue

            response.raise_for_status()
        except requests.exceptions.Timeout:
            print(f"Response timed out. Retrying in {delay_time}s")
            time.sleep(delay_time)

    raise RuntimeError(f"Max retries exceeded for {NYC_OPEN_DATA['complaints']}")


def connection() -> pymysql.connect:
    """Create and return a new database connection.

    Connection parameters are read from environment variables:
    ``DB_HOST``, ``DB_USER``, ``DB_PASSWORD``, ``DB_NAME``, ``DB_PORT``.

    Returns:
        A pymysql connection object to the database.

    Raises:
        RuntimeError: If any required environment variable is missing.
    """
    print("Opening DB connection")
    host = os.getenv("DB_HOST")
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    database = os.getenv("DB_NAME")
    port = os.getenv("DB_PORT")

    if None in (host, user, password, database, port):
        raise RuntimeError("DB connection parameters must be specified")

    return pymysql.connect(
        host=host,
        user=user,
        password=cast(str, password),
        database=database,
        port=int(cast(str, port)),
    )


@dataclass
class Complaint:
    """Parsed representation of a single complaint record."""

    unique_key: str
    created_date: Optional[datetime]
    closed_date: Optional[datetime]
    complaint_type: str
    borough: str
    status: str
    latitude: Optional[float]
    longitude: Optional[float]
    agency: Optional[str]


def parse_datetime(val: str | None) -> Optional[datetime]:
    """Parse an datetime string from the API response into a ``datetime`` object.

    Args:
        val: A datetime string from the API or None.

    Returns:
        The parsed ``datetime``, or None if val is None.
    """
    if not val:
        return None
    return datetime.strptime(val, "%Y-%m-%dT%H:%M:%S.%f")


def is_valid_coordinates(record: dict) -> bool:
    """Check whether a record's coordinates fall within the NYC boundaries.

    Args:
        record: A raw complaint dict.

    Returns:
        True if both coordinates are present, numeric, and within
        the NYC boundaries; False otherwise.
    """
    try:
        latitude = record.get("latitude")
        longitude = record.get("longitude")

        if not latitude or not longitude:
            return False

        return (NYC_LAT_MIN <= float(latitude) <= NYC_LAT_MAX) and (
            NYC_LNG_MIN <= float(longitude) <= NYC_LNG_MAX
        )
    except ValueError:
        return False


def parse_record(record: dict) -> Optional[Complaint]:
    """Validate and convert a raw API record into a ``Complaint``.

    Records with missing or out-of-range coordinates are rejected.

    Args:
        record: A raw complaint dict from the API.

    Returns:
        A ``Complaint`` instance, or ``None`` if the record is invalid.
    """
    if not is_valid_coordinates(record):
        return None

    return Complaint(
        unique_key=record["unique_key"],
        created_date=parse_datetime(record.get("created_date")),
        closed_date=parse_datetime(record.get("closed_date")),
        complaint_type=record["complaint_type"],
        borough=record["borough"],
        status=record["status"],
        latitude=float(record["latitude"]),
        longitude=float(record["longitude"]),
        agency=record.get("agency"),
    )


def upsert(cursor: pymysql.cursors.Cursor, data: list[dict]) -> int:
    """Parse, validate, and upsert a batch of complaint records.

    Args:
        cursor: An open ``pymysql`` cursor.
        data: A list of raw complaint dicts from the API.

    Returns:
        The number of valid records that were upserted.
    """
    records = [parse_record(x) for x in data]
    sql_data = []
    for r in records:
        if r is None:
            continue
        agency_id = upsert_agency(cursor, r.agency)
        sql_data.append(
            (
                r.unique_key,
                r.created_date,
                r.closed_date,
                r.complaint_type,
                r.borough,
                r.status,
                r.latitude,
                r.longitude,
                agency_id,
            )
        )

    if not sql_data:
        print("No valid records to upsert")
        return 0

    cursor.executemany(UPSERT_COMPLAINT, sql_data)
    print(
        f"Upserted {len(sql_data)} records ({len(data) - len(sql_data)} filtered out)"
    )
    return len(sql_data)


def upsert_agency(cursor: pymysql.cursors.Cursor, agency_name: str) -> Optional[int]:
    """Upsert an agency by name and return its id.

    Args:
        cursor: An open pymysql cursor.
        agency_name: The agency name to upsert.

    Returns:
        The agency id, or None if agency_name is None.
    """
    if not agency_name:
        return None

    cursor.execute(UPSERT_AGENCY, (agency_name,))
    cursor.execute(
        f"SELECT id FROM {TABLES['agencies']} WHERE name = %s", (agency_name,)
    )
    row = cursor.fetchone()
    return row[0] if row else None


def run():
    while True:
        page = 1
        total_records = 0
        logger = None

        try:
            with connection() as c:
                logger = RefreshLogger(c)
                logger.start()

                while True:
                    data = fetch(page=page)

                    with c.cursor() as cursor:
                        records_upserted = upsert(cursor, data)
                    c.commit()

                    total_records += records_upserted

                    if len(data) < BATCH_SIZE or total_records > MAX_RECORDS:
                        break

                    page += 1
                    time.sleep(BATCH_DELAY_SECONDS)

                logger.complete(total_records)
        except Exception as e:
            error_message = str(e)
            print(f"Refresh cycle failed: {error_message}")
            if logger:
                try:
                    with connection() as fail_conn:
                        logger.conn = fail_conn
                        logger.fail(error_message)
                except Exception as log_err:
                    print(f"Failed to log failure: {log_err}")

        print(f"Sleeping for {REFRESH_INTERVAL_SECONDS}s")
        time.sleep(REFRESH_INTERVAL_SECONDS)


if __name__ == "__main__":
    print("INGESTOR UP")
    run()
