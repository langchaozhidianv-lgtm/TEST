import { notFound, ok } from "@/lib/api";
import { writeProjectLog } from "@/lib/activity-log";
import { prisma } from "@/lib/prisma";
import { getProjectDetailData } from "@/lib/server-data";

interface RouteContext {
  params: {
    projectId: string;
  };
}

export async function POST(request: Request, { params }: RouteContext) {
  const detail = await getProjectDetailData(params.projectId);

  if (!detail) {
    return notFound("project not found");
  }

  const body = await request.json();
  const created = await prisma.taskDependency.create({
    data: {
      projectId: detail.project.id,
      predecessorTaskId: body.predecessorTaskId,
      successorTaskId: body.successorTaskId,
      dependencyType: body.dependencyType ?? "FS",
      lagDays: body.lagDays ?? 0,
      createdBy: body.createdBy ?? "user_1"
    }
  });
  await writeProjectLog({
    projectId: detail.project.id,
    activityType: "TASK_DEPENDENCY_CREATED",
    contentSummary: `Created dependency ${created.predecessorTaskId} -> ${created.successorTaskId}.`,
    moduleName: "Dependency",
    actionName: "CreateDependency",
    targetType: "dependency",
    targetId: created.id,
    afterJson: {
      predecessorTaskId: created.predecessorTaskId,
      successorTaskId: created.successorTaskId,
      dependencyType: created.dependencyType,
      lagDays: created.lagDays
    }
  });

  return ok({
    id: created.id,
    projectId: created.projectId,
    predecessorTaskId: created.predecessorTaskId,
    successorTaskId: created.successorTaskId,
    dependencyType: created.dependencyType,
    lagDays: created.lagDays
  });
}
