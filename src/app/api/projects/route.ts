import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/blob-db";
import { projects as initialMockProjects } from "@/data/dashboard";

export const dynamic = "force-dynamic";

const DB_FILE = "projects.json";

// GET all projects
export async function GET() {
  try {
    const seedData = initialMockProjects.map(p => ({
      ...p,
      progress: 0,
      createdAt: new Date().toISOString()
    }));
    
    const parsed = await readDB(DB_FILE, seedData);
    
    const withColumns = parsed.map((p: Record<string, unknown>) => ({
      ...p,
      columns: p.columns || [
        { id: "todo", title: "To Do", order: 0, wipLimit: null },
        { id: "in-progress", title: "In Progress", order: 1, wipLimit: null },
        { id: "testing", title: "Testing", order: 2, wipLimit: null },
        { id: "done", title: "Done", order: 3, wipLimit: null },
        { id: "failed", title: "Failed", order: 4, wipLimit: null },
      ],
      priorities: p.priorities || [
        { id: "critical", name: "Critical", color: "bg-red-500", order: 0 },
        { id: "high", name: "High", color: "bg-orange-500", order: 1 },
        { id: "medium", name: "Medium", color: "bg-yellow-500", order: 2 },
        { id: "low", name: "Low", color: "bg-green-500", order: 3 },
      ],
      labels: p.labels || [
        { id: "bug", name: "Bug", color: "bg-red-500" },
        { id: "feature", name: "Feature", color: "bg-blue-500" },
        { id: "documentation", name: "Documentation", color: "bg-gray-500" },
        { id: "enhancement", name: "Enhancement", color: "bg-purple-500" },
        { id: "research", name: "Research", color: "bg-teal-500" },
      ],
      estimateUnit: p.estimateUnit || "hour",
      issueNumberPrefix: p.issueNumberPrefix || "ISSUE-",
      sprintSettings: p.sprintSettings || {
        defaultDurationWeeks: 2,
        workingDays: [1, 2, 3, 4, 5],
        autoCloseSprint: false,
        sprintPrefix: "SPRINT-"
      }
    }));
    
    return NextResponse.json(withColumns);
  } catch {
    return NextResponse.json({ error: "Failed to read projects" }, { status: 500 });
  }
}

// POST a new project
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newProject = {
      ...body,
      id: `proj-${Math.random().toString(36).substr(2, 9)}`,
      progress: 0,
      openIssues: 0,
      version: "1.0.0",
      createdAt: new Date().toISOString(),
      repository: body.repository,
      deadline: body.deadline,
      liveEnvironment: body.liveEnvironment,
      figmaDesign: body.figmaDesign,
      columns: [
        { id: "todo", title: "To Do", order: 0, wipLimit: null },
        { id: "in-progress", title: "In Progress", order: 1, wipLimit: null },
        { id: "testing", title: "Testing", order: 2, wipLimit: null },
        { id: "done", title: "Done", order: 3, wipLimit: null },
        { id: "failed", title: "Failed", order: 4, wipLimit: null },
      ],
      priorities: [
        { id: "critical", name: "Critical", color: "bg-red-500", order: 0 },
        { id: "high", name: "High", color: "bg-orange-500", order: 1 },
        { id: "medium", name: "Medium", color: "bg-yellow-500", order: 2 },
        { id: "low", name: "Low", color: "bg-green-500", order: 3 },
      ],
      labels: [
        { id: "bug", name: "Bug", color: "bg-red-500" },
        { id: "feature", name: "Feature", color: "bg-blue-500" },
        { id: "documentation", name: "Documentation", color: "bg-gray-500" },
        { id: "enhancement", name: "Enhancement", color: "bg-purple-500" },
        { id: "research", name: "Research", color: "bg-teal-500" },
      ],
      estimateUnit: "hour",
      issueNumberPrefix: "ISSUE-",
      sprintSettings: {
        defaultDurationWeeks: 2,
        workingDays: [1, 2, 3, 4, 5],
        autoCloseSprint: false,
        sprintPrefix: "SPRINT-"
      }
    };

    const projects = await readDB(DB_FILE);
    projects.push(newProject);
    
    await writeDB(DB_FILE, projects);
    
    return NextResponse.json(newProject, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
