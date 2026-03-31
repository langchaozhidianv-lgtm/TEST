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
      status: "ACTIVE",
      closedAt: null
    }
  });
  await writeProjectLog({
    projectId: params.projectId,
    activityType: "PROJECT_REOPENED",
    contentSummary: `Reopened project ${detail.project.name}.`,
    moduleName: "Project",
    actionName: "ReopenProject",
    beforeJson: { status: detail.project.status },
    afterJson: { status: "ACTIVE" }
  });

  return ok({
    ...detail.project,
    status: "ACTIVE",
    updatedAt: new Date().toISOString()
  });
}
