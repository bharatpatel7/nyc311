"""Refresh cycle logger for the NYC 311 ingestor.

Logs the start, completion, and failure of each data refresh cycle
to the ``data_refresh_log`` table so the frontend can display data
freshness and operators can monitor pipeline health.
"""

from datetime import datetime
from enum import Enum

import pymysql
from queries import (
    REFRESH_COMPLETE,
    REFRESH_FAIL,
    REFRESH_INSERT,
)


class RefreshStatus(str, Enum):
    """Possible states for a refresh cycle."""

    IN_PROGRESS = "IN_PROGRESS"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"


class RefreshLogger:
    """Tracks a single refresh cycle in the ``data_refresh_log`` table.

    Usage::

        logger = RefreshLogger(conn)
        logger.start()
        # ... do work ...
        logger.complete(records_processed=42)
        # or on failure:
        logger.fail("something went wrong")
    """

    def __init__(self, conn: pymysql.Connection) -> None:
        self.conn = conn
        self.log_id: int | None = None

    def _execute(self, sql: str, params: tuple) -> None:
        """Run a query in its own cursor and commit."""
        with self.conn.cursor() as cursor:
            cursor.execute(sql, params)
            self.log_id = cursor.lastrowid or self.log_id
        self.conn.commit()

    def start(self) -> None:
        """Insert a new row with status ``IN_PROGRESS``."""
        self._execute(
            REFRESH_INSERT,
            (datetime.now(), RefreshStatus.IN_PROGRESS.value),
        )

    def complete(self, records_processed: int) -> None:
        """Mark the current cycle as ``SUCCESS``."""
        self._execute(
            REFRESH_COMPLETE,
            (
                datetime.now(),
                records_processed,
                RefreshStatus.SUCCESS.value,
                self.log_id,
            ),
        )

    def fail(self, error_message: str) -> None:
        """Mark the current cycle as ``FAILED``.

        The *error_message* is logged to stdout so operators
        can correlate failures with the refresh log row.
        The ``data_refresh_log`` table itself stores only
        the timestamp and status.
        """
        print(f"Refresh {self.log_id} failed: " f"{error_message}")
        self._execute(
            REFRESH_FAIL,
            (
                datetime.now(),
                RefreshStatus.FAILED.value,
                self.log_id,
            ),
        )
