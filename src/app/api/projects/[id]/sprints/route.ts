import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/blob-db";

export const dynamic = "force-dynamic";

// GET all sprints for a project
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const dbFile = `sprints-${params.id}.json`;
  try {
    const sprints = await readDB(dbFile, []);
    return NextResponse.json(sprints);
  } catch (error: unknown) {
    console.error("GET sprints error:", error);
    return NextResponse.json({ error: "Failed to read sprints", details: (error as Error).message }, { status: 500 });
  }
}

// POST create new sprint
export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const dbFile = `sprints-${params.id}.json`;
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

    const sprints = await readDB(dbFile, []);
    sprints.push(newSprint);

    await writeDB(dbFile, sprints);

    return NextResponse.json(newSprint, { status: 201 });
  } catch (error: unknown) {
    console.error("POST sprint error:", error);
    return NextResponse.json({ error: "Failed to create sprint", details: (error as Error).message }, { status: 500 });
  }
}