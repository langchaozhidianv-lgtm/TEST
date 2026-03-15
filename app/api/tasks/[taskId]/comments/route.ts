import { notFound, ok } from "@/lib/api";
import { getCommentsByTask, getTaskById } from "@/lib/mock-data";

interface RouteContext {
  params: {
    taskId: string;
  };
}

export async function GET(_request: Request, { params }: RouteContext) {
  const task = getTaskById(params.taskId);

  if (!task) {
    return notFound("task not found");
  }

  return ok({
    list: getCommentsByTask(task.id)
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const task = getTaskById(params.taskId);

  if (!task) {
    return notFound("task not found");
  }

  const body = await request.json();

  return ok({
    id: crypto.randomUUID(),
    taskId: task.id,
    userId: "user_1",
    createdAt: new Date().toISOString(),
    ...body
  });
}
