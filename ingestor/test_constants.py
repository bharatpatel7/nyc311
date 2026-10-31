from datetime import datetime

VALID_RECORD = {
    "unique_key": "1",
    "created_date": "2026-01-01T08:00:00.000",
    "closed_date": "2026-01-04T08:00:00.000",
    "complaint_type": "Noise",
    "borough": "QUEENS",
    "status": "Closed",
    "latitude": "40.727",
    "longitude": "-73.715",
    "agency": "DOT",
}

EXPECTED_UNIQUE_KEY = VALID_RECORD["unique_key"]
EXPECTED_COMPLAINT_TYPE = VALID_RECORD["complaint_type"]
EXPECTED_BOROUGH = VALID_RECORD["borough"]
EXPECTED_STATUS = VALID_RECORD["status"]
EXPECTED_LATITUDE = float(VALID_RECORD["latitude"])
EXPECTED_LONGITUDE = float(VALID_RECORD["longitude"])
EXPECTED_CREATED_DATE = datetime(2026, 1, 1, 8, 0, 0)
EXPECTED_CLOSED_DATE = datetime(2026, 1, 4, 8, 0, 0)
EXPECTED_AGENCY = VALID_RECORD["agency"]
INVALID_LONGITUDE = float(VALID_RECORD["longitude"]) + 100
