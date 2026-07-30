import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const DB_DIR = path.join(process.cwd(), ".worksblue");

async function getSprintDbFile(projectId: string) {
  return path.join(DB_DIR, `sprints-${projectId}.json`);
}

async function getTaskDbFile(projectId: string) {
  return path.join(DB_DIR, `tasks-${projectId}.json`);
}

// PATCH assign/remove tasks to/from sprint
export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string; sprintId: string }> }
) {
  const params = await props.params;
  const sprintDbFile = await getSprintDbFile(params.id);
  const taskDbFile = await getTaskDbFile(params.id);

  try {
    const { taskIds, action } = await request.json();

    // Read sprint to verify it exists
    const sprintData = await fs.readFile(sprintDbFile, "utf-8");
    const sprints = JSON.parse(sprintData);
    const sprint = sprints.find((s: { id: string }) => s.id === params.sprintId);
    if (!sprint) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 });
    }

    // Read and update tasks
    const taskData = await fs.readFile(taskDbFile, "utf-8");
    let tasks = JSON.parse(taskData);

    if (action === "add") {
      tasks = tasks.map((t: { id: string; sprintId?: string }) =>
        taskIds.includes(t.id) ? { ...t, sprintId: params.sprintId, updatedAt: new Date().toISOString() } : t
      );
    } else if (action === "remove") {
      tasks = tasks.map((t: { id: string; sprintId?: string }) =>
        taskIds.includes(t.id) ? { ...t, sprintId: undefined, updatedAt: new Date().toISOString() } : t
      );
    }

    await fs.writeFile(taskDbFile, JSON.stringify(tasks, null, 2));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to assign tasks" }, { status: 500 });
  }
}