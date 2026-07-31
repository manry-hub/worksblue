import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/blob-db";

export const dynamic = "force-dynamic";

// POST cancel sprint
export async function POST(
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
    if (sprint.status === "Completed") {
      return NextResponse.json({ error: "Cannot cancel a completed sprint" }, { status: 400 });
    }

    sprints[index] = {
      ...sprint,
      status: "Cancelled",
      updatedAt: new Date().toISOString(),
    };

    await writeDB(dbFile, sprints);

    return NextResponse.json(sprints[index]);
  } catch (error: unknown) {
    console.error("POST sprint cancel error:", error);
    return NextResponse.json({ error: "Failed to cancel sprint", details: (error as Error).message }, { status: 500 });
  }
}