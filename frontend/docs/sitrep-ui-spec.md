UI Design Spec — Sitrep (Weekly Report Generator & Team Dashboard)

Product name: Sitrep — short for "situation report," the military/ops term for a status update. Fits the industrial console direction and doubles as the literal function of the app.

Design direction: industrial / operations-console, not consumer SaaS. Think factory control room, Grafana, Palantir, SCADA dashboards — dense, muted, functional. No bright accent colors, no gradients, no rounded-pill-everything look.

1. Design Tokens
Color — muted industrial palette (no highlight/neon colors)
Token	Hex	Use
--bg-base	
#14161A	app background, near-black graphite
--bg-surface	
#1D2025	cards, panels
--bg-surface-raised	
#24272D	modals, dropdowns
--border	
#33373E	hairline borders, dividers
--text-primary	
#E4E6EA	primary text
--text-secondary	
#9AA0AA	labels, secondary text
--text-muted	
#61666F	disabled, placeholder
--steel-blue	
#4C6B8A	single functional accent — links, primary buttons, focus rings
--status-draft	
#6B7078	grey — neutral state
--status-submitted	
#4C6B8A	steel blue — in progress
--status-needs-correction	
#8A6A4C	muted amber/ochre — needs attention, NOT bright orange
--status-approved	
#4C8A67	muted olive-green — done

No pure black, no pure white, no saturated red/green/blue. Status colors are desaturated so the dashboard reads calmly even with many badges on screen at once.

Typography
UI/body: Inter or IBM Plex Sans — functional, neutral, no personality flourishes
Data/labels/numbers: IBM Plex Mono for table figures, timestamps, IDs, metrics — reinforces the "console" feel and makes numeric columns scan cleanly
Sentence case throughout. No tracked-out ALL-CAPS eyebrows, no decorative labels.
Type scale: 12 / 13 / 14 / 16 / 20 / 28px. Body text 14px. Dense, not oversized — this is a work tool, not a marketing page.
Layout
Left sidebar navigation (fixed, ~220px), collapsed on mobile
Content area: max-width constrained on forms (≤720px), full-width on tables/dashboard
8px base spacing grid
1px hairline borders (--border) to separate sections instead of shadows/cards-on-cards
Square or barely-rounded corners (2–4px radius max) — not the rounded-pill SaaS look
No drop shadows for elevation — use border + subtle background shift (--bg-surface vs --bg-surface-raised) instead
Components
Tables are the primary UI element (task tables, report lists, team dashboard) — dense rows, monospace numeric columns, sortable headers, zebra striping using --bg-surface alternation only (no color)
Status badges: small, square-cornered, colored dot + label — not filled pill badges
Buttons: flat, no gradient, 1px border on secondary buttons, filled --steel-blue on primary only
Charts (Recharts): flat fills in the muted palette above, gridlines in --border, no drop shadows, no 3D effects
2. Pages to Generate
Login / Register
My Report (create/edit) — fixed-field form with task table
Report History — table view with status badges, filters
Report Detail — read-only, includes version history panel + review comment
Manager Dashboard — summary metric cards + 4 charts + filterable team report table
Manager Review — report content + Approve / Request Changes action panel
Projects — CRUD table page
3. Figma AI Generation Prompt

Paste this into Figma's AI design generator:

Design a production-grade internal web application called "Sitrep" — a weekly report and team dashboard
tool for engineering/agency teams to submit and review weekly work reports.

AESTHETIC DIRECTION: Industrial, utilitarian, operations-console style — like Grafana, Palantir Foundry,
or an industrial SCADA dashboard. This is a serious internal work tool, not a consumer SaaS product.

Strict constraints:
- Dark theme. Base background near-black graphite (#14161A), surface panels slightly lighter (#1D2025).
- NO bright, neon, or highlight colors anywhere. NO gradients. NO glassmorphism. NO colorful hero sections.
- Single functional accent color only: a muted steel blue (#4C6B8A) for links, primary buttons, and focus states.
- Status colors must be desaturated/muted, not bright: grey for draft, steel blue for submitted, muted
  amber/ochre (#8A6A4C) for needs-correction, muted olive-green (#4A8A67) for approved. Never bright red,
  bright orange, or bright green.
- Typography: Inter or IBM Plex Sans for UI text, IBM Plex Mono for numeric/data columns and timestamps.
  Sentence case only — no ALL-CAPS labels, no tracked-out eyebrow text above headings.
- Square or barely-rounded corners (2-4px radius max). No pill-shaped buttons or badges.
- Use 1px hairline borders to separate sections instead of drop shadows or floating cards.
- Layout: fixed left sidebar navigation, dense data tables as the primary content pattern, 8px spacing grid.
- No decorative icons-in-colored-circles, no marketing-style stat cards with big gradient numbers.

Pages to design (all as one connected file, consistent design system across pages):

1. Login / Register — simple centered form, email + password, role is assigned server-side, minimal
   branding with the wordmark "Sitrep" in IBM Plex Mono, small and understated (not a large logo/hero)
2. My Weekly Report — a long form with fixed sections in this exact order: week date range picker, project
   dropdown, a dense editable table for "tasks completed" (columns: task name, priority, planned %, actual %,
   status, time planned, time spent, output/deliverable), a text area for "tasks planned next week", a
   repeatable list for blockers (each can be flagged as "key issue"), a repeatable list for achievements
   (each can be flagged as "key achievement"), an optional collapsible section for hours by task type
   (Development/Testing/Meetings/Documentation), an optional notes/links field, and Save Draft / Submit buttons
3. Report History — a dense table: week, project, status badge, submitted date, last reviewer comment preview,
   click to open. Filter bar above: status dropdown, project dropdown, date range picker
4. Report Detail (read-only) — same field layout as the report form but non-editable, plus a collapsible
   "version history" panel listing past versions with timestamps, and the current/most recent review comment
   shown prominently in a bordered callout box (muted amber border if needs-correction)
5. Manager Dashboard — top row of 4 compact metric cards (Total Submitted This Week, Compliance Rate,
   Needs Correction Count, Open Blockers) styled as bordered panels not gradient cards, followed by a 2x2 grid
   of charts (tasks completed trend line, status-by-member bar chart, workload-by-project bar chart, time-by-type
   breakdown), then a dense filterable/paginated table of all team reports with status badges and filters for
   member/project/date range/status
6. Manager Review — report content displayed read-only (same structure as report detail), with a fixed action
   panel on the right or bottom: Approve button (muted olive-green), Request Changes button (muted amber) that
   opens a comment text area, and a small list of past review comments for context
7. Projects — a CRUD table page: project name, description, active toggle, edit/delete actions, "Add Project"
   button opens a simple modal form

Overall feel: this should look like an internal tool built by engineers for engineers — calm, legible,
information-dense, trustworthy, boring in a good way. Nothing should look like a landing page or marketing site.
4. Notes for whoever runs this prompt
If Figma Make/AI offers a "reference file" or "design system" upload step, feed it this same token table (colors, type, spacing) so later screens stay consistent — regenerating page-by-page tends to drift.
After generation, manually check: no button/badge accidentally rendered in a bright default blue/purple (common AI-generator default) — swap to --steel-blue (
#4C6B8A) if so.
Export components as a Figma library/frame set so they map cleanly to the React component list in project-plan.md (ui/Button, ui/Badge, reports/TaskTable, etc.) — one Figma frame per component keeps handoff simple.