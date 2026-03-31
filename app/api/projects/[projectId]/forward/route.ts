import { notFound, ok } from "@/lib/api";
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
  const created = await prisma.projectForward.create({
    data: {
      projectId: detail.project.id,
      senderId: body.senderId ?? "user_1",
      receiverIds: body.receiverIds ?? [],
      message: body.message ?? null
    }
  });

  return ok({
    id: created.id,
    projectId: created.projectId,
    senderId: created.senderId,
    receiverIds: Array.isArray(created.receiverIds) ? created.receiverIds : [],
    message: created.message ?? undefined,
    createdAt: created.createdAt.toISOString()
  });
}
