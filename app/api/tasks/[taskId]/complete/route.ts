import { notFound, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getTaskData } from "@/lib/server-data";

interface RouteContext {
  params: {
    taskId: string;
  };
}

export async function POST(request: Request, { params }: RouteContext) {
  const task = await getTaskData(params.taskId);

  if (!task) {
    return notFound("task not found");
  }

  const body = await request.json().catch(() => ({}));
  const completedAt = body.completedAt ?? new Date().toISOString();
  await prisma.task.update({
    where: {
      id: params.taskId
    },
    data: {
      status: "DONE",
      progressPercent: 100,
      completedAt: new Date(completedAt)
    }
  });

  return ok({
    ...task,
    status: "DONE",
    progressPercent: 100,
    completedAt
  });
}
