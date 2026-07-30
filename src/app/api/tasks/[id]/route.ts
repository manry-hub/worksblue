import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const DB_DIR = path.join(process.cwd(), ".worksblue");
const TASKS_FILE = path.join(DB_DIR, "tasks-global.json");

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const body = await request.json();
    const data = await fs.readFile(TASKS_FILE, "utf-8");
    const tasks = JSON.parse(data);
    
    const index = tasks.findIndex((t: Record<string, unknown>) => t.id === params.id);
    if (index === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    tasks[index] = { ...tasks[index], ...body };
    
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
    return NextResponse.json(tasks[index]);
  } catch {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const data = await fs.readFile(TASKS_FILE, "utf-8");
    let tasks = JSON.parse(data);
    
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
    
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
