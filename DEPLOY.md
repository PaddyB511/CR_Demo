Deployment notes
================

This repository contains a Django backend in `backend/` and a Vite React frontend in `frontend/`.

Dockerfile
----------

The provided `Dockerfile` is multi-stage:

- Builds the frontend using Node and Vite.
- Installs Python dependencies and copies backend source.
- Copies frontend `dist/` into Django `staticfiles` directory.
- Runs Gunicorn serving the Django app (Whitenoise serves static files).

Build and run locally
----------------------

Build the image (run from repository root):

```bash
docker build -t cr-app:latest .
```

Run locally (bind to port 8000):

```bash
docker run --rm -p 8000:8000 \
  -e DATABASE_URL=postgres://postgres:crdb@host:5432/crdb \
  -e SECRET_KEY='your-secret' \
  cr-app:latest
```

AWS deployment recommendations
------------------------------

Two common options:

1) ECS (recommended for containers) + ECR:
   - Push image to ECR and create an ECS task definition using the image.
   - Use Fargate for serverless container hosting.
   - Configure environment variables (DATABASE, SECRET_KEY) via Task Definition or Secrets Manager.

2) Elastic Beanstalk (platform: Docker):
   - Zip the application with Dockerfile at root and deploy via EB CLI.

Env vars and secrets
---------------------

Set the following environment variables in your container orchestrator:

- DATABASE_URL or individual DB variables (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD)
- SECRET_KEY
- DJANGO_SETTINGS_MODULE (defaults to `backend.settings`)

Notes and caveats
-----------------

- The Dockerfile installs packages system-wide by copying site-packages; this keeps the final image small by reusing the built site-packages. If you prefer, install dependencies in the final image instead.
- `DEBUG` is True by default in `backend/settings.py`. Change it to False for production and configure `ALLOWED_HOSTS`.
- Ensure your production database is reachable by the container and that migrations are run.
