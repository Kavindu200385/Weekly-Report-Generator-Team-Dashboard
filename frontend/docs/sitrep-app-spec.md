Build "Sitrep" — a full-stack internal web application for weekly work reporting and team review, for a small
company (5-6 team members + 1 manager). This must function as a real, connected application with a working
backend and database — not a static mockup. Treat this as a realistic small internal tool, not a prototype.

======================================================================
DESIGN SYSTEM (apply consistently across every screen)
======================================================================
Aesthetic: industrial / operations-console style — like Grafana, Palantir Foundry, or a SCADA dashboard.
This is a serious internal work tool, not a consumer SaaS product. No marketing-site look anywhere.

- Dark theme. Base background near-black graphite (#14161A). Surface panels slightly lighter (#1D2025).
  Raised elements (modals, dropdowns) at (#24272D).
- Borders: 1px hairline (#33373E) used to separate sections instead of drop shadows or floating cards.
- NO bright, neon, or highlight colors anywhere. NO gradients. NO glassmorphism.
- Single functional accent color: muted steel blue (#4C6B8A) for links, primary buttons, and focus states.
- Status colors must be desaturated, never bright: grey (#6B7078) for Draft, steel blue (#4C6B8A) for
  Submitted, muted amber/ochre (#8A6A4C) for Needs Correction, muted olive-green (#4A8A67) for Approved.
- Text: primary #E4E6EA, secondary #9AA0AA, muted #61666F.
- Typography: Inter or IBM Plex Sans for UI text, IBM Plex Mono for numeric/data columns, timestamps, and IDs.
  Sentence case only — no ALL-CAPS labels, no tracked-out eyebrow text above headings.
- Corners: square or barely-rounded (2-4px radius max). No pill-shaped buttons or badges.
- Layout: fixed left sidebar navigation (~220px), dense data tables as the primary content pattern,
  8px spacing grid. Wordmark "Sitrep" in IBM Plex Mono, small and understated in the sidebar header.
- Charts: flat fills in the muted palette above, gridlines in the border color, no drop shadows, no 3D effects.

======================================================================
1. USER AUTHENTICATION & ROLES
======================================================================
- User registration (name, email, password)
- Login / Logout with secure session handling (JWT-based)
- Password protection (hashed, never stored plain)
- Two roles: Team Member and Manager/Admin
- Role assignment at signup or by an admin afterward
- Every page and API action must respect role: a Team Member can never see or act on another team member's
  data or reach a manager-only screen/endpoint

======================================================================
2. PERSONAL WEEKLY REPORT PAGE
======================================================================
Every team member has one dedicated page to create/manage their weekly report. Fields are FIXED and IDENTICAL
for every user, in this exact order — no per-user customization, reordering, or custom fields:
- Week / date range picker
- Project or category tag (dropdown, sourced from the Projects list)
- Tasks completed — an editable table with columns: task name, priority, planned % vs actual %, status,
  time planned vs. time spent, output/deliverable produced
- Tasks planned for next week (free text)
- Blockers / challenges — a repeatable list, with the ability to flag exactly one entry as "key issue for the week"
- Achievements / highlights — a repeatable list, with the ability to flag exactly one entry as "key achievement"
- Hours worked, broken down by task type (Development, Testing, Meetings, Documentation) — OPTIONAL section,
  collapsible
- Optional notes or links field

Required behavior:
- Create report → saved as Draft
- Edit report while Draft or Needs Correction (locked/read-only otherwise)
- Submit report for manager review
- Own report history page, organized by week, showing current status of each: Draft / Submitted /
  Needs Correction / Approved

======================================================================
3. REPORT REVIEW & CORRECTION WORKFLOW (core, required — not optional)
======================================================================
Status flow: Draft → Submitted → Needs Correction → Approved

- Draft: only visible to the team member who owns it
- Submitted: appears on the manager's dashboard for review
- Needs Correction: manager sent it back with one general comment explaining what to fix; report becomes
  editable again by the team member; the comment must be clearly visible on the team member's report page
- Approved: manager satisfied, no further edits expected

Manager can, on any Submitted report: Approve, or Request Changes with a required comment.
When changes are requested, status → Needs Correction. Team member edits and resubmits → status → Submitted
again for another review round.

Access rules: team members see/edit ONLY their own reports. Managers see every team member's reports but can
ONLY edit status/comment fields — never the team member's actual report content.

VERSION HISTORY (required): each time a report goes through a correction cycle (Needs Correction → edited →
resubmitted), the previous version's content must remain visible, not overwritten. On the report detail page,
show a "Version History" panel — a simple list of past versions with submission timestamps, viewable on demand,
each linked to the review comment that was made against that specific version. Also keep a short history of
ALL previous review comments per report (not just the latest one).

======================================================================
4. TEAM DASHBOARD (MANAGER VIEW)
======================================================================
- View all team members' reports for a selected week
- Filter by: team member, project/category, date range, status (Draft/Submitted/Needs Correction/
  Approved/not yet started)
- Open any report to review full contents and take a review action (Approve / Request Changes)
- Bonus: for a selected week, view one section (e.g. all Blockers, or all Achievements) across every team
  member side by side, without opening each report individually

======================================================================
5. PROJECTS / CATEGORIES
======================================================================
Full CRUD page (not a modal-only interaction) for work categories (e.g. Client A, Internal Tooling, R&D,
Marketing): add, edit, delete. Optional: assign specific team members to specific projects.

======================================================================
6. DASHBOARD & VISUAL INSIGHTS
======================================================================
Summary metric cards (bordered panels, not gradient cards):
- Total reports submitted this week
- Submission compliance rate (submitted vs pending vs late)
- Number of reports currently in Needs Correction status
- Number of open blockers across the team

Charts (flat, muted-palette, no 3D/gradients):
- Tasks completed trend over time (per person or team-wide)
- Report submission/approval status by team member
- Workload / task distribution by project
- Time spent by task type, team-wide (meetings vs development vs testing vs documentation)
- Recent reports / activity feed, including recent review actions (approved / sent back for correction)

======================================================================
7. PAGES REQUIRED (implement all of these, connected to real data — minimum 7 required by spec, build all 8)
======================================================================
1. Login / Register page
2. Personal weekly report page (create / edit) — the fixed-field form above
3. Report history page (per user) — list view of past reports + statuses, separate from create/edit
4. Report detail / view page — read-only, used by both team members and managers, includes version history
   panel and review comment display
5. Team member profile page (manager view) — clicking a team member shows their full report history + basic stats
6. Project / category management page — full list + CRUD actions, its own page
7. User management page (admin) — invite/remove team members, assign roles
8. Manager review page — manager opens a submitted report, takes Approve / Request Changes action with comment

Do not ship only 2-3 basic screens — that is explicitly called out as incomplete even if logic works.

======================================================================
8. AI CHAT ASSISTANT (good to have, build if time allows after everything above works)
======================================================================
- A simple in-app chat widget for managers
- Conversational Q&A about team activity (e.g. "What did the design team work on last week?")
- AI-generated team summary: completed work, recurring blockers, workload imbalances
- Keep it simple: direct API calls over stored report data, not a complex RAG pipeline

======================================================================
SCOPE & DIFFICULTY EXPECTATIONS — the build must demonstrate:
======================================================================
- At least 7 of the pages above, fully implemented and connected to real backend data (not static/fake data)
- A complete, working end-to-end review cycle: submit → manager requests changes → team member edits and
  resubmits → manager approves — this full loop must actually work, not just exist as separate screens
- A seeded dataset: at least 3-5 team members (plus 1 manager) and several weeks of reports across different
  statuses (some Draft, some Submitted, some Needs Correction, some Approved) so the dashboard and history
  pages are meaningful to review immediately, not empty
- Role-based access control enforced on the backend, not just hidden in the UI — a team member account must
  never be able to fetch or act on another team member's report data, and must never reach a manager-only page
- The app should feel like a real internal tool a small company would actually run day to day: dense, fast,
  legible, trustworthy — calm and functional rather than flashy

Technical expectations: REST API with proper request validation, clean role-based access control on every
relevant endpoint, pagination and/or filtering on any endpoint that returns a list of reports, and a database
schema that clearly represents users, roles, projects, reports, and the review/status history of each report
(including version history, not just current status and latest comment).