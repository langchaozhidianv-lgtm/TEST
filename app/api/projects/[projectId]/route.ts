import { notFound, ok } from "@/lib/api";
import { getProjectDetailData } from "@/lib/server-data";
import { prisma } from "@/lib/prisma";

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
    project: detail.project,
    taskGroups: detail.groups,
    tasks: detail.tasks,
    dependencies: detail.dependencies
  });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const detail = await getProjectDetailData(params.projectId);

  if (!detail) {
    return notFound("project not found");
  }

  const body = await request.json();
  const participantIds = Array.isArray(body.participantIds) ? body.participantIds : undefined;
  const shareUserIds = Array.isArray(body.shareUserIds) ? body.shareUserIds : undefined;
  const tags = Array.isArray(body.tags) ? body.tags : undefined;

  await prisma.project.update({
    where: {
      id: params.projectId
    },
    data: {
      name: body.name ?? detail.project.name,
      description: body.description ?? detail.project.description,
      ownerId: body.ownerId ?? detail.project.ownerId,
      startDate: body.startDate ? new Date(body.startDate) : body.startDate === null ? null : undefined,
      endDate: body.endDate ? new Date(body.endDate) : body.endDate === null ? null : undefined,
      visibilityScope: body.visibilityScope ?? detail.project.visibilityScope,
      reminderConfigJson: body.reminderConfigJson ?? detail.project.reminderConfigJson,
      tags: tags
        ? {
            deleteMany: {},
            create: tags.map((tagName: string) => ({
              tagName
            }))
          }
        : undefined,
      members:
        participantIds || shareUserIds
          ? {
              deleteMany: {
                roleType: {
                  in: ["PARTICIPANT", "VIEWER", "FOLLOWER"]
                }
              },
              create: [
                ...(participantIds ?? detail.project.participantIds).map((userId: string) => ({
                  userId,
                  roleType: "PARTICIPANT" as const
                })),
                ...(shareUserIds ?? detail.project.shareUserIds).map((userId: string) => ({
                  userId,
                  roleType: "VIEWER" as const
                }))
              ]
            }
          : undefined
    }
  });

  const updated = await getProjectDetailData(params.projectId);

  return ok(updated?.project ?? detail.project);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const detail = await getProjectDetailData(params.projectId);

  if (!detail) {
    return notFound("project not found");
  }

  await prisma.project.delete({
    where: {
      id: params.projectId
    }
  });

  return ok({
    success: true,
    id: params.projectId
  });
}
