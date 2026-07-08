import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const DB_DIR = path.join(process.cwd(), ".worksblue");
const DB_FILE = path.join(DB_DIR, "projects.json");

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const data = await fs.readFile(DB_FILE, "utf-8");
    const projects = JSON.parse(data);
    
    const body = await request.json();
    const index = projects.findIndex((p: { id: string }) => p.id === params.id);
    
    if (index === -1) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    projects[index] = { ...projects[index], ...body };
    
    await fs.writeFile(DB_FILE, JSON.stringify(projects, null, 2));
    
    return NextResponse.json(projects[index]);
  } catch {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const data = await fs.readFile(DB_FILE, "utf-8");
    const projects = JSON.parse(data);
    
    const index = projects.findIndex((p: { id: string }) => p.id === params.id);
    
    if (index === -1) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    projects.splice(index, 1);
    await fs.writeFile(DB_FILE, JSON.stringify(projects, null, 2));
    
    // Also delete the associated tasks file
    const taskFile = path.join(DB_DIR, `tasks-${params.id}.json`);
    try {
      await fs.unlink(taskFile);
    } catch {
      // Ignore if task file doesn't exist
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
