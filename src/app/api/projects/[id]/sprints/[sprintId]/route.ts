import { NextResponse } from "next/server";
import { readDB, mutateDB } from "@/lib/blob-db";
import { sprintUpdateSchema } from "@/lib/validations";

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
    const rawBody = await request.json();
    const parseResult = sprintUpdateSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid data", details: parseResult.error.format() }, { status: 400 });
    }

    const body = parseResult.data;
    let updatedSprint = null;

    await mutateDB(dbFile, (sprints: Record<string, unknown>[]) => {
      const index = sprints.findIndex((s) => s.id === params.sprintId);
      if (index === -1) {
        throw new Error("Sprint not found");
      }

      sprints[index] = { ...sprints[index], ...body, updatedAt: new Date().toISOString() };
      updatedSprint = sprints[index];
      return sprints;
    }, []);

    return NextResponse.json(updatedSprint);
  } catch (error: unknown) {
    console.error("PATCH sprint detail error:", error);
    if ((error as Error).message === "Sprint not found") {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 });
    }
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
    await mutateDB(dbFile, (sprints: Record<string, unknown>[]) => {
      const index = sprints.findIndex((s) => s.id === params.sprintId);
      if (index === -1) {
        throw new Error("Sprint not found");
      }

      const sprint = sprints[index] as Record<string, unknown>;
      if (sprint.status === "Active") {
        throw new Error("Cannot delete an active sprint");
      }

      sprints.splice(index, 1);
      return sprints;
    }, []);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE sprint detail error:", error);
    if ((error as Error).message === "Sprint not found") {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 });
    }
    if ((error as Error).message === "Cannot delete an active sprint") {
      return NextResponse.json({ error: "Cannot delete an active sprint" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to delete sprint", details: (error as Error).message }, { status: 500 });
  }
}