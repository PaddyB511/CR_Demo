# Copilot instructions for comprehensiblerussian

Use these notes to quickly understand the repo and implement changes safely and productively.

## Big picture

- Monorepo with a Django REST API (`backend/`) and a React + Vite + TypeScript frontend (`frontend/`).
- API lives under `/api/...` via DRF router; frontend dev server proxies `/api` to Django.
- Auth: Auth0-issued JWTs (RS256) are verified server-side; frontend acquires tokens and calls the API with `Authorization: Bearer <token>`.

## Architecture & data flow

- Django app label is `backend` with a local app `backend.users`.
  - `backend/urls.py`: DRF router exposes `users` at `/api/users/`.
  - `backend/users/views.py`: `UserViewSet` (ModelViewSet) with `IsAuthenticated`; default queryset and serializer.
  - `backend/users/serializers.py`: exposes `username`, `email`.
- Frontend uses Vite proxy to route API calls during dev:
  - `frontend/vite.config.ts` proxies `'/api'` to `http://127.0.0.1:8000`.
  - Example call: `axios.get('/api/users/', { headers: { Authorization: 'Bearer ' + token }})` (see `frontend/src/App.tsx`).
- Data shape: DRF may return a list or a paginated object `{ results: [...] }`. The frontend handles both patterns (see `App.tsx`).

## Auth specifics

- Settings (`backend/settings.py`):
  - `REST_FRAMEWORK` uses `rest_framework_jwt.authentication.JSONWebTokenAuthentication` plus Session/Basic.
  - Custom JWT integration lives in `backend/utils.py`:
    - `jwt_decode_token` fetches JWKS from Auth0, validates RS256, audience `https://cr/api/`, issuer `https://dev-t3crhfr5g3mrn5sk.eu.auth0.com/`.
    - `jwt_get_username_from_payload_handler` sets `remote_user` using `sub` (replaces `|` with `.`).
- Frontend obtains tokens via `@auth0/auth0-react` using audience `https://cr/api/` (see `App.tsx`).

## Conventions & patterns

- All API endpoints should be registered via DRF routers in `backend/urls.py` under the `/api/` prefix.
- Default permission is authenticated-only (`IsAuthenticated`). Use per-viewset overrides if needed.
- Custom User model (`AUTH_USER_MODEL = 'users.User'`); reference it with `settings.AUTH_USER_MODEL` in new models to avoid migration issues.
- Static/media paths configured; whitenoise included for static files.

## Adding a new resource (example)

1. Backend

- Create model/serializer/viewset under `backend/<app>/`.
- Register in the router, e.g. `router.register(r'lessons', views.LessonViewSet)` in `backend/urls.py`.
- Ensure the viewset inherits `ModelViewSet` and sets `permission_classes` as needed.

2. Frontend

- Call it via `axios.get('/api/lessons/', { headers: { Authorization: 'Bearer ' + token }})`.
- Rely on the Vite proxy in dev; keep paths relative to `/api`.

## Dev workflows

- Backend
  - Python deps: `pip install -r backend/requirements.txt` (use a venv).
  - Database: PostgreSQL at `127.0.0.1:5432`, db `crdb`, user `postgres`, password `crdb` (see `settings.py`).
  - Migrations: `python manage.py migrate`.
  - Run: `python manage.py runserver` (serves at `http://127.0.0.1:8000`).
- Frontend
  - Install: `npm i` in `frontend/`.
  - Run dev server: `npm run dev` (Vite, proxies `/api` to Django).
  - Tailwind v4 is enabled via `@tailwindcss/vite`; SVGs can be imported as React components via `vite-plugin-svgr`.

## Gotchas

- If API calls 401:
  - Ensure Auth0 token uses the audience `https://cr/api/` and `Authorization: Bearer` header is set.
  - The backend fetches JWKS on each decode; requires internet access during dev.
- DRF pagination may wrap results; check for `data.results` vs array.
- CORS: `django-cors-headers` is listed in requirements but not configured in middleware; Vite proxy avoids CORS during local dev.

## Key files

- Backend: `backend/settings.py`, `backend/urls.py`, `backend/utils.py`, `backend/users/*`.
- Frontend: `frontend/vite.config.ts`, `frontend/src/App.tsx`, `frontend/src/views/ProgressPage.tsx`, `frontend/src/components/ProgressPageComponents/*`.
