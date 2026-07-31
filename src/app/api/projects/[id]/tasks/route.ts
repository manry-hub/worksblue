import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/blob-db";

export const dynamic = "force-dynamic";

const PROJECTS_FILE = "projects.json";

async function syncProjectStats(projectId: string, tasks: { status: string }[]) {
  try {
    const projects = await readDB(PROJECTS_FILE, []);
    const index = projects.findIndex((p: { id: string }) => p.id === projectId);
    
    if (index !== -1) {
      const backlogTasksCount = tasks.filter(t => t.status === "backlog").length;
      const doneTasksCount = tasks.filter(t => t.status === "done").length;
      const boardTasksCount = tasks.filter(t => t.status !== "backlog" && t.status !== "failed").length;
      const progress = boardTasksCount > 0 ? Math.round((doneTasksCount / boardTasksCount) * 100) : 0;
      
      projects[index].openIssues = backlogTasksCount;
      projects[index].totalIssues = boardTasksCount;
      projects[index].progress = progress;
      
      await writeDB(PROJECTS_FILE, projects);
    }
  } catch (e) {
    console.error("Failed to sync project stats", e);
  }
}

// GET all tasks for a project
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const dbFile = `tasks-${params.id}.json`;
  try {
    const tasks = await readDB(dbFile, []);
    return NextResponse.json(tasks);
  } catch (error: unknown) {
    console.error("GET project tasks error:", error);
    return NextResponse.json({ error: "Failed to read tasks", details: (error as Error).message }, { status: 500 });
  }
}

// POST a new task
export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const dbFile = `tasks-${params.id}.json`;
  try {
    const body = await request.json();
    
    // Generate sequential ID
    const projects = await readDB(PROJECTS_FILE, []);
    const index = projects.findIndex((p: { id: string }) => p.id === params.id);
    
    let newId = `issue-${Math.random().toString(36).substr(2, 9)}`;
    if (index !== -1) {
      const project = projects[index];
      const nextCounter = (project.lastIssueCounter || 0) + 1;
      project.lastIssueCounter = nextCounter;
      await writeDB(PROJECTS_FILE, projects);
      
      const prefix = project.issueNumberPrefix || "ISSUE-";
      newId = `${prefix}${nextCounter}`;
    }

    const newTask = {
      ...body,
      id: newId,
      projectId: params.id,
      labels: body.labels || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const tasks = await readDB(dbFile, []);
    tasks.push(newTask);
    
    await writeDB(dbFile, tasks);
    await syncProjectStats(params.id, tasks);
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error: unknown) {
    console.error("POST project task error:", error);
    return NextResponse.json({ error: "Failed to create task", details: (error as Error).message }, { status: 500 });
  }
}

// PATCH to update existing tasks (bulk update for sorting/moving)
export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const dbFile = `tasks-${params.id}.json`;
  try {
    // Expect an array of updated tasks
    const updatedTasks = await request.json();
    
    // We simply overwrite the entire file with the new array to save order and status
    await writeDB(dbFile, updatedTasks);
    await syncProjectStats(params.id, updatedTasks);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("PATCH project tasks bulk error:", error);
    return NextResponse.json({ error: "Failed to update tasks", details: (error as Error).message }, { status: 500 });
  }
}
