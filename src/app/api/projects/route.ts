import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { projects as initialMockProjects } from "@/data/dashboard";

export const dynamic = "force-dynamic";

const DB_DIR = path.join(process.cwd(), ".worksblue");
const DB_FILE = path.join(DB_DIR, "projects.json");

// Helper to initialize DB if it doesn't exist
async function initDB() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    try {
      await fs.access(DB_FILE);
    } catch {
      // File doesn't exist, seed with initial mock data
      const seedData = initialMockProjects.map(p => ({
        progress: 0,
        createdAt: new Date().toISOString()
      }));
      await fs.writeFile(DB_FILE, JSON.stringify(seedData, null, 2));
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}

// GET all projects
export async function GET() {
  await initDB();
  try {
    const data = await fs.readFile(DB_FILE, "utf-8");
    const parsed = JSON.parse(data);
    
    const withColumns = parsed.map((p: { 
      id: string; 
      columns?: { id: string; title: string; order: number; wipLimit: number | null }[]; 
      priorities?: { id: string; name: string; color: string; order: number }[]; 
      labels?: { id: string; name: string; color: string }[]; 
      estimateUnit?: "hour" | "day"; 
      issueNumberPrefix?: string; 
      sprintSettings?: { defaultDurationWeeks: number; workingDays: number[]; autoCloseSprint: boolean; sprintPrefix: string };
    }) => ({
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
  await initDB();
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

    const data = await fs.readFile(DB_FILE, "utf-8");
    const projects = JSON.parse(data);
    projects.push(newProject);
    
    await fs.writeFile(DB_FILE, JSON.stringify(projects, null, 2));
    
    return NextResponse.json(newProject, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
