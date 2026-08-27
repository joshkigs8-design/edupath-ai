# EduPath AI – Smart Course Matcher

This is a large scope. I'll build it in phased milestones so you see value quickly and we don't blow through credits on features you may want tweaked. Confirm the plan (or edit any phase) and I'll start with Phase 1.

## Approach

- **Data-first**: I parse your uploaded KUCCPS PDF (78 pages, ~1,500+ programme rows) once, seed it into the Lovable Cloud database, and every student search hits the database — never the PDF. Re-upload next year to refresh.
- **Backend**: Lovable Cloud (Postgres + Auth + Storage + Server Functions). Tables: `universities`, `programmes`, `subject_requirements`, `cutoff_history`, `student_results`, `generated_reports`, `user_roles`.
- **Frontend**: TanStack Start, glassmorphism design system in `styles.css` with purple `#6C4CF1` + blue `#3B82F6` tokens, shadcn variants, framer-motion transitions, dark mode.

## Cluster points

KUCCPS uses per-cluster weighted formulas that depend on which 4 subjects a programme values. I'll implement the standard KUCCPS approximation: for each programme, take the student's grade points in the 4 relevant cluster subjects (or best 4 if none specified) → weighted raw cluster → scaled to 48. Minimum subject grades from the PDF (e.g. `MAT A(121):C+`) are enforced as hard gates before eligibility. I'll document the formula in-app so students understand it's an estimate.

## Phases

**Phase 1 — Foundation + Design system + Landing (this turn)**

- Enable Lovable Cloud, create schema + RLS + grants
- Purple/blue glassmorphism tokens, hero landing page, grade-entry form UI
- Auth (email + Google) — optional sign-in; guests can still match
- No data yet; landing is fully clickable

**Phase 2 — PDF ingestion pipeline**

- Server function that parses the KUCCPS PDF (all 78 pages) and inserts programmes + requirements
- Admin panel (role-gated) with upload + re-index button
- I run it once against your uploaded PDF to seed production data

**Phase 3 — Matching engine + Results page**

- Cluster-point calculator + eligibility filter (server function)
- Results page with stats cards, filters (university/county/category/cutoff/gov-vs-private), instant search, admission-chance badges, confetti
- Course detail modal

**Phase 4 — AI recommendations + PDF report**

- Lovable AI Gateway (Gemini 2.5 Flash) for Safe/Competitive/Dream/Career/Scholarship suggestions
- Downloadable PDF report with branding

## Notes / assumptions

- County per university and career-opportunities text aren't in the PDF; I'll maintain a small curated JSON for the ~70 Kenyan universities in the doc (county + type gov/private). Career suggestions come from the AI layer.
- University logos: placeholder monograms unless you provide a logo set later.
- Only the first 50 of 78 PDF pages parsed in my preview call; the server-side ingestion will process all 78.

Approve and I'll start Phase 1.
