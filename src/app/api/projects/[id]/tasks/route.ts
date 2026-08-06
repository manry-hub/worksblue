import { NextResponse } from "next/server";
import { readDB, mutateDB } from "@/lib/blob-db";
import { issueSchema } from "@/lib/validations";
import { z } from "zod";

export const dynamic = "force-dynamic";

const PROJECTS_FILE = "projects.json";

async function syncProjectStats(projectId: string, tasks: Record<string, unknown>[]) {
  try {
    await mutateDB(PROJECTS_FILE, (projects: Record<string, unknown>[]) => {
      const index = projects.findIndex((p) => p.id === projectId);
      if (index !== -1) {
        const backlogTasksCount = tasks.filter(t => t.status === "backlog").length;
        const doneTasksCount = tasks.filter(t => t.status === "done").length;
        const boardTasksCount = tasks.filter(t => (t.status as string) !== "backlog" && (t.status as string) !== "failed").length;
        const progress = boardTasksCount > 0 ? Math.round((doneTasksCount / boardTasksCount) * 100) : 0;
        
        projects[index] = {
          ...projects[index],
          openIssues: backlogTasksCount,
          totalIssues: boardTasksCount,
          progress: progress,
        };
      }
      return projects;
    }, []);
  } catch (e) {
    console.error("Failed to sync project stats", e);
  }
}

// GET all tasks for a project
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const dbFile = `tasks-${params.id}.json`;
  try {
    const tasks = await readDB(dbFile, []);
    return NextResponse.json(tasks);
  } catch (error: unknown) {
    console.error("GET project tasks error:", error);
    return NextResponse.json({ error: "Failed to read tasks", details: (error as Error).message }, { status: 500 });
  }
}

// POST a new task
export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const dbFile = `tasks-${params.id}.json`;
  try {
    const rawBody = await request.json();
    const parseResult = issueSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid data", details: parseResult.error.format() }, { status: 400 });
    }

    const body = parseResult.data;
    
    // Generate sequential ID using mutateDB on the project file
    let newId = `issue-${Math.random().toString(36).substr(2, 9)}`;
    await mutateDB(PROJECTS_FILE, (projects: Record<string, unknown>[]) => {
      const index = projects.findIndex((p) => p.id === params.id);
      if (index !== -1) {
        const project = projects[index] as Record<string, unknown>;
        const nextCounter = ((project.lastIssueCounter as number) || 0) + 1;
        project.lastIssueCounter = nextCounter;
        
        const prefix = (project.issueNumberPrefix as string) || "ISSUE-";
        newId = `${prefix}${nextCounter}`;
      }
      return projects;
    }, []);

    const newTask = {
      ...body,
      id: newId,
      projectId: params.id,
      labels: body.labels || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let allTasks: Record<string, unknown>[] = [];
    await mutateDB(dbFile, (tasks: Record<string, unknown>[]) => {
      tasks.push(newTask);
      allTasks = tasks;
      return tasks;
    }, []);
    
    await syncProjectStats(params.id, allTasks);
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error: unknown) {
    console.error("POST project task error:", error);
    return NextResponse.json({ error: "Failed to create task", details: (error as Error).message }, { status: 500 });
  }
}

// PATCH to update existing tasks (bulk update for sorting/moving)
export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const dbFile = `tasks-${params.id}.json`;
  try {
    // Expect an array of updated tasks
    const rawBody = await request.json();
    
    // We expect an array of issues, so validate as an array
    const bulkSchema = z.array(issueSchema.passthrough());
    const parseResult = bulkSchema.safeParse(rawBody);
    
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid data", details: parseResult.error.format() }, { status: 400 });
    }

    const updatedTasks = parseResult.data;
    
    // We simply overwrite the entire file with the new array to save order and status
    await mutateDB(dbFile, () => {
      return updatedTasks;
    }, []);
    
    await syncProjectStats(params.id, updatedTasks);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("PATCH project tasks bulk error:", error);
    return NextResponse.json({ error: "Failed to update tasks", details: (error as Error).message }, { status: 500 });
  }
}
