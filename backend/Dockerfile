FROM python:3.11-slim

WORKDIR /app

# Build tools so any source-built wheels (e.g. jq) compile reliably on a fresh machine.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/

COPY . .

EXPOSE 8001

# The app seeds 15 customers + orders + admin automatically on startup.
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
