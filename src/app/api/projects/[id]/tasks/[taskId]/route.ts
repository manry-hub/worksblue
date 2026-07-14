import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const DB_DIR = path.join(process.cwd(), ".worksblue");
const PROJECTS_FILE = path.join(DB_DIR, "projects.json");

async function syncProjectStats(projectId: string, tasks: { status: string }[]) {
  try {
    const data = await fs.readFile(PROJECTS_FILE, "utf-8");
    const projects = JSON.parse(data);
    const index = projects.findIndex((p: { id: string }) => p.id === projectId);
    
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
  return path.join(DB_DIR, `tasks-${projectId}.json`);
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string; taskId: string }> }
) {
  const params = await props.params;
  const dbFile = await getDbFile(params.id);
  try {
    const data = await fs.readFile(dbFile, "utf-8");
    const tasks = JSON.parse(data);
    
    const body = await request.json();
    const index = tasks.findIndex((t: { id: string }) => t.id === params.taskId);
    
    if (index === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    tasks[index] = { ...tasks[index], ...body, updatedAt: new Date().toISOString() };
    
    await fs.writeFile(dbFile, JSON.stringify(tasks, null, 2));
    await syncProjectStats(params.id, tasks);
    
    return NextResponse.json(tasks[index]);
  } catch {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string; taskId: string }> }
) {
  const params = await props.params;
  const dbFile = await getDbFile(params.id);
  try {
    const data = await fs.readFile(dbFile, "utf-8");
    const tasks = JSON.parse(data);
    
    const index = tasks.findIndex((t: { id: string }) => t.id === params.taskId);
    
    if (index === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    tasks.splice(index, 1);
    await fs.writeFile(dbFile, JSON.stringify(tasks, null, 2));
    await syncProjectStats(params.id, tasks);
    
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
