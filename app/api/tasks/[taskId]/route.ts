import { notFound, ok } from "@/lib/api";
import { getTaskById } from "@/lib/mock-data";

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

  return ok(task);
}

export async function PUT(request: Request, { params }: RouteContext) {
  const task = getTaskById(params.taskId);

  if (!task) {
    return notFound("task not found");
  }

  const body = await request.json();

  return ok({
    ...task,
    ...body,
    updatedAt: new Date().toISOString()
  });
}
