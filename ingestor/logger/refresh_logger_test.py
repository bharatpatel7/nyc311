from unittest.mock import MagicMock
from constants import TABLES
from logger import (
    RefreshLogger,
    RefreshStatus,
)


def _make_logger(cursor):
    """Create a RefreshLogger with a mock connection.

    Returns:
        A tuple of (logger, conn) so tests can assert on
        the mock connection directly.
    """
    cursor.__enter__ = MagicMock(return_value=cursor)
    cursor.__exit__ = MagicMock(return_value=False)

    conn = MagicMock()
    conn.cursor.return_value = cursor

    return RefreshLogger(conn), conn


class TestRefreshLoggerStart:
    def test_inserts_in_progress_status(self):
        cursor = MagicMock()
        cursor.lastrowid = 1
        logger, _ = _make_logger(cursor)

        logger.start()

        cursor.execute.assert_called_once()
        sql, params = cursor.execute.call_args.args
        assert f"INSERT INTO {TABLES['refresh_log']}" in sql
        assert params[1] == RefreshStatus.IN_PROGRESS.value

    def test_stores_log_id(self):
        cursor = MagicMock()
        cursor.lastrowid = 42
        logger, _ = _make_logger(cursor)

        logger.start()

        assert logger.log_id == 42

    def test_commits(self):
        cursor = MagicMock()
        cursor.lastrowid = 1
        logger, conn = _make_logger(cursor)

        logger.start()

        conn.commit.assert_called_once()


class TestRefreshLoggerComplete:
    def test_updates_success_status(self):
        cursor = MagicMock()
        cursor.lastrowid = 1
        logger, _ = _make_logger(cursor)
        logger.start()
        cursor.reset_mock()

        logger.complete(records_processed=100)

        cursor.execute.assert_called_once()
        sql, params = cursor.execute.call_args.args
        assert f"UPDATE {TABLES['refresh_log']}" in sql
        assert params[1] == 100
        assert params[2] == RefreshStatus.SUCCESS.value
        assert params[3] == 1

    def test_sets_refresh_completed_at(self):
        cursor = MagicMock()
        cursor.lastrowid = 1
        logger, _ = _make_logger(cursor)
        logger.start()
        cursor.reset_mock()

        logger.complete(records_processed=0)

        _, params = cursor.execute.call_args.args
        assert params[0] is not None


class TestRefreshLoggerFail:
    def test_updates_failed_status(self):
        cursor = MagicMock()
        cursor.lastrowid = 1
        logger, _ = _make_logger(cursor)
        logger.start()
        cursor.reset_mock()

        logger.fail("connection timed out")

        cursor.execute.assert_called_once()
        sql, params = cursor.execute.call_args.args
        assert f"UPDATE {TABLES['refresh_log']}" in sql
        assert params[1] == RefreshStatus.FAILED.value
        assert params[2] == 1

    def test_sets_refresh_completed_at(self):
        cursor = MagicMock()
        cursor.lastrowid = 1
        logger, _ = _make_logger(cursor)
        logger.start()
        cursor.reset_mock()

        logger.fail("boom")

        _, params = cursor.execute.call_args.args
        assert params[0] is not None
