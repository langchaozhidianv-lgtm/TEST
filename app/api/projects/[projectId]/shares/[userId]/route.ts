import { notFound, ok } from "@/lib/api";
import { writeProjectLog } from "@/lib/activity-log";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: {
    projectId: string;
    userId: string;
  };
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const share = await prisma.projectMember.findFirst({
    where: {
      projectId: params.projectId,
      userId: params.userId,
      roleType: "VIEWER"
    }
  });

  if (!share) {
    return notFound("share not found");
  }

  await prisma.projectMember.delete({
    where: {
      id: share.id
    }
  });
  await writeProjectLog({
    projectId: params.projectId,
    activityType: "SHARE_REMOVED",
    contentSummary: `Removed shared viewer ${params.userId}.`,
    moduleName: "Share",
    actionName: "RemoveShare",
    beforeJson: { userId: params.userId }
  });

  return ok({
    success: true,
    id: share.id
  });
}
