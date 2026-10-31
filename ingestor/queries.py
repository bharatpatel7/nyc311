"""SQL queries for the NYC 311 ingestor."""

from constants import TABLES

UPSERT_COMPLAINT = f"""
INSERT INTO {TABLES["complaints"]} (
    unique_key,
    created_date,
    closed_date,
    complaint_type,
    borough,
    status,
    latitude,
    longitude,
    agency_id
) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE
    closed_date = IFNULL(closed_date, VALUES(closed_date)),
    status = IFNULL(status, VALUES(status)),
    agency_id = IFNULL(agency_id, VALUES(agency_id))
"""

UPSERT_AGENCY = f"""
INSERT INTO {TABLES["agencies"]} (name)
VALUES (%s)
ON DUPLICATE KEY UPDATE name = name
"""

REFRESH_INSERT = f"""
INSERT INTO {TABLES["refresh_log"]} (
    refresh_started_at,
    status
) VALUES (%s, %s)
"""

REFRESH_COMPLETE = f"""
UPDATE {TABLES["refresh_log"]}
SET refresh_completed_at = %s,
    records_processed = %s,
    status = %s
WHERE id = %s
"""

REFRESH_FAIL = f"""
UPDATE {TABLES["refresh_log"]}
SET refresh_completed_at = %s,
    status = %s
WHERE id = %s
"""
