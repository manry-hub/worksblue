import { NextResponse } from "next/server";
import { readDB } from "@/lib/blob-db";

export const dynamic = "force-dynamic";

const PROJECTS_FILE = "projects.json";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase();

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const projects = await readDB(PROJECTS_FILE, []);

    const matchedTasks: Record<string, unknown>[] = [];
    const MAX_RESULTS = 20;

    for (const project of projects) {
      if (matchedTasks.length >= MAX_RESULTS) break;

      const tasksFile = `tasks-${project.id}.json`;
      const tasks = await readDB(tasksFile, []);

      for (const task of tasks) {
        if (matchedTasks.length >= MAX_RESULTS) break;

        const title = task.title?.toLowerCase() || "";
        const description = task.description?.toLowerCase() || "";
        const id = task.id?.toLowerCase() || "";

        if (title.includes(query) || description.includes(query) || id.includes(query)) {
          matchedTasks.push({
            ...task,
            projectName: project.name,
            projectId: project.id,
          });
        }
      }
    }

    return NextResponse.json({ results: matchedTasks });
  } catch (error) {
    console.error("Global task search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
