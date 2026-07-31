import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/blob-db";

export const dynamic = "force-dynamic";

const TASKS_FILE = "tasks-global.json";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const body = await request.json();
    const tasks = await readDB(TASKS_FILE, []);
    
    const index = tasks.findIndex((t: Record<string, unknown>) => t.id === params.id);
    if (index === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    tasks[index] = { ...tasks[index], ...body };
    
    await writeDB(TASKS_FILE, tasks);
    return NextResponse.json(tasks[index]);
  } catch (error: unknown) {
    console.error("PATCH task error:", error);
    return NextResponse.json({ error: "Failed to update task", details: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    let tasks = await readDB(TASKS_FILE, []);
    
    // Find all children recursively to delete them as well
    const idsToDelete = new Set<string>([params.id]);
    
    let added = true;
    while(added) {
      added = false;
      for (const t of tasks) {
        if (t.parentId && idsToDelete.has(t.parentId) && !idsToDelete.has(t.id)) {
          idsToDelete.add(t.id);
          added = true;
        }
      }
    }

    tasks = tasks.filter((t: Record<string, unknown>) => !idsToDelete.has(t.id as string));
    
    await writeDB(TASKS_FILE, tasks);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE task error:", error);
    return NextResponse.json({ error: "Failed to delete task", details: (error as Error).message }, { status: 500 });
  }
}
