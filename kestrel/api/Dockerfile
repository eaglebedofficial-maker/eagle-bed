FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN useradd -m kestrel && mkdir -p /app/storage && chown -R kestrel /app
USER kestrel
EXPOSE 8000
# Migrate and load reference data (marketplaces, fee schedules) on start; both are idempotent.
CMD ["sh", "-c", "alembic upgrade head && python -m app.seed && uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers"]
