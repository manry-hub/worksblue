import { NextResponse } from "next/server";
import { readDB, writeDB, deleteDB } from "@/lib/blob-db";

export const dynamic = "force-dynamic";

const DB_FILE = "projects.json";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const projects = await readDB(DB_FILE);
    const body = await request.json();
    const index = projects.findIndex((p: { id: string }) => p.id === params.id);
    
    if (index === -1) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    projects[index] = { ...projects[index], ...body };
    await writeDB(DB_FILE, projects);
    
    return NextResponse.json(projects[index]);
  } catch (err) {
    const error = err as Error;
    console.error("PATCH error:", error);
    return NextResponse.json({ error: "Failed to update project", details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const projects = await readDB(DB_FILE);
    const index = projects.findIndex((p: { id: string }) => p.id === params.id);
    
    if (index === -1) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    projects.splice(index, 1);
    await writeDB(DB_FILE, projects);
    
    // Also delete the associated tasks file
    await deleteDB(`tasks-${params.id}.json`);

    return NextResponse.json({ success: true });
  } catch (err) {
    const error = err as Error;
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete project", details: error.message }, { status: 500 });
  }
}
