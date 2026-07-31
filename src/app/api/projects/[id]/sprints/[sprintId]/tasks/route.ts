import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/blob-db";

export const dynamic = "force-dynamic";

// PATCH assign/remove tasks to/from sprint
export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string; sprintId: string }> }
) {
  const params = await props.params;
  const sprintDbFile = `sprints-${params.id}.json`;
  const taskDbFile = `tasks-${params.id}.json`;

  try {
    const { taskIds, action } = await request.json();

    // Read sprint to verify it exists
    const sprints = await readDB(sprintDbFile, []);
    const sprint = sprints.find((s: { id: string }) => s.id === params.sprintId);
    if (!sprint) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 });
    }

    // Read and update tasks
    let tasks = await readDB(taskDbFile, []);

    if (action === "add") {
      tasks = tasks.map((t: { id: string; sprintId?: string }) =>
        taskIds.includes(t.id) ? { ...t, sprintId: params.sprintId, updatedAt: new Date().toISOString() } : t
      );
    } else if (action === "remove") {
      tasks = tasks.map((t: { id: string; sprintId?: string }) =>
        taskIds.includes(t.id) ? { ...t, sprintId: undefined, updatedAt: new Date().toISOString() } : t
      );
    }

    await writeDB(taskDbFile, tasks);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("PATCH sprint tasks error:", error);
    return NextResponse.json({ error: "Failed to assign tasks", details: (error as Error).message }, { status: 500 });
  }
}