import { notFound, ok } from "@/lib/api";
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
    list: detail.relations
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const detail = await getProjectDetailData(params.projectId);

  if (!detail) {
    return notFound("project not found");
  }

  const body = await request.json();
  const created = await prisma.projectRelation.create({
    data: {
      projectId: detail.project.id,
      relationType: body.relationType,
      targetId: body.targetId,
      targetTitle: body.targetTitle,
      sourceType: body.sourceType ?? null,
      createdBy: body.createdBy ?? "user_1"
    }
  });

  return ok({
    id: created.id,
    projectId: created.projectId,
    relationType: created.relationType,
    targetId: created.targetId,
    targetTitle: created.targetTitle,
    sourceType: created.sourceType ?? undefined
  });
}
