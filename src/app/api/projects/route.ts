import { NextResponse } from "next/server";
import { readDB, mutateDB } from "@/lib/blob-db";
import { projects as initialMockProjects } from "@/data/dashboard";
import { projectSchema } from "@/lib/validations";

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
    const rawBody = await request.json();
    const parseResult = projectSchema.safeParse(rawBody);
    
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid data", details: parseResult.error.format() }, { status: 400 });
    }
    
    const body = parseResult.data;
    const newProject = {
      ...body,
      id: `proj-${Math.random().toString(36).substr(2, 9)}`,
      progress: 0,
      openIssues: 0,
      version: "1.0.0",
      createdAt: new Date().toISOString(),
      columns: body.columns || [
        { id: "todo", title: "To Do", order: 0, wipLimit: null },
        { id: "in-progress", title: "In Progress", order: 1, wipLimit: null },
        { id: "testing", title: "Testing", order: 2, wipLimit: null },
        { id: "done", title: "Done", order: 3, wipLimit: null },
        { id: "failed", title: "Failed", order: 4, wipLimit: null },
      ],
      priorities: body.priorities || [
        { id: "critical", name: "Critical", color: "bg-red-500", order: 0 },
        { id: "high", name: "High", color: "bg-orange-500", order: 1 },
        { id: "medium", name: "Medium", color: "bg-yellow-500", order: 2 },
        { id: "low", name: "Low", color: "bg-green-500", order: 3 },
      ],
      labels: body.labels || [
        { id: "bug", name: "Bug", color: "bg-red-500" },
        { id: "feature", name: "Feature", color: "bg-blue-500" },
        { id: "documentation", name: "Documentation", color: "bg-gray-500" },
        { id: "enhancement", name: "Enhancement", color: "bg-purple-500" },
        { id: "research", name: "Research", color: "bg-teal-500" },
      ],
      estimateUnit: body.estimateUnit || "hour",
      issueNumberPrefix: body.issueNumberPrefix || "ISSUE-",
      sprintSettings: body.sprintSettings || {
        defaultDurationWeeks: 2,
        workingDays: [1, 2, 3, 4, 5],
        autoCloseSprint: false,
        sprintPrefix: "SPRINT-"
      }
    };

    await mutateDB(DB_FILE, (projects: Record<string, unknown>[]) => {
      return [...projects, newProject];
    }, []);
    
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("POST project error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
