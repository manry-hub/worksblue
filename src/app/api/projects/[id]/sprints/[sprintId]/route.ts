import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const DB_DIR = path.join(process.cwd(), ".worksblue");

async function getDbFile(projectId: string) {
  return path.join(DB_DIR, `sprints-${projectId}.json`);
}

// GET single sprint
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string; sprintId: string }> }
) {
  const params = await props.params;
  const dbFile = await getDbFile(params.id);
  try {
    const data = await fs.readFile(dbFile, "utf-8");
    const sprints = JSON.parse(data);
    const sprint = sprints.find((s: { id: string }) => s.id === params.sprintId);
    if (!sprint) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 });
    }
    return NextResponse.json(sprint);
  } catch {
    return NextResponse.json({ error: "Failed to read sprint" }, { status: 500 });
  }
}

// PATCH update sprint
export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string; sprintId: string }> }
) {
  const params = await props.params;
  const dbFile = await getDbFile(params.id);
  try {
    const data = await fs.readFile(dbFile, "utf-8");
    const sprints = JSON.parse(data);

    const index = sprints.findIndex((s: { id: string }) => s.id === params.sprintId);
    if (index === -1) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 });
    }

    const body = await request.json();
    sprints[index] = { ...sprints[index], ...body, updatedAt: new Date().toISOString() };

    await fs.writeFile(dbFile, JSON.stringify(sprints, null, 2));

    return NextResponse.json(sprints[index]);
  } catch {
    return NextResponse.json({ error: "Failed to update sprint" }, { status: 500 });
  }
}

// DELETE sprint
export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string; sprintId: string }> }
) {
  const params = await props.params;
  const dbFile = await getDbFile(params.id);
  try {
    const data = await fs.readFile(dbFile, "utf-8");
    const sprints = JSON.parse(data);

    const index = sprints.findIndex((s: { id: string }) => s.id === params.sprintId);
    if (index === -1) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 });
    }

    const sprint = sprints[index];
    if (sprint.status === "Active") {
      return NextResponse.json({ error: "Cannot delete an active sprint" }, { status: 400 });
    }

    sprints.splice(index, 1);
    await fs.writeFile(dbFile, JSON.stringify(sprints, null, 2));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete sprint" }, { status: 500 });
  }
}