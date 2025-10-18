## Multi-stage Dockerfile
# 1) Build frontend (Vite)
# 2) Install Python deps, copy backend + built frontend, collectstatic
# 3) Run Gunicorn

### Stage 1: Build frontend
FROM node:20-alpine AS node-build
WORKDIR /app/frontend
COPY frontend/package*.json frontend/pnpm-lock.yaml* ./
COPY frontend/ .
RUN npm ci --silent && npm run build

### Stage 2: Build Python image and collect static
FROM python:3.11-slim AS python-build
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app

# System deps required by some Python packages (psycopg may need libpq)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev gcc curl && \
    rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Create static dir and copy frontend build into it
RUN mkdir -p /app/backend/staticfiles
COPY --from=node-build /app/frontend/dist/ /app/backend/staticfiles/

# Collectstatic will be run at container start (or during image build if desired)

### Final image
FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app

# OS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev curl && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages from build stage
COPY --from=python-build /usr/local/lib/python3.11/site-packages/ /usr/local/lib/python3.11/site-packages/
COPY --from=python-build /usr/local/bin/ /usr/local/bin/

# Copy app source
COPY backend/ ./backend/

# Copy frontend static files
COPY --from=node-build /app/frontend/dist/ ./backend/staticfiles/

ENV DJANGO_SETTINGS_MODULE=backend.settings
ENV STATIC_ROOT=/app/backend/staticfiles

# Expose port
EXPOSE 8000

# Create a non-root user
RUN useradd --create-home appuser || true
USER appuser

CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
