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
    
    // Backward compatibility for existing projects without columns
    const withColumns = parsed.map((p: { id: string; columns?: { id: string; title: string }[] }) => ({
      ...p,
      columns: p.columns || [
        { id: "todo", title: "To Do" },
        { id: "in-progress", title: "In Progress" },
        { id: "testing", title: "Testing" },
        { id: "done", title: "Done" },
        { id: "failed", title: "Failed" },
      ]
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
      openTasks: 0,
      version: "1.0.0",
      createdAt: new Date().toISOString(),
      repository: body.repository,
      deadline: body.deadline,
      liveEnvironment: body.liveEnvironment,
      figmaDesign: body.figmaDesign,
      columns: [
        { id: "todo", title: "To Do" },
        { id: "in-progress", title: "In Progress" },
        { id: "testing", title: "Testing" },
        { id: "done", title: "Done" },
        { id: "failed", title: "Failed" },
      ],
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
