import { notFound, ok } from "@/lib/api";
import { writeProjectLog } from "@/lib/activity-log";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: {
    projectId: string;
    dependencyId: string;
  };
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const dependency = await prisma.taskDependency.findUnique({
    where: {
      id: params.dependencyId
    }
  });

  if (!dependency || dependency.projectId !== params.projectId) {
    return notFound("dependency not found");
  }

  await prisma.taskDependency.delete({
    where: {
      id: params.dependencyId
    }
  });
  await writeProjectLog({
    projectId: params.projectId,
    activityType: "TASK_DEPENDENCY_DELETED",
    contentSummary: `Deleted dependency ${dependency.predecessorTaskId} -> ${dependency.successorTaskId}.`,
    moduleName: "Dependency",
    actionName: "DeleteDependency",
    targetType: "dependency",
    targetId: dependency.id,
    beforeJson: {
      predecessorTaskId: dependency.predecessorTaskId,
      successorTaskId: dependency.successorTaskId,
      dependencyType: dependency.dependencyType
    }
  });

  return ok({
    success: true,
    id: params.dependencyId
  });
}
