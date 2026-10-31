import os
from dotenv import load_dotenv

HTTP = {
    "ok": {"code": 200, "message": "OK"},
    "processing": {"code": 202, "message": "Request Processing"},
    "bad_request": {"code": 400, "message": "Bad Request"},
    "unauthorized": {"code": 401, "message": "Unauthorized"},
    "forbidden": {"code": 403, "message": "Forbidden"},
    "not_found": {"code": 404, "message": "Not Found"},
    "rate_limited": {"code": 429, "message": "Too Many Requests"},
    "server_error": {"code": 500, "message": "Server Error"},
}

RETRY_CODES = {HTTP["processing"]["code"], HTTP["rate_limited"]["code"]}

NYC_OPEN_DATA = {
    "complaints": "https://data.cityofnewyork.us/api/v3/views/erm2-nwe9/query.json",
}

TABLES = {
    "complaints": "complaints",
    "refresh_log": "data_refresh_log",
    "agencies": "agencies",
}

MAX_TIMEOUT = 60

NYC_LAT_MIN = 40.35
NYC_LAT_MAX = 41.0
NYC_LNG_MIN = -74.4
NYC_LNG_MAX = -73.55

load_dotenv()

APP_TOKEN = os.getenv("NYC_APP_TOKEN", "")
REFRESH_INTERVAL_SECONDS = int(os.getenv("REFRESH_INTERVAL_SECONDS", "360"))
MAX_RETRIES = 3
RETRY_DELAY = 60
BATCH_DELAY_SECONDS = int(os.getenv("BATCH_DELAY_SECONDS", "60"))
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "1000"))
MAX_RECORDS = BATCH_SIZE * 10 if BATCH_SIZE <= 10000 else 100000
