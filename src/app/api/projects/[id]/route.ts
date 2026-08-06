import { NextResponse } from "next/server";
import { mutateDB, deleteDB } from "@/lib/blob-db";
import { projectUpdateSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

const DB_FILE = "projects.json";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const rawBody = await request.json();
    const parseResult = projectUpdateSchema.safeParse(rawBody);
    
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid data", details: parseResult.error.format() }, { status: 400 });
    }

    const body = parseResult.data;
    let updatedProject = null;

    await mutateDB(DB_FILE, (projects: Record<string, unknown>[]) => {
      const index = projects.findIndex((p) => p.id === params.id);
      if (index === -1) {
        throw new Error("Project not found");
      }
      
      projects[index] = { ...projects[index], ...body };
      updatedProject = projects[index];
      return projects;
    });
    
    return NextResponse.json(updatedProject);
  } catch (err) {
    const error = err as Error;
    console.error("PATCH error:", error);
    if (error.message === "Project not found") {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update project", details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    await mutateDB(DB_FILE, (projects: Record<string, unknown>[]) => {
      const index = projects.findIndex((p) => p.id === params.id);
      if (index === -1) {
        throw new Error("Project not found");
      }
      projects.splice(index, 1);
      return projects;
    });
    
    // Also delete the associated tasks file
    await deleteDB(`tasks-${params.id}.json`);

    return NextResponse.json({ success: true });
  } catch (err) {
    const error = err as Error;
    console.error("DELETE error:", error);
    if (error.message === "Project not found") {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete project", details: error.message }, { status: 500 });
  }
}
