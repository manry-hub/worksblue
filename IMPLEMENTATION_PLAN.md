# Implementation Plan: Development Module (Scrumban - Jira Style)

## Navigation Structure (Jira-style)

```
Project
├── Overview
├── Backlog          ← Sprint management + Product Backlog
├── Board            ← Kanban for Active Sprint only
├── Reports          ← Sprint metrics (velocity, burndown, etc.)
└── Configuration    ← Workflow, Columns, WIP, Priorities, Labels, Estimation
```

---

## Phase 1: Sprint Entity & API (Foundation) ✅ DONE

**Files created:**
| File | Purpose |
|------|---------|
| `src/types/sprint.ts` | Sprint, SprintStatus, SprintSettings, ProjectConfig types |
| `src/store/sprint-store.ts` | Zustand store (fetch, CRUD, start/complete/cancel, assign tasks) |
| `src/app/api/projects/[id]/sprints/route.ts` | GET (list), POST (create) |
| `src/app/api/projects/[id]/sprints/[sprintId]/route.ts` | GET, PATCH, DELETE |
| `src/app/api/projects/[id]/sprints/[sprintId]/start/route.ts` | POST - start sprint |
| `src/app/api/projects/[id]/sprints/[sprintId]/complete/route.ts` | POST - complete sprint |
| `src/app/api/projects/[id]/sprints/[sprintId]/cancel/route.ts` | POST - cancel sprint |
| `src/app/api/projects/[id]/sprints/[sprintId]/tasks/route.ts` | PATCH - bulk assign tasks to sprint |

**Storage:** `.worksblue/sprints-{projectId}.json`

**Extended Task type:** Added `sprintId`, `estimate`, `reporter`, `checklist[]`, `attachments[]`, `comments[]`, `activity[]`

---

## Phase 2: Backlog Page - Sprint Management Center (REPLACES Sprint Pages)

**Route:** `src/app/projects/[id]/backlog/page.tsx` (ENHANCE existing)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ BACKLOG                                                     │
├─────────────────────────────────────────────────────────────┤
│ [Create Sprint]  [Filter]  [Search]  [Bulk Actions ▼]       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ SPRINT 3 (Active) ──────────────────────────────────┐  │
│  │ Goal: Complete Authentication Module                  │  │
│  │ 📅 Jul 1 - Jul 14  |  🎯 65%  |  8/12 tasks  [Start]  │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ ☐ Task A - High  |  ☐ Task B - Medium  |  ☐ Task C   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ SPRINT 4 (Planned) ─────────────────────────────────┐  │
│  │ Goal: Dashboard UI                                    │  │
│  │ 📅 Jul 15 - Jul 28  |  📋 5 tasks  [Start] [Edit] [🗑] │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ ☐ Task D  |  ☐ Task E                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ BACKLOG ────────────────────────────────────────────┐  │
│  │ 12 unscheduled tasks                                   │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ ☐ Task F - Bug    |  ☐ Task G - Feature  |  ☐ Task H  │  │
│  │ ☐ Task I - Tech Debt  |  ☐ Task J  |  ☐ Task K       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Features in Backlog:**
- **Sprint List**: Each sprint shows goal, dates, progress, task count
- **Sprint Actions**: Start, Complete, Cancel, Edit, Delete (per sprint)
- **Create Sprint** modal (name, goal, dates)
- **Drag tasks** between Backlog ↔ Sprint ↔ Sprint
- **Bulk select** tasks → Move to Sprint / Set Priority / Add Labels / Delete
- **Search/Filter** by priority, labels, assignee
- **Reorder sprints** (drag sprint headers)
- **Reorder tasks** within sprint

**Component:** `SprintSection` (collapsible sprint container with header + task list)

---

## Phase 3: Board Page - Active Sprint Kanban

**Route:** `src/app/projects/[id]/kanban/page.tsx` (ENHANCE existing)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ BOARD                                    [Sprint 3 ▼]       │
├─────────────────────────────────────────────────────────────┤
│ [All] [Hilman] [Others]                          [+ Task]   │
├──────────┬────────────┬─────────────┬────────┬────────────┤
│ BACKLOG  │   READY    │ IN PROGRESS │ REVIEW │    DONE    │
│ (hidden) │  WIP: 2/3  │  WIP: 1/2   │ WIP:1/2│            │
├──────────┼────────────┼─────────────┼────────┼────────────┤
│          │ Task A     │ Task C      │ Task D │ Task E     │
│          │ Task B     │             │        │ Task F     │
│          │            │             │        │            │
│          │ [+ Add]    │ [+ Add]     │ [+ Add]│ [+ Add]    │
└──────────┴────────────┴─────────────┴────────┴────────────┘
```

**Features:**
- **Sprint Selector** (dropdown): Only shows Active sprint + "No Sprint"
- **WIP Limits** on column headers (from Configuration)
- **Visual warning** when WIP exceeded (red badge "WIP Limit Reached")
- **Drag & Drop** between columns (updates task status)
- **Quick Add Task** per column
- **Task Cards** show: priority, assignee, labels, estimate, due date
- **Click Task** → Task Details Modal

---

## Phase 4: Reports Page

**Route:** `src/app/projects/[id]/reports/page.tsx` (NEW)

**Charts (using recharts):**
| Chart | Data Source |
|-------|-------------|
| Velocity Chart | Completed story points per sprint (bar) |
| Sprint Burndown | Ideal vs actual remaining per day (line) |
| Throughput | Tasks completed per week (bar) |
| Lead Time | Avg days: created → done (scatter/bar) |
| Cycle Time | Avg days: in-progress → done (scatter/bar) |
| Task Status Distribution | Pie: todo/ready/in-progress/review/done |
| Priority Distribution | Stacked bar by priority |

**Sprint Selector:** Dropdown to pick completed sprint (defaults to latest)

---

## Phase 5: Configuration Page

**Route:** `src/app/projects/[id]/configuration/page.tsx` (NEW)

**Tabs:**
1. **Workflow** - Columns: add/edit/delete/reorder, set WIP limit per column
2. **Priorities** - CRUD: Critical/High/Medium/Low + colors
3. **Labels** - CRUD: Bug/Feature/Docs/Enhancement/Research + colors
4. **Estimation** - Unit (Hour/Day), Task prefix (TASK-)
5. **Sprint Settings** - Default duration (1/2/3/4 weeks), Working days, Auto-close

**API:** Extend `PATCH /api/projects/[id]` to save config

---

## Phase 6: Task Enhancements (Progressive)

- Checklist in Task Details Modal
- Comments thread
- Attachments (use existing `/api/upload`)
- Activity log (auto on changes)
- Estimate field
- Reporter field

---

## Phase 7: Backlog Power Features

- Full-text search
- Multi-select filters (priority, labels, assignee, sprint)
- Sort options
- Bulk actions toolbar

---

## Execution Order (Revised)

1. ✅ **Phase 1** - Sprint Entity & API
2. 🔄 **Phase 2** - Backlog Page with Sprint Management (replace sprint pages)
3. 🔄 **Phase 3** - Board Page with Sprint Selector + WIP
4. 🔄 **Phase 4** - Reports Page
5. 🔄 **Phase 5** - Configuration Page
6. **Phase 6** - Task Enhancements
7. **Phase 7** - Backlog Power Features

---

## Files to Remove

- `src/app/projects/[id]/sprints/page.tsx`
- `src/app/projects/[id]/sprints/[sprintId]/page.tsx`
- `src/components/sprints/` (all sprint-specific components)

---

## Dependencies to Add

```bash
pnpm add recharts
pnpm add -D @types/recharts
```