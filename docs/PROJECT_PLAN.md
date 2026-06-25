# Stride — Project Planning Document
> Single-user productivity system. Goal → Task → Progress. Automatic.

---

## 1. Project Summary

**Name:** Stride (working title)  
**Type:** Web App + PWA (installable, internet required)  
**User:** Single user initially  
**Differentiator:** Zero-input progress tracking. User never touches a progress bar. Complete tasks and log time. System computes everything automatically.  
**Status:** DB created. User created. Nothing else yet.

---

## 2. Tech Stack — Final Decisions

| Layer | Technology | Reason |
|---|---|---|
| Backend | Django 4.x + Django REST Framework | Student knows it. Robust. Fast to build APIs. |
| Frontend | React 18 + Vite | Fast dev server. Modern tooling. |
| Database | PostgreSQL (prod) / SQLite (dev) | Relational data. JSONB for editor content. |
| Auth | djangorestframework-simplejwt | JWT tokens. Industry standard. |
| Editor | TipTap v2 | Headings, bold, bullets, checkboxes. No slash commands. Always editable. |
| Charts | Recharts | Simple. React-native. Good docs. |
| HTTP Client | Axios + TanStack React Query | React Query handles caching, loading, refetching. |
| Routing | React Router v6 | Standard. |
| Styling | TailwindCSS | Fast UI. No custom CSS rabbit holes. |
| PWA | Vite PWA Plugin | Manifest + service worker. Option A: installable only. |
| Deploy — Backend | Render.com (free tier) | Django hosting. Simple. |
| Deploy — Frontend | Vercel (free tier) | React hosting. Instant deploy from GitHub. |
| Deploy — DB | Supabase (free tier) | Managed PostgreSQL. Free. |

---

## 3. Folder Structure

```
productivity-app/
├── backend/
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py          ← shared settings
│   │   │   ├── development.py   ← debug on, local DB
│   │   │   └── production.py    ← debug off, env vars
│   │   ├── urls.py              ← root URL config
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── users/               ← auth, user model
│   │   ├── goals/               ← Goal, SubGoal models
│   │   ├── tasks/               ← Task model, backlog logic
│   │   ├── diary/               ← DiaryEntry model
│   │   ├── timelogs/            ← TimeLog model
│   │   └── analytics/           ← computed data only, no models
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │   └── manifest.json        ← PWA manifest
│   ├── src/
│   │   ├── api/                 ← all axios call functions
│   │   │   ├── goals.js
│   │   │   ├── tasks.js
│   │   │   ├── diary.js
│   │   │   ├── timelogs.js
│   │   │   └── analytics.js
│   │   ├── components/          ← reusable UI pieces
│   │   │   ├── Editor/          ← TipTap wrapper
│   │   │   ├── ProgressBar/
│   │   │   ├── TaskItem/
│   │   │   ├── GoalCard/
│   │   │   └── Navbar/
│   │   ├── pages/               ← one file per page
│   │   │   ├── Today.jsx
│   │   │   ├── Goals.jsx
│   │   │   ├── Backlog.jsx
│   │   │   ├── Diary.jsx
│   │   │   └── Analytics.jsx
│   │   ├── hooks/               ← custom React hooks
│   │   │   ├── useGoals.js
│   │   │   ├── useTasks.js
│   │   │   └── useAnalytics.js
│   │   ├── utils/               ← date helpers, formatters
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 4. Database Design

### 4.1 Tables Overview

```
User (Django built-in auth_user)
 └── Goal
      └── SubGoal
           └── Task → TimeLog
 └── Task (tasks with no goal)
 └── DiaryEntry
 └── TimeLog (manual logs direct to goal)
```

### 4.2 Table Definitions

**Goal**
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| user | FK → auth_user | |
| title | VARCHAR(255) | |
| description | JSONB | TipTap content |
| time_period | VARCHAR(20) | monthly / quarterly / semiannual / annual |
| target_hours | DECIMAL(6,2) | e.g. 50.00 |
| start_date | DATE | |
| end_date | DATE | computed from time_period + start |
| created_at | TIMESTAMP | |
| is_active | BOOLEAN | default true |

**SubGoal**
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| goal | FK → Goal | |
| title | VARCHAR(255) | |
| target_hours | DECIMAL(6,2) | |
| order | INTEGER | display order |
| completed | BOOLEAN | default false |

**Task**
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| user | FK → auth_user | |
| title | VARCHAR(255) | short label |
| content | JSONB | TipTap rich content, nullable |
| date | DATE | scheduled day |
| completed | BOOLEAN | default false |
| completed_at | TIMESTAMP | null until completed |
| goal | FK → Goal | nullable |
| subgoal | FK → SubGoal | nullable |
| estimated_hours | DECIMAL(4,2) | nullable |
| created_at | TIMESTAMP | |

**TimeLog**
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| user | FK → auth_user | |
| goal | FK → Goal | |
| hours | DECIMAL(4,2) | |
| date | DATE | |
| note | TEXT | nullable |
| source | VARCHAR(20) | task_auto or manual |
| task | FK → Task | nullable, set when source=task_auto |

**DiaryEntry**
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| user | FK → auth_user | |
| date | DATE | one entry per day |
| content | JSONB | TipTap content |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 4.3 Analytics — No Separate Table

All analytics computed from above tables at query time:

- **Streak** = consecutive days where at least one task completed
- **Weekly completion %** = tasks completed this week / tasks scheduled this week
- **Goal progress %** = SUM(timelogs.hours WHERE goal=X) / goal.target_hours × 100
- **Time per goal this week** = GROUP BY goal, SUM hours WHERE date in this week
- **Daily time logged** = SUM hours GROUP BY date

---

## 5. Backend Modules — Django Apps

### 5.1 users app

Responsibilities:
- Custom user model (extend AbstractUser)
- Register endpoint
- Login endpoint (returns JWT)
- Token refresh endpoint
- Get current user endpoint

API Endpoints:
```
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/refresh/
GET  /api/auth/me/
```

### 5.2 goals app

Responsibilities:
- CRUD for Goal
- CRUD for SubGoal
- Goal progress calculation (read from timelogs)

API Endpoints:
```
GET    /api/goals/
POST   /api/goals/
GET    /api/goals/:id/
PUT    /api/goals/:id/
DELETE /api/goals/:id/
GET    /api/goals/:id/progress/     ← computed progress
POST   /api/goals/:id/subgoals/
PUT    /api/goals/:id/subgoals/:sid/
DELETE /api/goals/:id/subgoals/:sid/
```

### 5.3 tasks app

Responsibilities:
- CRUD for Task
- Mark task complete (triggers TimeLog creation if estimated_hours set)
- Backlog query (tasks with date < today AND completed=false)
- Reschedule task

API Endpoints:
```
GET    /api/tasks/                  ← filter by date, goal, completed
POST   /api/tasks/
GET    /api/tasks/:id/
PUT    /api/tasks/:id/
DELETE /api/tasks/:id/
POST   /api/tasks/:id/complete/     ← marks complete + auto creates timelog
POST   /api/tasks/:id/reschedule/   ← moves to new date
GET    /api/tasks/backlog/          ← all overdue incomplete tasks
```

### 5.4 diary app

Responsibilities:
- One diary entry per day per user
- Create or update (upsert by date)

API Endpoints:
```
GET  /api/diary/                    ← list all entries
GET  /api/diary/:date/              ← get entry for specific date
POST /api/diary/                    ← create or update for today
PUT  /api/diary/:date/              ← update specific date
```

### 5.5 timelogs app

Responsibilities:
- Manual time log entries
- List logs by goal or date range

API Endpoints:
```
GET    /api/timelogs/               ← filter by goal, date range
POST   /api/timelogs/               ← manual log
DELETE /api/timelogs/:id/
```

### 5.6 analytics app

Responsibilities:
- No models
- Reads from all other apps
- Returns computed stats

API Endpoints:
```
GET /api/analytics/summary/         ← streak, weekly %, total hours
GET /api/analytics/goal-progress/   ← all goals with hours logged
GET /api/analytics/weekly-chart/    ← hours per day this week
GET /api/analytics/time-by-goal/    ← hours per goal this week
```

---

## 6. Frontend Modules — React Pages

### 6.1 Today Page (`/today`)

Layout:
```
[Date Header — Monday, 15 June]
[TipTap Editor — free planning area, always editable]
─────────────────────────────────
[Tasks for Today]
  ☐ Study PyTorch tensors        2hr  [Goal: PyTorch]
  ☑ Read chapter 3               1hr  [Goal: PyTorch]
  ☐ Write project report
  [+ Add Task]
─────────────────────────────────
[Time Logged Today: 1hr / 3hr estimated]
```

Features:
- TipTap editor at top. Always editable. No edit button.
- Task list below. Checkbox to complete.
- Completing task with estimated_hours auto-logs time to linked goal.
- Add task inline. Type title, pick date (defaults today), optionally link goal, set hours.

### 6.2 Goals Page (`/goals`)

Layout:
```
[+ New Goal]

[PyTorch — 3 months]
████████░░░░░░░  17% — 8.5hr / 50hr
  Sub-goal 1: Finish basics        ████░░  10hr target
  Sub-goal 2: Build first model    ░░░░░░  15hr target
  [Description — TipTap editor]
  [Log Time Manually]

[Build Portfolio Site — monthly]
██████████████░  90% — 9hr / 10hr
```

Features:
- Progress bars auto-calculated from TimeLogs.
- Expandable goal cards.
- Sub-goals listed inside card.
- TipTap description editor per goal.
- Manual time log button.
- Time period badge (monthly / quarterly / etc).

### 6.3 Backlog Page (`/backlog`)

Layout:
```
[Overdue Tasks — 4 items]

[Write report]       was scheduled: 10 June  [Reschedule] [Complete] [Delete]
[Read chapter 4]     was scheduled: 8 June   [Reschedule] [Complete] [Delete]
```

Features:
- Auto-populated. No manual add here.
- Reschedule opens date picker.
- Complete marks done from backlog.

### 6.4 Diary Page (`/diary`)

Layout:
```
[← 14 June]   [Today — 15 June]   [16 June →]

[TipTap editor — full page, always editable]
Auto-saved every 30 seconds.
```

Features:
- One entry per day.
- Navigate between days with arrows.
- TipTap editor. Always editable.
- Auto-save (debounced).

### 6.5 Analytics Page (`/analytics`)

Layout:
```
[Streak: 7 days 🔥]   [This Week: 68%]   [Hours This Week: 6.5hr]

[Weekly Completion — Bar Chart]
Mon  Tue  Wed  Thu  Fri  Sat  Sun
 80%  60%  100%  0%  50%  —    —

[Time Per Goal This Week — Bar Chart]
PyTorch         ████████ 4hr
Portfolio Site  ████ 2hr
General         ██ 0.5hr

[Goal Progress Bars]
PyTorch              ████████░░░░  17%
Portfolio Site       ██████████░░  90%
```

Features:
- Streak counter.
- Weekly completion percentage.
- Bar chart: daily completion % this week.
- Bar chart: hours per goal this week.
- Goal progress bars.
- All data from /api/analytics/ endpoints.

---

## 7. Key Technical Concepts To Learn

### Django / Backend

| Concept | Where Used | Priority |
|---|---|---|
| Django apps structure | All apps | Week 1 |
| Custom user model | users app | Week 1 |
| DRF Serializers | All APIs | Week 2 |
| DRF ViewSets | All APIs | Week 2 |
| JWT with simplejwt | Auth | Week 2 |
| django-cors-headers | CORS | Week 1 |
| JSONB field in Django | Task, Goal, Diary | Week 3 |
| Django signals | Auto TimeLog on task complete | Week 5 |
| Aggregation queries | Analytics | Week 8 |
| Split settings files | base/dev/prod | Week 1 |
| Environment variables (.env) | Production settings | Week 11 |

### React / Frontend

| Concept | Where Used | Priority |
|---|---|---|
| React Router v6 | Navigation | Week 3 |
| TanStack React Query | All data fetching | Week 3 |
| Axios instance with JWT header | All API calls | Week 2 |
| TipTap setup + extensions | Editor | Week 4 |
| TipTap auto-save (debounce) | Diary, Today | Week 4 |
| Recharts BarChart | Analytics | Week 8 |
| Custom hooks | useGoals, useTasks | Week 4 |
| Tailwind responsive design | All pages | Week 3 |
| React Query mutations | Create/update/delete | Week 3 |
| Vite PWA plugin | PWA manifest | Week 11 |

---

## 8. Week-by-Week Roadmap

### Phase 1 — Foundation (Weeks 1–3)

**Week 1 — Project Setup (5–6 hrs)**
- Create folder structure
- Django project with split settings
- PostgreSQL connection
- React + Vite setup
- TailwindCSS
- Git repository initialized
- Django + React both run locally

**Week 2 — Authentication (5–6 hrs)**
- Custom user model in users app
- Register + Login API
- JWT token endpoints
- React login/register page
- Axios instance with token in headers
- Protected route in React Router
- Test: login from React, get token, call protected endpoint

**Week 3 — Goals CRUD (5–6 hrs)**
- Goal model + migrations
- SubGoal model + migrations
- Goals API endpoints (CRUD)
- Goals page in React
- Create goal form
- List goals with placeholder progress bar

### Phase 2 — Core Features (Weeks 4–7)

**Week 4 — TipTap Editor + Diary (5–6 hrs)**
- TipTap setup with extensions (headings, bullets, checkboxes)
- TipTap component reusable
- Diary model + API
- Diary page with navigation between days
- Auto-save with debounce

**Week 5 — Tasks (5–6 hrs)**
- Task model + migrations
- Task API (CRUD + complete endpoint)
- Today page: task list
- Add task inline
- Mark complete — checkbox
- Django signal: on complete, create TimeLog if hours set

**Week 6 — Time Logs + Goal Progress (5–6 hrs)**
- TimeLog model + migrations
- TimeLog API
- Manual log time on Goals page
- Goal progress bar now live (reads from TimeLogs)
- SubGoal progress

**Week 7 — Backlog (5–6 hrs)**
- Backlog API endpoint (overdue incomplete tasks)
- Backlog page
- Reschedule task
- Complete from backlog

### Phase 3 — Analytics + Polish (Weeks 8–10)

**Week 8 — Analytics API (5–6 hrs)**
- Analytics Django app
- Streak calculation
- Weekly completion %
- Hours per goal this week
- Daily hours this week
- All endpoints tested

**Week 9 — Analytics Dashboard UI (5–6 hrs)**
- Analytics page
- Recharts bar charts
- Streak display
- Goal progress bars
- Wire up to API

**Week 10 — Today Page TipTap + Polish (5–6 hrs)**
- TipTap editor on Today page (planning area)
- Mobile responsive check all pages
- Fix UI inconsistencies
- Loading states on all data fetches
- Error handling

### Phase 4 — Deploy + Finish (Weeks 11–12)

**Week 11 — Deployment (5–6 hrs)**
- Supabase: production PostgreSQL
- Render.com: deploy Django backend
- Vercel: deploy React frontend
- Environment variables set
- CORS configured for production
- PWA manifest + icons
- End-to-end test on deployed version

**Week 12 — Buffer + Portfolio Polish**
- Fix bugs found on deployment
- Write README with screenshots
- Record short demo video
- Write portfolio writeup
- Done

---

## 9. Time Budget

| Phase | Weeks | Hours | Deliverable |
|---|---|---|---|
| Foundation | 1–3 | 15–18 | Auth + Goals working |
| Core Features | 4–7 | 20–24 | Tasks, Diary, TimeLogs, Backlog |
| Analytics + Polish | 8–10 | 15–18 | Dashboard live |
| Deploy + Finish | 11–12 | 10–12 | Live URL |
| **Total** | **12** | **~60–72 hrs** | **Complete product** |

---

## 10. What Makes This Resume-Worthy

| Point | Why It Matters |
|---|---|
| Full-stack end-to-end | Django API + React SPA — shows both sides |
| JWT Auth | Industry standard security |
| JSONB in PostgreSQL | Shows DB knowledge beyond basic SQL |
| Auto progress tracking | Non-trivial business logic |
| Django signals | Event-driven backend pattern |
| React Query | Professional data fetching pattern |
| Deployed live | Can show URL to recruiter immediately |
| PWA installable | Shows awareness of modern web standards |
| TipTap integration | Complex third-party library integration |
| Analytics aggregation queries | Backend data processing |

---

## 11. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| TipTap harder than expected | Limit extensions. Only 6 types. No extras. |
| Analytics queries slow | Keep scope small. No heatmap in MVP. |
| Deployment breaks | Deploy early (Week 11). Not last day. |
| Feature creep | This document is the lock. Add nothing not here. |
| PWA complexity | Option A only. Installable. No offline sync. |
| Time underrun | Week 12 is buffer. Use it. |

---

## 12. MVP Definition — What Ships

**Must have:**
- Login / Register
- Goals with SubGoals and progress bars
- Tasks with date, goal link, estimated hours
- Auto TimeLog when task completed
- Manual TimeLog on goal
- Diary with TipTap editor
- Backlog page
- Analytics page (streak, weekly %, charts)
- Deployed live URL

**Postpone after MVP:**
- GitHub-style heatmap
- Multi-user support
- Offline sync (PWA Option C)
- Email notifications
- Export data
- Dark mode

---

*Document version: 1.0 — Created at project start. Update as decisions change.*
