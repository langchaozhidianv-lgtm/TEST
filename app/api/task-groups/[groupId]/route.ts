import { notFound, ok } from "@/lib/api";
import { writeProjectLog } from "@/lib/activity-log";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: {
    groupId: string;
  };
}

export async function PUT(request: Request, { params }: RouteContext) {
  const group = await prisma.taskGroup.findUnique({
    where: {
      id: params.groupId
    }
  });

  if (!group) {
    return notFound("task group not found");
  }

  const body = await request.json();
  const updated = await prisma.taskGroup.update({
    where: {
      id: params.groupId
    },
    data: {
      name: body.name ?? group.name,
      sortOrder: body.sortOrder ?? group.sortOrder
    }
  });
  await writeProjectLog({
    projectId: group.projectId,
    activityType: "TASK_UPDATED",
    contentSummary: `Updated task group ${updated.name}.`,
    moduleName: "TaskGroup",
    actionName: "UpdateTaskGroup",
    targetType: "task_group",
    targetId: updated.id,
    beforeJson: { name: group.name, sortOrder: group.sortOrder },
    afterJson: { name: updated.name, sortOrder: updated.sortOrder }
  });

  return ok(updated);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const group = await prisma.taskGroup.findUnique({
    where: {
      id: params.groupId
    }
  });

  if (!group) {
    return notFound("task group not found");
  }

  await prisma.task.updateMany({
    where: {
      groupId: params.groupId
    },
    data: {
      groupId: null
    }
  });

  await prisma.taskGroup.delete({
    where: {
      id: params.groupId
    }
  });
  await writeProjectLog({
    projectId: group.projectId,
    activityType: "TASK_UPDATED",
    contentSummary: `Deleted task group ${group.name}.`,
    moduleName: "TaskGroup",
    actionName: "DeleteTaskGroup",
    targetType: "task_group",
    targetId: group.id,
    beforeJson: { name: group.name, sortOrder: group.sortOrder }
  });

  return ok({
    success: true,
    id: params.groupId
  });
}
