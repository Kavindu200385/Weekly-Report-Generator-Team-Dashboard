# Sitrep — Weekly Report Generator & Team Dashboard

Internal weekly-report and team-dashboard tool. Team members submit structured weekly reports (tasks, blockers, achievements, hours); managers review/approve them and see team-wide dashboards and an AI assistant for querying report data.

## Stack

- **frontend/** — React 19 + TypeScript + Vite 8, Tailwind CSS v4, React Router, React Hook Form, Recharts.
- **backend/** — NestJS + TypeORM, backed by MySQL. Auth (JWT, invites, password reset), users, projects, reports (draft/submit/version history), reviews, dashboard, and an AI chat assistant (Groq).

## Setup Instructions

Requires Node.js 22 and a MySQL 8 server (local install or Docker — see step 2).

### 1. Install dependencies

```
cd backend && npm install
cd ../frontend && npm install
```

`backend/.npmrc` sets `legacy-peer-deps=true` — npm reads it automatically, no extra flag needed.

### 2. Database

Pick one:

**Option A — Docker (quickest)**, from the repo root:
```
docker compose up mysql
```
This starts MySQL 8.4 on host port `3307` (not `3306`, to avoid clashing with a locally-installed MySQL) using the credentials from `backend/.env` — set that up first (step 3) with `DB_HOST=localhost` and `DB_PORT=3307` if you use this option, or `DB_HOST=mysql` if you run the whole stack via `docker compose up` (backend+frontend containers included).

**Option B — local MySQL install**: create an empty database matching `DB_NAME` in your `backend/.env` (e.g. `CREATE DATABASE sitrep;`), then point `DB_HOST`/`DB_PORT`/`DB_USER`/`DB_PASSWORD` at it.

Either way, no manual migration step is needed — the backend auto-creates its schema on first startup (`synchronize: true`, dev-only setting). Once the backend is running, seed it with demo data:
```
cd backend && npm run seed
```

### 3. Backend

```
cd backend
cp .env.example .env   # fill in real values — see below
npm run start:dev
```

Required to boot at all: `DB_HOST`/`DB_PORT`/`DB_USER`/`DB_PASSWORD`/`DB_NAME`, `JWT_SECRET`. Also needed for specific features to work: `RECAPTCHA_SECRET_KEY` (register/login), `GROQ_API_KEY` (AI chat assistant). `FRONTEND_URL` must match wherever the frontend actually runs (CORS).

Confirm it's up:
```
curl http://localhost:3000/auth/me
```
A `401 Unauthorized` response means the server is running correctly (that endpoint requires a token).

### 4. Frontend

```
cd frontend
cp .env.example .env   # fill in real values — see below
npm run dev
```

`VITE_API_BASE_URL` must point at the backend from step 3. `VITE_RECAPTCHA_SITE_KEY` must be the site key paired with the backend's `RECAPTCHA_SECRET_KEY`. Open the local URL Vite prints (defaults to `http://localhost:5173`).

## Design & product docs

See [`frontend/docs/`](frontend/docs/) for the original UI spec, product requirements, and the implementation design-token plan this app was built from.

## Origin

This app was originally generated in Figma Make and later restructured into this repo's `frontend/`/`backend/` layout, with `App.tsx` (originally a single ~1900-line file) decomposed into `components/`, `pages/`, `api/`, `context/`, `types/`, and `utils/`.
