import { NextResponse } from "next/server";
import { readDB, mutateDB } from "@/lib/blob-db";
import { globalTaskSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

const TASKS_FILE = "tasks-global.json";

export async function GET() {
  try {
    const data = await readDB(TASKS_FILE, []);
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("GET tasks error:", error);
    return NextResponse.json({ error: "Failed to read global tasks", details: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const parseResult = globalTaskSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid data", details: parseResult.error.format() }, { status: 400 });
    }

    const body = parseResult.data;
    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      parentId: body.parentId || null,
      name: body.name || "New Task",
      description: body.description || "",
      progress: body.progress || 0,
      startDate: body.startDate || "",
      endDate: body.endDate || "",
      assignee: body.assignee || "",
      completed: body.completed || false,
    };

    await mutateDB(TASKS_FILE, (tasks: Record<string, unknown>[]) => {
      return [...tasks, newTask];
    }, []);
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error: unknown) {
    console.error("POST tasks error:", error);
    return NextResponse.json({ error: "Failed to create task", details: (error as Error).message }, { status: 500 });
  }
}
