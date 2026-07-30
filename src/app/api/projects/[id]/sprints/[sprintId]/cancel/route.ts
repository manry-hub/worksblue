import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const DB_DIR = path.join(process.cwd(), ".worksblue");

async function getDbFile(projectId: string) {
  return path.join(DB_DIR, `sprints-${projectId}.json`);
}

// POST cancel sprint
export async function POST(
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
    if (sprint.status === "Completed") {
      return NextResponse.json({ error: "Cannot cancel a completed sprint" }, { status: 400 });
    }

    sprints[index] = {
      ...sprint,
      status: "Cancelled",
      updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(dbFile, JSON.stringify(sprints, null, 2));

    return NextResponse.json(sprints[index]);
  } catch {
    return NextResponse.json({ error: "Failed to cancel sprint" }, { status: 500 });
  }
}