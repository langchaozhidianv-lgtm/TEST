import { notFound, ok } from "@/lib/api";
import { writeProjectLog } from "@/lib/activity-log";
import { prisma } from "@/lib/prisma";
import { getProjectDetailData } from "@/lib/server-data";

interface RouteContext {
  params: {
    projectId: string;
  };
}

export async function GET(_request: Request, { params }: RouteContext) {
  const detail = await getProjectDetailData(params.projectId);

  if (!detail) {
    return notFound("project not found");
  }

  return ok({
    list: detail.groups.map((group) => ({
      ...group,
      tasks: detail.tasks.filter((task) => task.groupId === group.id)
    }))
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const detail = await getProjectDetailData(params.projectId);

  if (!detail) {
    return notFound("project not found");
  }

  const body = await request.json();
  const created = await prisma.taskGroup.create({
    data: {
      projectId: detail.project.id,
      name: body.name,
      sortOrder: body.sortOrder ?? detail.groups.length + 1,
      isDefault: false
    }
  });
  await writeProjectLog({
    projectId: detail.project.id,
    activityType: "TASK_UPDATED",
    contentSummary: `Created task group ${created.name}.`,
    moduleName: "TaskGroup",
    actionName: "CreateTaskGroup",
    targetType: "task_group",
    targetId: created.id,
    afterJson: { name: created.name, sortOrder: created.sortOrder }
  });

  return ok({
    id: created.id,
    projectId: created.projectId,
    name: created.name,
    sortOrder: created.sortOrder,
    isDefault: created.isDefault
  });
}
