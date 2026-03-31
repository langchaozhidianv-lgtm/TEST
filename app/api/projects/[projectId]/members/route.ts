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
    list: detail.participants
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
          roleType: body.roleType ?? "PARTICIPANT"
        }
      })
    )
  );
  await writeProjectLog({
    projectId: detail.project.id,
    activityType: "MEMBER_ADDED",
    contentSummary: `Added ${created.length} project member(s).`,
    moduleName: "Member",
    actionName: "AddMembers",
    afterJson: { userIds: body.userIds ?? [], roleType: body.roleType ?? "PARTICIPANT" }
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
