import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/blob-db";

export const dynamic = "force-dynamic";

// GET single sprint
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string; sprintId: string }> }
) {
  const params = await props.params;
  const dbFile = `sprints-${params.id}.json`;
  try {
    const sprints = await readDB(dbFile, []);
    const sprint = sprints.find((s: { id: string }) => s.id === params.sprintId);
    if (!sprint) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 });
    }
    return NextResponse.json(sprint);
  } catch (error: unknown) {
    console.error("GET sprint detail error:", error);
    return NextResponse.json({ error: "Failed to read sprint", details: (error as Error).message }, { status: 500 });
  }
}

// PATCH update sprint
export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string; sprintId: string }> }
) {
  const params = await props.params;
  const dbFile = `sprints-${params.id}.json`;
  try {
    const sprints = await readDB(dbFile, []);

    const index = sprints.findIndex((s: { id: string }) => s.id === params.sprintId);
    if (index === -1) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 });
    }

    const body = await request.json();
    sprints[index] = { ...sprints[index], ...body, updatedAt: new Date().toISOString() };

    await writeDB(dbFile, sprints);

    return NextResponse.json(sprints[index]);
  } catch (error: unknown) {
    console.error("PATCH sprint detail error:", error);
    return NextResponse.json({ error: "Failed to update sprint", details: (error as Error).message }, { status: 500 });
  }
}

// DELETE sprint
export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string; sprintId: string }> }
) {
  const params = await props.params;
  const dbFile = `sprints-${params.id}.json`;
  try {
    const sprints = await readDB(dbFile, []);

    const index = sprints.findIndex((s: { id: string }) => s.id === params.sprintId);
    if (index === -1) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 });
    }

    const sprint = sprints[index];
    if (sprint.status === "Active") {
      return NextResponse.json({ error: "Cannot delete an active sprint" }, { status: 400 });
    }

    sprints.splice(index, 1);
    await writeDB(dbFile, sprints);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE sprint detail error:", error);
    return NextResponse.json({ error: "Failed to delete sprint", details: (error as Error).message }, { status: 500 });
  }
}