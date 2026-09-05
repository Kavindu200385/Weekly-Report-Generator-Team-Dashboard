Review the current Sitrep application and make sure ALL of the following are fully implemented and working
end-to-end, not just visually present. Go through this list in order and fix or add anything missing. This is
an internal work-reporting tool for a small team (5-6 members + 1 manager) and needs to function as a real
connected app with a working backend and database, not static/mock data on the frontend.

1. AUTHENTICATION & ROLES
- User registration (name, email, password) with the password securely hashed, never stored in plain text
- Login and logout with proper session handling
- Two distinct roles: Team Member and Manager/Admin, assigned at signup or by an admin
- Every page and every API endpoint must enforce role checks server-side — a Team Member account must never
  be able to view or modify another team member's data, and must never reach a manager-only page or endpoint,
  even by directly calling the API or guessing a URL/ID

2. PERSONAL WEEKLY REPORT
- One dedicated page per user to create/manage their weekly report
- Fields are FIXED and IDENTICAL for every user, in this exact order (no per-user customization or reordering):
  a) Week / date range
  b) Project or category tag (dropdown from the Projects list)
  c) Tasks completed — an editable table: task name, priority, planned % vs actual %, status,
     time planned vs. time spent, output/deliverable
  d) Tasks planned for next week (free text)
  e) Blockers / challenges — repeatable list, exactly one can be flagged "key issue for the week"
  f) Achievements / highlights — repeatable list, exactly one can be flagged "key achievement"
  g) Hours worked by task type (Development / Testing / Meetings / Documentation) — optional section
  h) Optional notes or links
- Create → saves as Draft
- Edit allowed only while status is Draft or Needs Correction
- Submit for manager review
- Own report history page: reports grouped by week, showing current status (Draft / Submitted /
  Needs Correction / Approved)

3. REPORT REVIEW & CORRECTION WORKFLOW — verify this full cycle actually works, not just the UI states
- Status flow: Draft → Submitted → Needs Correction → Approved
- Manager, on a Submitted report, can Approve OR Request Changes with a required comment
- Request Changes moves status to Needs Correction and the comment is clearly visible to the team member
  on their report page
- Team member edits the SAME report and resubmits → status returns to Submitted for another review round
- Team members can only see/edit their own reports. Managers can see every report but can only change
  status/comment — never rewrite the team member's actual report content
- VERSION HISTORY: confirm that each resubmission after Needs Correction creates a NEW version rather than
  overwriting the old one. The report detail page must show a version history panel — a list of past versions
  with submission timestamps, each openable to view that version's full content, and each version's linked
  review comment visible (which version a comment was made against). Also keep the full history of all past
  review comments, not just the latest one.
- Test this specific scenario end-to-end: submit a report → manager requests changes → team member edits and
  resubmits → manager approves. Confirm the old (pre-correction) version is still viewable afterward.

4. TEAM DASHBOARD (MANAGER VIEW)
- View all team members' reports for a selected week
- Filters: team member, project/category, date range, status (including "not yet started" for members with
  no report that week)
- Clicking any report opens it for full review and action (Approve / Request Changes)

5. PROJECTS / CATEGORIES
- A dedicated page (not just a modal) with add / edit / delete for projects/categories
- Optional: assign specific team members to specific projects

6. DASHBOARD & VISUAL INSIGHTS
Summary metrics (real numbers computed from the seeded data, not placeholders):
- Total reports submitted this week
- Submission compliance rate (submitted vs pending vs late)
- Count of reports currently in Needs Correction
- Count of open blockers across the team

Charts, computed from real report data:
- Tasks completed trend over time
- Report status by team member
- Workload/task distribution by project
- Time spent by task type, team-wide
- Recent activity feed (recent submissions + recent review actions)

7. PAGES — confirm ALL of these exist and are wired to real backend data (build all, not just the minimum 7):
- Login / Register
- Personal weekly report (create/edit)
- Report history (per user)
- Report detail / view (read-only, shared by both roles, includes version history)
- Team member profile (manager view — click a member, see their full history + stats)
- Project/category management (its own page with CRUD)
- User management (admin — invite/remove team members, assign roles)
- Manager review page (approve / request changes with comment)

8. AI CHAT ASSISTANT (optional, only after everything above is solid)
- Simple in-app chat widget for managers, conversational Q&A about team activity from real report data
- AI-generated weekly team summary: completed work, recurring blockers, workload imbalances

BACKEND / DATA REQUIREMENTS TO VERIFY:
- REST API with request validation on all write endpoints
- Role-based access control enforced server-side on every relevant endpoint (test this — not just hidden
  in the frontend UI)
- Pagination and/or filtering on any endpoint returning a list of reports
- Database schema clearly representing: users, roles, projects, reports, and report review/version history
  (not just current status + latest comment — full history)

SEED DATA (critical — confirm this exists, not an empty database):
- At least 3-5 team member accounts plus 1 manager account
- Several weeks of reports across DIFFERENT statuses (some Draft, some Submitted, some Needs Correction,
  some Approved) spread across different team members and projects, so the dashboard, charts, and history
  pages are actually meaningful to look at immediately rather than empty or showing only one status

Please go through each numbered section above, tell me what is already working, and fix or build whatever
is missing or incomplete. Prioritize section 3 (the review/correction workflow with version history) and
the seed data — these are the two most commonly incomplete parts.