# Sitrep — Implementation Plan

## Context

Build a production-grade internal weekly-report and team-dashboard web app called "Sitrep." Target aesthetic is industrial/operations-console (Grafana, Palantir Foundry, SCADA) — dark graphite, muted palette, dense data tables, fixed sidebar. The spec is fully documented in `src/imports/pasted_text/sitrep-ui-spec.md`.

The current codebase is a blank Vite + React 19 + Tailwind CSS v4 scaffold (`src/App.tsx` renders an empty div).

---

## Approach

Single-file SPA with React state-driven routing (no react-router needed for this prototype). All 7 pages share one design system defined via CSS custom properties in `src/index.css`. Mock data lives inline. Charts use Recharts.

---

## Design Tokens (in `src/index.css`)

```css
--bg-base: #14161A;
--bg-surface: #1D2025;
--bg-surface-raised: #24272D;
--border: #33373E;
--text-primary: #E4E6EA;
--text-secondary: #9AA0AA;
--text-muted: #61666F;
--steel-blue: #4C6B8A;
--status-draft: #6B7078;
--status-submitted: #4C6B8A;
--status-correction: #8A6A4C;
--status-approved: #4C8A67;
```

Fonts (Google Fonts via `@import` at top of `src/index.css`):
- Inter (400, 500, 600) — UI/body
- IBM Plex Mono (400, 500) — data columns, timestamps, wordmark

Border radius: 2px everywhere. No shadows. Borders via `1px solid var(--border)`.

---

## File Structure

All implementation goes in two files:

- **`src/index.css`** — Google Font imports, CSS custom properties, base resets, scrollbar hiding, table/input base styles
- **`src/App.tsx`** — All page components, shared layout (sidebar + main), and page router state

The app is large enough that `App.tsx` will be split into logical sections using named function components, all in one file for simplicity:

```
App.tsx sections:
  - Types & mock data
  - Design-system primitives (StatusBadge, Button, Input, Modal, MetricCard)
  - Layout shell (Sidebar + AppShell)
  - Page: LoginPage
  - Page: MyReportPage (form with TaskTable, BlockerList, AchievementList)
  - Page: ReportHistoryPage (filterable table)
  - Page: ReportDetailPage (read-only + version history + review comment)
  - Page: ManagerDashboardPage (metric cards + 4 Recharts + team table)
  - Page: ManagerReviewPage (report + action panel)
  - Page: ProjectsPage (CRUD table + AddProjectModal)
  - Router (useState-based page switcher)
```

---

## Key Implementation Details

### Sidebar
- Fixed 220px left, full height, `bg-surface`, `border-r border`
- Nav items: My Report, Report History, Dashboard (manager only), Projects, logout
- Active item: left 2px `steel-blue` border, slightly lighter bg
- Wordmark "Sitrep" top-left in IBM Plex Mono, 14px, `text-secondary`

### StatusBadge
- `inline-flex items-center gap-1.5 px-1.5 py-0.5 text-xs font-mono border`
- 4px dot + label text, color from status map
- Border radius 2px

### Dense Tables
- `w-full text-xs`, `border-collapse`
- `<th>`: `text-muted`, `font-normal`, `border-b border`, `py-2 px-3`, left-aligned
- `<td>`: `text-primary`, `border-b border`, `py-2 px-3`, mono for numbers/dates
- Hover row: `bg-surface-raised`
- No zebra striping

### MyReportPage — Task Table
Inline editable table with columns: Task Name (text input), Priority (select), Planned % (number), Actual % (number), Status (select), Time Planned (number), Time Spent (number), Output/Deliverable (text). Add/remove rows.

### ManagerDashboardPage — Charts (Recharts)
4 charts in a 2×2 grid (each in a `bg-surface border` panel):
1. `LineChart` — tasks completed trend (last 8 weeks)
2. `BarChart` — status by team member (stacked)
3. `BarChart` — workload by project
4. `PieChart` or `BarChart` — time by type (Dev/Test/Meetings/Docs)

All chart colors: steel-blue variants + muted status colors. No bright fills. Grid lines: `#33373E`. Tick text: `#9AA0AA` mono 11px. No chart shadows.

### MetricCard
```tsx
// bordered panel, NOT gradient card
<div className="border p-4" style={{background:'var(--bg-surface)'}}>
  <div style={{color:'var(--text-muted)', fontSize:11, fontFamily:'mono'}}>label</div>
  <div style={{color:'var(--text-primary)', fontSize:24, fontFamily:'mono', marginTop:4}}>value</div>
</div>
```

### ManagerReviewPage
- Left 2/3: report content (read-only, same structure as detail)
- Right 1/3: sticky action panel — Approve button (olive-green border+text), Request Changes button (amber border+text), comment textarea (visible when Request Changes clicked), past comments list

### ProjectsPage
- Table: Name, Description, Active (toggle), Actions (Edit | Delete)
- "Add Project" button top-right opens centered modal with form
- Modal: `bg-surface-raised`, 2px border, no drop shadow

---

## Dependencies

Install before writing charts code:
```
pnpm add recharts
```

---

## Verification

1. `pnpm dev` already running — check preview for all 7 pages via sidebar nav
2. Verify color system: no bright colors visible anywhere, all text legible
3. Verify font loading: wordmark in IBM Plex Mono, table numbers in mono
4. Verify task table add/remove rows, blocker/achievement repeatable lists
5. Verify Recharts render without errors (mock data must match expected shape)
6. Verify modal opens/closes on ProjectsPage
7. Verify login form shows without sidebar
