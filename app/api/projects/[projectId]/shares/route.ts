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
    list: detail.viewers
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const detail = await getProjectDetailData(params.projectId);

  if (!detail) {
    return notFound("project not found");
  }

  const body = await request.json();
  const created = await prisma.$transaction(
    (body.userIds ?? []).map((userId: string) =>
      prisma.projectMember.create({
        data: {
          projectId: detail.project.id,
          userId,
          roleType: "VIEWER"
        }
      })
    )
  );
  await writeProjectLog({
    projectId: detail.project.id,
    activityType: "SHARE_ADDED",
    contentSummary: `Shared project with ${created.length} viewer(s).`,
    moduleName: "Share",
    actionName: "AddShares",
    afterJson: { userIds: body.userIds ?? [] }
  });

  return ok({
    created: created.map((member) => ({
      id: member.id,
      projectId: member.projectId,
      userId: member.userId,
      roleType: member.roleType,
      joinedAt: member.joinedAt.toISOString()
    }))
  });
}
