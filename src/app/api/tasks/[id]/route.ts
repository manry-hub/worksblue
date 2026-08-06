import { NextResponse } from "next/server";
import { mutateDB } from "@/lib/blob-db";
import { globalTaskUpdateSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

const TASKS_FILE = "tasks-global.json";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const rawBody = await request.json();
    const parseResult = globalTaskUpdateSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid data", details: parseResult.error.format() }, { status: 400 });
    }

    const body = parseResult.data;
    let updatedTask = null;

    await mutateDB(TASKS_FILE, (tasks: Record<string, unknown>[]) => {
      const index = tasks.findIndex((t) => t.id === params.id);
      if (index === -1) {
        throw new Error("Task not found");
      }
      tasks[index] = { ...tasks[index], ...body };
      updatedTask = tasks[index];
      return tasks;
    }, []);

    return NextResponse.json(updatedTask);
  } catch (error: unknown) {
    console.error("PATCH task error:", error);
    if ((error as Error).message === "Task not found") {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update task", details: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    await mutateDB(TASKS_FILE, (tasks: Record<string, unknown>[]) => {
      // Find all children recursively
      const idsToDelete = new Set<string>([params.id]);
      let added = true;
      while (added) {
        added = false;
        for (const t of tasks as { id: string, parentId?: string }[]) {
          if (t.parentId && idsToDelete.has(t.parentId) && !idsToDelete.has(t.id)) {
            idsToDelete.add(t.id);
            added = true;
          }
        }
      }

      // Filter out tasks that need to be deleted
      return tasks.filter((t) => !idsToDelete.has(t.id as string));
    }, []);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE task error:", error);
    return NextResponse.json({ error: "Failed to delete task", details: (error as Error).message }, { status: 500 });
  }
}
