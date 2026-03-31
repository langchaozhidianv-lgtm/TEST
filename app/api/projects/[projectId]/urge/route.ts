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
  const created = await prisma.$transaction(
    (body.receiverIds ?? []).map((receiverId: string) =>
      prisma.projectUrge.create({
        data: {
          projectId: detail.project.id,
          senderId: body.senderId ?? "user_1",
          receiverId,
          content: body.content ?? ""
        }
      })
    )
  );

  return ok({
    list: created.map((item) => ({
      id: item.id,
      projectId: item.projectId,
      senderId: item.senderId,
      receiverIds: [item.receiverId],
      content: item.content,
      createdAt: item.createdAt.toISOString()
    }))
  });
}
