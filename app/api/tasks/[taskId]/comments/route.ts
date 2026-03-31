import { notFound, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getTaskCommentsData, getTaskData } from "@/lib/server-data";

interface RouteContext {
  params: {
    taskId: string;
  };
}

export async function GET(_request: Request, { params }: RouteContext) {
  const task = await getTaskData(params.taskId);

  if (!task) {
    return notFound("task not found");
  }

  return ok({
    list: await getTaskCommentsData(task.id)
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const task = await getTaskData(params.taskId);

  if (!task) {
    return notFound("task not found");
  }

  const body = await request.json();
  const created = await prisma.taskComment.create({
    data: {
      taskId: task.id,
      userId: body.userId ?? "user_1",
      content: body.content
    }
  });

  return ok({
    id: created.id,
    taskId: created.taskId,
    userId: created.userId,
    content: created.content,
    createdAt: created.createdAt.toISOString()
  });
}
