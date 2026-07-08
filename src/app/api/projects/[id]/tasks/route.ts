import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const DB_DIR = path.join(process.cwd(), ".worksblue");
const PROJECTS_FILE = path.join(DB_DIR, "projects.json");

async function syncProjectStats(projectId: string, tasks: any[]) {
  try {
    const data = await fs.readFile(PROJECTS_FILE, "utf-8");
    const projects = JSON.parse(data);
    const index = projects.findIndex((p: any) => p.id === projectId);
    
    if (index !== -1) {
      const backlogTasksCount = tasks.filter(t => t.status === "backlog").length;
      const doneTasksCount = tasks.filter(t => t.status === "done").length;
      const boardTasksCount = tasks.filter(t => t.status !== "backlog" && t.status !== "failed").length;
      const progress = boardTasksCount > 0 ? Math.round((doneTasksCount / boardTasksCount) * 100) : 0;
      
      projects[index].openTasks = backlogTasksCount;
      projects[index].totalTasks = boardTasksCount;
      projects[index].progress = progress;
      
      await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    }
  } catch (e) {
    console.error("Failed to sync project stats", e);
  }
}

async function getDbFile(projectId: string) {
  await fs.mkdir(DB_DIR, { recursive: true });
  return path.join(DB_DIR, `tasks-${projectId}.json`);
}

// Ensure the DB exists, seed if necessary
async function initTaskDB(projectId: string) {
  const dbFile = await getDbFile(projectId);
  try {
    await fs.access(dbFile);
  } catch {
    // Seed with empty array
    await fs.writeFile(dbFile, JSON.stringify([], null, 2));
  }
  return dbFile;
}

// GET all tasks for a project
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const dbFile = await initTaskDB(params.id);
  try {
    const data = await fs.readFile(dbFile, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ error: "Failed to read tasks" }, { status: 500 });
  }
}

// POST a new task
export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const dbFile = await initTaskDB(params.id);
  try {
    const body = await request.json();
    const newTask = {
      ...body,
      id: `task-${Math.random().toString(36).substr(2, 9)}`,
      projectId: params.id,
      labels: body.labels || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const data = await fs.readFile(dbFile, "utf-8");
    const tasks = JSON.parse(data);
    tasks.push(newTask);
    
    await fs.writeFile(dbFile, JSON.stringify(tasks, null, 2));
    await syncProjectStats(params.id, tasks);
    
    return NextResponse.json(newTask, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

// PATCH to update existing tasks (bulk update for sorting/moving)
export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const dbFile = await initTaskDB(params.id);
  try {
    // Expect an array of updated tasks
    const updatedTasks = await request.json();
    
    // We simply overwrite the entire file with the new array to save order and status
    await fs.writeFile(dbFile, JSON.stringify(updatedTasks, null, 2));
    await syncProjectStats(params.id, updatedTasks);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to update tasks" }, { status: 500 });
  }
}
