# build context is ./analytics so the schema file can be copied in
FROM python:3.12-slim

WORKDIR /app
COPY sync/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY sync/sync_to_azure_sql.py sql/01_star_schema.sql ./

CMD ["python", "sync_to_azure_sql.py"]
