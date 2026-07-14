export type ProjectStatus = "On track" | "At risk" | "Planning";

export type Project = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  version: string;
  deadline: string;
  stack: string[];
  openTasks: number;
};

export type Activity = {
  id: string;
  title: string;
  detail: string;
  time: string;
  kind: "task" | "document" | "release" | "bug";
};

export type Deadline = {
  id: string;
  title: string;
  project: string;
  date: string;
  urgency: "normal" | "soon" | "overdue";
};

export type LifecycleStage = {
  name: string;
  progress: number;
  state: "complete" | "active" | "upcoming";
};

export const projects: Project[] = [
  {
    id: "worksblue",
    name: "WorksBlue",
    description: "Developer workspace untuk planning, delivery, dan dokumentasi project.",
    status: "On track",
    progress: 68,
    version: "v1.0.0",
    deadline: "2026-08-04T09:00:00Z",
    stack: ["Next.js", "TypeScript", "Astryx"],
    openTasks: 14,
  },
  {
    id: "atlas-api",
    name: "Atlas API",
    description: "API gateway dan service observability untuk platform internal.",
    status: "At risk",
    progress: 43,
    version: "v0.8.2",
    deadline: "2026-07-21T09:00:00Z",
    stack: ["Node.js", "PostgreSQL", "Docker"],
    openTasks: 9,
  },
  {
    id: "launchpad",
    name: "Launchpad",
    description: "Starter kit deployment dan release checklist untuk solo developer.",
    status: "Planning",
    progress: 21,
    version: "v0.2.0",
    deadline: "2026-09-12T09:00:00Z",
    stack: ["React", "GitHub Actions", "Vercel"],
    openTasks: 18,
  },
];

export const activities: Activity[] = [
  {
    id: "activity-1",
    title: "Dashboard shell selesai",
    detail: "WorksBlue · Implementation",
    time: "2026-07-13T08:42:00Z",
    kind: "task",
  },
  {
    id: "activity-2",
    title: "Acceptance criteria diperbarui",
    detail: "Atlas API · Requirements",
    time: "2026-07-13T06:15:00Z",
    kind: "document",
  },
  {
    id: "activity-3",
    title: "v0.8.2 dipublikasikan",
    detail: "Atlas API · Release",
    time: "2026-07-12T16:30:00Z",
    kind: "release",
  },
  {
    id: "activity-4",
    title: "Bug login dicatat",
    detail: "Launchpad · Testing",
    time: "2026-07-11T11:20:00Z",
    kind: "bug",
  },
];

export const deadlines: Deadline[] = [
  {
    id: "deadline-1",
    title: "Integration testing",
    project: "Atlas API",
    date: "2026-07-16T09:00:00Z",
    urgency: "soon",
  },
  {
    id: "deadline-2",
    title: "MVP feature freeze",
    project: "WorksBlue",
    date: "2026-07-24T09:00:00Z",
    urgency: "normal",
  },
  {
    id: "deadline-3",
    title: "Release candidate",
    project: "WorksBlue",
    date: "2026-08-01T09:00:00Z",
    urgency: "normal",
  },
];

export const lifecycle: LifecycleStage[] = [
  { name: "Idea", progress: 100, state: "complete" },
  { name: "Planning", progress: 100, state: "complete" },
  { name: "Requirements", progress: 100, state: "complete" },
  { name: "Design", progress: 84, state: "active" },
  { name: "Implementation", progress: 56, state: "active" },
  { name: "Testing", progress: 18, state: "active" },
  { name: "Deployment", progress: 0, state: "upcoming" },
];
