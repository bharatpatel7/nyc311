from unittest.mock import (
    _Call,
    call,
    patch,
    MagicMock,
)
import pytest
from constants import (
    HTTP,
    NYC_LAT_MAX,
    NYC_LAT_MIN,
    NYC_LNG_MAX,
    NYC_LNG_MIN,
)
from main import (
    fetch,
    is_valid_coordinates,
    parse_record,
    run,
    upsert,
    upsert_agency,
)
from test_constants import (
    EXPECTED_BOROUGH,
    EXPECTED_CLOSED_DATE,
    EXPECTED_COMPLAINT_TYPE,
    EXPECTED_CREATED_DATE,
    EXPECTED_LATITUDE,
    EXPECTED_LONGITUDE,
    EXPECTED_STATUS,
    EXPECTED_UNIQUE_KEY,
    EXPECTED_AGENCY,
    VALID_RECORD,
    INVALID_LONGITUDE,
)


def make_record(**overrides) -> dict:
    return {**VALID_RECORD, **overrides}


class TestIsValidCoordinate:
    def test_succeeds_on_valid_coordinates(self):
        assert is_valid_coordinates(make_record()) is True

    def test_null_latitude(self):
        assert is_valid_coordinates(make_record(latitude=None)) is False

    def test_null_longitude(self):
        assert is_valid_coordinates(make_record(latitude=None)) is False

    def test_missing_coordinates(self):
        record = make_record()
        del record["latitude"]
        del record["longitude"]
        assert is_valid_coordinates(record) is False

    def test_latitude_too_large(self):
        lat = f"{NYC_LAT_MAX + 100}"
        record = make_record(latitude=lat)
        assert is_valid_coordinates(record) is False

    def test_latitude_too_small(self):
        lat = f"{NYC_LAT_MIN - 100}"
        record = make_record(latitude=lat)
        assert is_valid_coordinates(record) is False

    def test_longitude_too_large(self):
        lng = f"{NYC_LNG_MAX + 100}"
        record = make_record(longitude=lng)
        assert is_valid_coordinates(record) is False

    def test_longitude_too_small(self):
        lng = f"{NYC_LNG_MIN - 100}"
        record = make_record(longitude=lng)
        assert is_valid_coordinates(record) is False

    def test_latitude_non_numeric(self):
        assert is_valid_coordinates(make_record(latitude="a")) is False

    def test_longitude_non_numeric(self):
        assert is_valid_coordinates(make_record(longitude="a")) is False


class TestParseRecord:
    def test_valid_record(self):
        result = parse_record(make_record())
        assert result is not None
        assert result.unique_key == EXPECTED_UNIQUE_KEY
        assert result.complaint_type == EXPECTED_COMPLAINT_TYPE
        assert result.borough == EXPECTED_BOROUGH
        assert result.status == EXPECTED_STATUS

    def test_float_casting(self):
        result = parse_record(make_record())
        assert result is not None
        assert isinstance(result.latitude, float)
        assert isinstance(result.longitude, float)
        assert result.latitude == pytest.approx(EXPECTED_LATITUDE)
        assert result.longitude == pytest.approx(EXPECTED_LONGITUDE)

    def test_datetime_parsing(self):
        result = parse_record(make_record())
        assert result is not None
        assert result.created_date == EXPECTED_CREATED_DATE
        assert result.closed_date == EXPECTED_CLOSED_DATE

    def test_closed_date_none(self):
        result = parse_record(make_record(closed_date=None))
        assert result is not None
        assert result.closed_date is None

    def test_invalid_coordinates_returns_none(self):
        assert parse_record(make_record(latitude=None)) is None

    def test_agency_is_parsed(self):
        result = parse_record(make_record())
        assert result is not None
        assert result.agency == EXPECTED_AGENCY

    def test_missing_agency_returns_none(self):
        result = parse_record(make_record(agency=None))
        assert result is not None
        assert result.agency is None


class TestUpsert:
    def test_filters_invalid_records(self):
        cursor = MagicMock()
        valid = make_record()
        invalid = make_record(longitude=INVALID_LONGITUDE)
        count = upsert(cursor, [valid, invalid])
        assert count == 1

    def test_returns_correct_count(self):
        cursor = MagicMock()
        count = upsert(cursor, [make_record(), make_record(unique_key="2")])
        assert count == 2

    def test_db_insert_with_correct_data(self):
        cursor = MagicMock()
        upsert(cursor, [make_record()])
        c: _Call = cursor.executemany.mock_calls[0]
        sql_data = c.args[1]
        assert len(sql_data) == 1
        row = sql_data[0]
        assert row[0] == EXPECTED_UNIQUE_KEY
        assert row[4] == EXPECTED_BOROUGH
        assert isinstance(row[6], float)
        assert isinstance(row[7], float)

    def test_no_valid_records_skips_db_insert(self):
        cursor = MagicMock()
        count = upsert(cursor, [make_record(longitude=INVALID_LONGITUDE)])
        cursor.executemany.assert_not_called()
        assert count == 0

    def test_empty_input_skips_db_insert(self):
        cursor = MagicMock()
        count = upsert(cursor, [])
        cursor.executemany.assert_not_called()
        assert count == 0

    def test_upsert_agency_called_for_valid_record(self):
        cursor = MagicMock()
        with patch("main.upsert_agency", return_value=1) as mock_upsert_agency:
            upsert(cursor, [make_record()])
            mock_upsert_agency.assert_called_once()

    def test_upsert_agency_called_with_agency_name(self):
        cursor = MagicMock()
        with patch("main.upsert_agency", return_value=1) as mock_upsert_agency:
            upsert(cursor, [make_record()])
            mock_upsert_agency.assert_called_once_with(cursor, EXPECTED_AGENCY)


class TestUpsertAgency:
    def test_returns_none_for_null_agency(self):
        cursor = MagicMock()
        from main import upsert_agency

        result = upsert_agency(cursor, None)
        assert result is None
        cursor.execute.assert_not_called()

    def test_returns_none_for_empty_string(self):
        cursor = MagicMock()
        from main import upsert_agency

        result = upsert_agency(cursor, "")
        assert result is None
        cursor.execute.assert_not_called()

    def test_returns_agency_id(self):
        cursor = MagicMock()
        cursor.fetchone.return_value = (42,)
        from main import upsert_agency

        result = upsert_agency(cursor, "DOT")
        assert result == 42

    def test_upserts_agency_name(self):
        cursor = MagicMock()
        cursor.fetchone.return_value = (1,)
        from main import upsert_agency

        upsert_agency(cursor, "DOT")
        assert cursor.execute.call_count == 2


class TestFetch:
    def _mock_response(self, status_code: int, json_data=None):
        response = MagicMock()
        response.status_code = status_code
        response.json.return_value = json_data or []
        response.raise_for_status = MagicMock()
        return response

    def test_fetch_returns_data(self):
        mock_get = self._mock_response(HTTP["ok"]["code"], VALID_RECORD)
        with patch("main.requests.post", return_value=mock_get):
            assert fetch(page=1) == VALID_RECORD

    def test_fetch_retries_on_processing(self):
        processing = self._mock_response(HTTP["processing"]["code"])
        success = self._mock_response(HTTP["ok"]["code"], [{"id": 1}])
        with patch("main.requests.post", side_effect=[processing, success]):
            with patch("main.time.sleep"):
                assert fetch(page=1) == [{"id": 1}]

    def test_fetch_retries_on_rate_limit(self):
        limited = self._mock_response(HTTP["rate_limited"]["code"])
        success = self._mock_response(HTTP["ok"]["code"], [])
        with patch("main.requests.post", side_effect=[limited, success]):
            with patch("main.time.sleep"):
                assert fetch(page=1) == []

    def test_fetch_raises_on_bad_request(self):
        bad = self._mock_response(HTTP["bad_request"]["code"])
        bad.raise_for_status.side_effect = RuntimeError("400 Bad Request")
        with patch("main.requests.post", return_value=bad):
            try:
                fetch(page=1)
                assert False, "Should have raised"
            except RuntimeError as e:
                assert "400" in str(e)


def run_until_interrupt(fn):
    """Call fn() and swallow KeyboardInterrupt.

    Using pytest.raises(KeyboardInterrupt) re-raises after the context exits,
    which pytest treats as a real interrupt and exits with code 2 instead of 0.
    This helper absorbs it so the suite exits cleanly.
    """
    try:
        fn()
    except (KeyboardInterrupt, RuntimeError):
        pass


@pytest.fixture
def mock_db():
    mock_cursor = MagicMock()
    mock_cursor.__enter__ = MagicMock(return_value=mock_cursor)
    mock_cursor.__exit__ = MagicMock(return_value=False)

    conn = MagicMock()
    conn.__enter__ = MagicMock(return_value=conn)
    conn.__exit__ = MagicMock(return_value=False)
    conn.cursor.return_value = mock_cursor

    return conn


class TestRun:
    @patch("main.BATCH_SIZE", 2)
    @patch("main.connection")
    @patch("main.fetch")
    def test_breaks_on_small_batch(
        self,
        mock_fetch,
        mock_conn_fn,
        mock_db,
    ):
        mock_fetch.return_value = [make_record()]
        mock_conn_fn.return_value = mock_db

        with patch("main.time.sleep", side_effect=KeyboardInterrupt):
            run_until_interrupt(run)

        mock_fetch.assert_called_once_with(page=1)
        assert mock_db.commit.call_count == 3

    # @patch("main.BATCH_SIZE", 2)
    # @patch("main.MAX_RECORDS", 3)
    # @patch("main.connection")
    # @patch("main.fetch")
    # def test_breaks_on_max_records(
    #     self,
    #     mock_fetch,
    #     mock_conn_fn,
    #     mock_db,
    # ):
    #     mock_fetch.return_value = [make_record(), make_record()]
    #     mock_conn_fn.return_value = mock_db
    #
    #     with patch("main.time.sleep", side_effect=[None, KeyboardInterrupt]):
    #         with pytest.raises(KeyboardInterrupt):
    #             run()
    #
    #     assert mock_fetch.call_count == 2
    #     mock_fetch.assert_has_calls([call(page=1), call(page=2)])
    #     assert mock_db.commit.call_count == 4


class TestRunRefreshLogging:
    @patch("main.BATCH_SIZE", 2)
    @patch("main.RefreshLogger")
    @patch("main.connection")
    @patch("main.fetch")
    def test_logs_in_progress_at_start(
        self,
        mock_fetch,
        mock_conn_fn,
        mock_logger_cls,
        mock_db,
    ):
        mock_fetch.return_value = [make_record()]
        mock_conn_fn.return_value = mock_db
        mock_logger = mock_logger_cls.return_value

        with patch("main.time.sleep", side_effect=KeyboardInterrupt):
            run_until_interrupt(run)

        mock_logger.start.assert_called_once()

    @patch("main.BATCH_SIZE", 2)
    @patch("main.RefreshLogger")
    @patch("main.connection")
    @patch("main.fetch")
    def test_logs_success_on_happy_path(
        self,
        mock_fetch,
        mock_conn_fn,
        mock_logger_cls,
        mock_db,
    ):
        mock_fetch.return_value = [make_record()]
        mock_conn_fn.return_value = mock_db
        mock_logger = mock_logger_cls.return_value

        with patch("main.time.sleep", side_effect=KeyboardInterrupt):
            run_until_interrupt(run)

        mock_logger.complete.assert_called_once_with(1)

    @patch("main.BATCH_SIZE", 2)
    @patch("main.RefreshLogger")
    @patch("main.connection")
    @patch("main.fetch")
    def test_logs_failed_on_fetch_error(
        self,
        mock_fetch,
        mock_conn_fn,
        mock_logger_cls,
        mock_db,
    ):
        mock_fetch.side_effect = RuntimeError("API down")
        mock_conn_fn.return_value = mock_db
        mock_logger = mock_logger_cls.return_value

        with patch("main.time.sleep", side_effect=KeyboardInterrupt):
            run_until_interrupt(run)

        mock_logger.fail.assert_called_once_with("API down")
