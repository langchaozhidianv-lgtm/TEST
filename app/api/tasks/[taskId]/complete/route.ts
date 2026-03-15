import { notFound, ok } from "@/lib/api";
import { getTaskById } from "@/lib/mock-data";

interface RouteContext {
  params: {
    taskId: string;
  };
}

export async function POST(request: Request, { params }: RouteContext) {
  const task = getTaskById(params.taskId);

  if (!task) {
    return notFound("task not found");
  }

  const body = await request.json().catch(() => ({}));
  const completedAt = body.completedAt ?? new Date().toISOString();

  return ok({
    ...task,
    status: "DONE",
    progressPercent: 100,
    completedAt
  });
}
