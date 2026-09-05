# Sitrep — Weekly Report Generator & Team Dashboard

Internal weekly-report and team-dashboard tool. Team members submit structured weekly reports (tasks, blockers, achievements, hours); managers review/approve them and see team-wide dashboards and an AI assistant for querying report data.

## Stack

- **frontend/** — React 19 + TypeScript + Vite 8, Tailwind CSS v4, React Router, React Hook Form, Recharts. Currently backed by in-memory mock data (see `frontend/src/api/`) pending the real backend.
- **backend/** — scaffolded folder structure for a future NestJS API (auth, users, projects, reports, reviews, dashboard). Not yet implemented.

## Running the frontend

```
cd frontend
pnpm install   # or npm install
pnpm dev       # or npm run dev
```

## Design & product docs

See [`frontend/docs/`](frontend/docs/) for the original UI spec, product requirements, and the implementation design-token plan this app was built from.

## Origin

This app was originally generated in Figma Make and later restructured into this repo's `frontend/`/`backend/` layout, with `App.tsx` (originally a single ~1900-line file) decomposed into `components/`, `pages/`, `api/`, `context/`, `types/`, and `utils/`.
