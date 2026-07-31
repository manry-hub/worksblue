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

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string; taskId: string }> }
) {
  const params = await props.params;
  const dbFile = `tasks-${params.id}.json`;
  try {
    const tasks = await readDB(dbFile, []);
    const body = await request.json();
    const index = tasks.findIndex((t: { id: string }) => t.id === params.taskId);
    
    if (index === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    tasks[index] = { ...tasks[index], ...body, updatedAt: new Date().toISOString() };
    
    await writeDB(dbFile, tasks);
    await syncProjectStats(params.id, tasks);
    
    return NextResponse.json(tasks[index]);
  } catch (error: unknown) {
    console.error("PATCH task detail error:", error);
    return NextResponse.json({ error: "Failed to update task", details: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string; taskId: string }> }
) {
  const params = await props.params;
  const dbFile = `tasks-${params.id}.json`;
  try {
    const tasks = await readDB(dbFile, []);
    const index = tasks.findIndex((t: { id: string }) => t.id === params.taskId);
    
    if (index === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    tasks.splice(index, 1);
    await writeDB(dbFile, tasks);
    await syncProjectStats(params.id, tasks);
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE task detail error:", error);
    return NextResponse.json({ error: "Failed to delete task", details: (error as Error).message }, { status: 500 });
  }
}
