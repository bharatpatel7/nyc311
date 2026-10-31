FROM python:3.12.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN adduser --disabled-password --no-create-home appuser
COPY --chown=appuser:appuser . .
USER appuser
CMD ["python", "main.py"]
