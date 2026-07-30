import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const DB_DIR = path.join(process.cwd(), ".worksblue");

async function getDbFile(projectId: string) {
  await fs.mkdir(DB_DIR, { recursive: true });
  return path.join(DB_DIR, `sprints-${projectId}.json`);
}

async function initDb(projectId: string) {
  const dbFile = await getDbFile(projectId);
  try {
    await fs.access(dbFile);
  } catch {
    await fs.writeFile(dbFile, JSON.stringify([], null, 2));
  }
  return dbFile;
}

// GET all sprints for a project
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const dbFile = await initDb(params.id);
  try {
    const data = await fs.readFile(dbFile, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ error: "Failed to read sprints" }, { status: 500 });
  }
}

// POST create new sprint
export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const dbFile = await initDb(params.id);
  try {
    const body = await request.json();
    const newSprint = {
      ...body,
      id: `sprint-${Math.random().toString(36).substr(2, 9)}`,
      projectId: params.id,
      status: "Planned" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const data = await fs.readFile(dbFile, "utf-8");
    const sprints = JSON.parse(data);
    sprints.push(newSprint);

    await fs.writeFile(dbFile, JSON.stringify(sprints, null, 2));

    return NextResponse.json(newSprint, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create sprint" }, { status: 500 });
  }
}