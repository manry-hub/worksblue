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
  openIssues: number;
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
    openIssues: 14,
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
    openIssues: 9,
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
    openIssues: 18,
  },
];
