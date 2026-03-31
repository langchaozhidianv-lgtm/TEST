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
  const member = await prisma.projectMember.findFirst({
    where: {
      projectId: params.projectId,
      userId: params.userId,
      roleType: {
        not: "VIEWER"
      }
    }
  });

  if (!member) {
    return notFound("member not found");
  }

  await prisma.projectMember.delete({
    where: {
      id: member.id
    }
  });
  await writeProjectLog({
    projectId: params.projectId,
    activityType: "MEMBER_REMOVED",
    contentSummary: `Removed member ${params.userId}.`,
    moduleName: "Member",
    actionName: "RemoveMember",
    beforeJson: { userId: params.userId }
  });

  return ok({
    success: true,
    id: member.id
  });
}
