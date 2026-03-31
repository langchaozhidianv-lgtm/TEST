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

  const body = await request.json();
  const updated = await prisma.task.update({
    where: {
      id: params.taskId
    },
    data: {
      groupId: body.targetGroupId ?? task.groupId ?? null,
      sortOrder: body.sortOrder ?? task.sortOrder
    }
  });

  return ok({
    id: updated.id,
    groupId: updated.groupId,
    sortOrder: updated.sortOrder
  });
}
