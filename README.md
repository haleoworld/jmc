# Phone Screen Conversion Tool

A single-file web app that runs Jerry's whole senior-frontend job search: capture
job descriptions, screen them against configurable criteria, batch the qualified
ones, draft tailored application answers, version the resume with ATS scoring, and
track phone-screen conversion on a dashboard. It runs as a Cowork artifact and as a
plain web page (hosted on GitHub Pages), with the same data synced across devices
via a private GitHub Gist.

Everything lives in **`app.html`** — one self-contained file (~7,800 lines, vanilla
JS, Chart.js is the only external library). It's the only file committed to the
deployment repo. The rest of this folder is reference material and the archived
legacy pipeline.

---

## How it's structured

**Bottom navigation — 4 tabs:** Batches · Search · Dashboard · Setup. Settings
lives behind the hamburger in the top header.

**Client-side hash router** (works on static hosting): `#/batches`, `#/search`,
`#/dashboard`, `#/setup`, `#/settings`, plus deep links `#/batch/<id>`,
`#/job/<id>`, `#/add`, and sub-tab routes like `#/setup/companies` or
`#/job/<id>/screening`. Browser back/forward works.

### Batches tab
The main workspace. Shows an **Unbatched** bucket (jobs not yet in a batch) plus
your batches. Each batch can be **named**, is tied to a **criteria set** and a
**resume version**, and moves through statuses (draft → analyzed → submitted →
archived). From here you add jobs, screen them, group them, run batch AI analysis,
and mark them submitted. A `+` FAB opens a drawer (add job / add selected to batch);
status changes and moves use bottom-sheet drawers.

### Search tab
Filters **all jobs** live as you type, matching **title, company, and location**
(multiple words are AND-ed). Tap a result to open the job.

### Dashboard tab
Conversion funnel (submitted → responded → phone screen → onsite → offer), a
per-batch table, and a **cross-criteria-set comparison** so you can see which search
profile converts best. A criteria-set filter scopes the stats. All funnel counts are
derived from each job's **current status** (so the numbers stay internally
consistent — responses can never exceed submissions).

### Setup tab (sub-tabs)
- **Criteria** — one or more screening *criteria sets* (must-haves, dealbreakers,
  comp floor, frontend-% threshold, target companies). Sets can be enabled/disabled
  (disabled = skipped in screening, config kept). Each set has a **Target persona**
  notes knowledge base + on-demand AI summary that sharpens the AI fit judgment.
- **Resume** — versioned resume content with notes, inline diff vs. any prior
  version, output templates, and PDF/Word/HTML export.
- **Templates** — resume output templates.
- **Companies** — employer entities auto-created from each job. Notes + AI summary
  feed AI screening for every job at that company. Interview review notes roll up
  here.
- **Interviews** — configurable preset interview stages (Phone screen / Hiring
  manager / Coding / Final by default) that seed each job's Interview tab. Each
  preset is its own notes knowledge base + AI summary.
- **Tone** — notes about how you want application answers to *sound*, with an
  on-demand AI summary. The summary (or raw notes) is fed into **every AI-drafted
  application answer**.

### Job detail (sub-tabs)
Overview · Screening · App Q&A · Interview · Raw JD. The summary card shows the
screening badge, a tappable **status** chip, FE %, and actions (re-screen, edit,
set phone-screen date, move to batch, delete). The **App Q&A** tab has a copy-per-
field Contact block, per-question answers (inline add/edit, no popups), and an AI
draft button on custom questions. The **Interview** tab tracks each round with dates,
questions, AI-drafted answers, and review notes that roll up to the company + matching
preset.

---

## Screening: how a job gets scored

There are three independent signals on a job:

1. **Qualified / Rejected (deterministic keyword gate)** — a job is *Qualified* only
   if it hits zero dealbreakers and passes every must-have (title seniority, role
   keyword, location, modern stack, comp floor if set, FE-% threshold if set).
2. **The badge % (graded fit, 0–100)** — a weighted desirability score (comp
   headroom, stack depth, remote preference, FE focus, target-company match, etc.).
   Qualified jobs land 50–100; rejected jobs are damped to 0–49. **The badge prefers
   Claude's AI fit % when the job has one**, falling back to this keyword score.
3. **AI fit %** — Claude's holistic judgment of how well the job matches your target
   persona, scored against every criteria set; the headline is the best-scoring set.

ATS is separate: a deterministic resume-vs-JD keyword match by default, plus an
on-demand whole-batch **AI ATS** summary.

---

## Notes knowledge bases (shared pattern)

Companies, interview presets, criteria-set personas, and tone all use the same
shape: a list of editable/deletable notes plus an on-demand **AI summary** button.
The summary (or the raw notes if you haven't summarized) is what the AI features
actually read. This lets you steer the AI over time by jotting notes rather than
re-explaining context each session.

What each one feeds:
- **Criteria persona** → AI screening fit, application answers, interview answers (for that set).
- **Company** → AI screening for jobs at that company.
- **Interview preset** → interview-answer generation for matching stages.
- **Tone** → every AI-drafted application answer.

---

## Data, sync & backup

- **Local state** lives in browser `localStorage` (key `phone_screen_app_v1`; theme
  in `phone_screen_theme_v1`). Auto-saves on every change.
- **Cross-device sync** is a private **GitHub Gist** (`phone_screen_data.json`).
  Set a `gist`-scoped token + gist ID in Settings → Cross-device sync. Auto-pushes
  ~3 s after a change; pulls on open if the gist is newer. **Tokens and gist
  credentials never sync — they stay on each device.**
- **Backup** — Export/Import JSON from Settings.
- **Lock screen** — optional Face ID / passphrase with a 90-day session.

See `DEPLOY.md` for hosting (GitHub Pages) + Gist setup, step by step.

---

## Cost shape

Deterministic work (JD heuristic parse, keyword screening, ATS matching, dashboard)
is free and runs in the browser. LLM calls are opt-in per action and use Claude
Haiku via the Cowork inference API (or your own Anthropic API key as a fallback). A
live **session-cost counter** sits in the header.

| Action | Approx. cost |
|---|---:|
| Enhance JD parse / FE-% estimate | ~$0.005 |
| AI fit (per criteria set) | ~$0.005 |
| Draft one application answer | ~$0.005 |
| Knowledge-base AI summary (company / persona / preset / tone) | ~$0.005 |
| Regenerate a job's standard Q&A | ~$0.01 |
| Whole-batch AI analysis / AI ATS | ~$0.02–0.15 |

---

## Files in this folder

```
app.html              ← the entire app (the only file deployed/committed to the public repo)
tools/validate.js     ← pre-deploy checks (node --check inline script, tag balance, getElementById vs id)
tools/deploy.sh       ← validate → commit → push app.html to the deploy repo
README.md             ← this file
DEPLOY.md             ← hosting (GitHub Pages) + GitHub Gist sync setup
Basic Info.md         ← contact info / high-level work history
*_Life_Biography.pdf      ← reference bio (large) — paths referenced in the app profile
*_Professional_Biography.pdf
data/                 ← original seed JSON (first-init reference only; live state is localStorage)
legacy/               ← the archived original CLI pipeline (screen.py, ats_score.py, etc.) + playbooks
```

This folder is a git repo whose remote is the deploy repo `github.com/haleoworld/jmc`.
A local-only exclude (`.git/info/exclude`) keeps **only `app.html`** in that public repo —
the PDFs, `Basic Info.md`, `data/`, `legacy/`, and `tools/` stay on this machine and are
never published.

Live state is in localStorage / the Gist, **not** the JSON files in `data/` — those
were only the first-run seed. To move machines, sync via Gist or Export/Import.

---

## Working on the app (for future sessions)

- **Edit `app.html` directly.** It's one file; function declarations are hoisted, so
  helpers can be defined anywhere. State migrations live in `loadState`; defaults in
  `defaultState`.
- **Deployment:** this folder is a git repo wired to `github.com/haleoworld/jmc` (public,
  branch `main`, GitHub Pages). `gh` is authenticated, so changes push directly — **no more
  copy-paste git commands.** After editing `app.html`, run **`tools/deploy.sh "message"`**:
  it validates, then commits + pushes. Live at `https://haleoworld.github.io/jmc/app.html`
  (~30s rebuild). Only `app.html` is published.
- **Validate before pushing:** `tools/validate.js` (run automatically by `deploy.sh`, or
  standalone via `node tools/validate.js`) extracts the inline `<script>` and runs
  `node --check`, confirms `<div>`/`<section>` balance, and cross-checks `getElementById`
  IDs against `id="..."`. Known-benign dynamic IDs (`__print_frame`, `__err_banner`) are
  allowlisted. **Note:** `node --check` is syntax-only — it does **not** catch runtime
  errors like temporal-dead-zone access (see the next bullet).
- **Don't run startup work at top level.** Lots of code in `app.html` executes at module
  scope. Calling a function that reads a `const`/`let` declared later in the file (e.g. the
  screening pipeline's `NEG_WINDOW`) throws "Cannot access X before initialization" — it
  bit us on 2026-06-22 (blank app for users with jobs). Make such work a hoisted `function`
  and invoke it from the **Init** section at the bottom, after all consts exist.
- **On-screen error reporter:** an uncaught error shows a red `#__err_banner` (message +
  `app.html:line:col` + stack) at the bottom of the screen — essential for debugging on
  mobile where there's no console.
- **House style:** deterministic-first, minimum LLM tokens, on-demand AI only. Notes
  knowledge bases reuse `addCompanyNote` + `noteReadHTML`. Bottom-sheet drawers
  (`showActionSheet`) for actions; inline textareas (never `prompt()` popups) for
  editing. Inputs/selects 12px, textareas 11px.

The detailed, dated change history lives in the project memory, not here.
