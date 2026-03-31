import { notFound, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getTaskData } from "@/lib/server-data";

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

  return ok(task);
}

export async function PUT(request: Request, { params }: RouteContext) {
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
      title: body.title ?? task.title,
      description: body.description ?? task.description,
      assigneeId: body.assigneeId ?? task.assigneeId ?? null,
      reporterId: body.reporterId ?? task.reporterId ?? null,
      priority: body.priority ?? task.priority,
      status: body.status ?? task.status,
      progressPercent: body.progressPercent ?? task.progressPercent,
      startAt: body.startAt ? new Date(body.startAt) : body.startAt === null ? null : undefined,
      endAt: body.endAt ? new Date(body.endAt) : body.endAt === null ? null : undefined,
      dueAt: body.dueAt ? new Date(body.dueAt) : body.dueAt === null ? null : undefined,
      groupId: body.groupId ?? task.groupId ?? undefined,
      completedAt:
        body.status === "DONE"
          ? body.completedAt
            ? new Date(body.completedAt)
            : new Date()
          : body.completedAt === null
            ? null
            : undefined
    }
  });

  return ok({
    id: updated.id,
    projectId: updated.projectId,
    groupId: updated.groupId ?? undefined,
    title: updated.title,
    description: updated.description ?? undefined,
    assigneeId: updated.assigneeId ?? undefined,
    reporterId: updated.reporterId ?? undefined,
    priority: updated.priority,
    status: updated.status,
    progressPercent: updated.progressPercent,
    startAt: updated.startAt?.toISOString(),
    endAt: updated.endAt?.toISOString(),
    dueAt: updated.dueAt?.toISOString(),
    sortOrder: updated.sortOrder,
    completedAt: updated.completedAt?.toISOString()
  });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const task = await getTaskData(params.taskId);

  if (!task) {
    return notFound("task not found");
  }

  await prisma.task.delete({
    where: {
      id: params.taskId
    }
  });

  return ok({
    success: true,
    id: params.taskId
  });
}
