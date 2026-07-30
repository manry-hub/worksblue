import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const DB_DIR = path.join(process.cwd(), ".worksblue");
const TASKS_FILE = path.join(DB_DIR, "tasks-global.json");

async function initDB() {
  await fs.mkdir(DB_DIR, { recursive: true });
  try {
    await fs.access(TASKS_FILE);
  } catch {
    await fs.writeFile(TASKS_FILE, JSON.stringify([], null, 2));
  }
  return TASKS_FILE;
}

export async function GET() {
  const dbFile = await initDB();
  try {
    const data = await fs.readFile(dbFile, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ error: "Failed to read global tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const dbFile = await initDB();
  try {
    const body = await request.json();
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

    const data = await fs.readFile(dbFile, "utf-8");
    const tasks = JSON.parse(data);
    tasks.push(newTask);
    
    await fs.writeFile(dbFile, JSON.stringify(tasks, null, 2));
    return NextResponse.json(newTask, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
