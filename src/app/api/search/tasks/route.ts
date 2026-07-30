import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const DB_DIR = path.join(process.cwd(), ".worksblue");
const PROJECTS_FILE = path.join(DB_DIR, "projects.json");

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase();

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    // Ensure projects file exists
    try {
      await fs.access(PROJECTS_FILE);
    } catch {
      return NextResponse.json({ results: [] });
    }

    const projectsData = await fs.readFile(PROJECTS_FILE, "utf-8");
    const projects = JSON.parse(projectsData);

    const matchedTasks: any[] = [];
    const MAX_RESULTS = 20;

    for (const project of projects) {
      if (matchedTasks.length >= MAX_RESULTS) break;

      const tasksFile = path.join(DB_DIR, `tasks-${project.id}.json`);
      try {
        await fs.access(tasksFile);
        const tasksData = await fs.readFile(tasksFile, "utf-8");
        const tasks = JSON.parse(tasksData);

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
      } catch (err) {
        // Silently skip if tasks file doesn't exist for this project
        continue;
      }
    }

    return NextResponse.json({ results: matchedTasks });
  } catch (error) {
    console.error("Global task search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
