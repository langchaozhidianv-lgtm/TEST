import { notFound, ok } from "@/lib/api";
import { writeProjectLog } from "@/lib/activity-log";
import { prisma } from "@/lib/prisma";
import { getProjectDetailData } from "@/lib/server-data";

interface RouteContext {
  params: {
    projectId: string;
  };
}

export async function POST(_request: Request, { params }: RouteContext) {
  const detail = await getProjectDetailData(params.projectId);

  if (!detail) {
    return notFound("project not found");
  }

  await prisma.project.update({
    where: {
      id: params.projectId
    },
    data: {
      status: "CLOSED",
      closedAt: new Date()
    }
  });
  await writeProjectLog({
    projectId: params.projectId,
    activityType: "PROJECT_CLOSED",
    contentSummary: `Closed project ${detail.project.name}.`,
    moduleName: "Project",
    actionName: "CloseProject",
    beforeJson: { status: detail.project.status },
    afterJson: { status: "CLOSED" }
  });

  return ok({
    ...detail.project,
    status: "CLOSED",
    updatedAt: new Date().toISOString(),
    closedAt: new Date().toISOString()
  });
}
