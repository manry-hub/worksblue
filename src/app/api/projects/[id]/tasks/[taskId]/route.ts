import { NextResponse } from "next/server";
import { mutateDB } from "@/lib/blob-db";
import { issueUpdateSchema } from "@/lib/validations";

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

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string; taskId: string }> }
) {
  const params = await props.params;
  const dbFile = `tasks-${params.id}.json`;
  try {
    const rawBody = await request.json();
    const parseResult = issueUpdateSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid data", details: parseResult.error.format() }, { status: 400 });
    }

    const body = parseResult.data;
    let updatedTask = null;
    let allTasks: Record<string, unknown>[] = [];

    await mutateDB(dbFile, (tasks: Record<string, unknown>[]) => {
      const index = tasks.findIndex((t) => t.id === params.taskId);
      if (index === -1) {
        throw new Error("Task not found");
      }

      tasks[index] = { ...tasks[index], ...body, updatedAt: new Date().toISOString() };
      updatedTask = tasks[index];
      allTasks = tasks;
      return tasks;
    }, []);
    
    await syncProjectStats(params.id, allTasks);
    
    return NextResponse.json(updatedTask);
  } catch (error: unknown) {
    console.error("PATCH task detail error:", error);
    if ((error as Error).message === "Task not found") {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update task", details: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string; taskId: string }> }
) {
  const params = await props.params;
  const dbFile = `tasks-${params.id}.json`;
  try {
    let allTasks: Record<string, unknown>[] = [];

    await mutateDB(dbFile, (tasks: Record<string, unknown>[]) => {
      const index = tasks.findIndex((t) => t.id === params.taskId);
      if (index === -1) {
        throw new Error("Task not found");
      }

      tasks.splice(index, 1);
      allTasks = tasks;
      return tasks;
    }, []);
    
    await syncProjectStats(params.id, allTasks);
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE task detail error:", error);
    if ((error as Error).message === "Task not found") {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete task", details: (error as Error).message }, { status: 500 });
  }
}
