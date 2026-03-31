import { notFound, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: {
    projectId: string;
    relationId: string;
  };
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const relation = await prisma.projectRelation.findUnique({
    where: {
      id: params.relationId
    }
  });

  if (!relation || relation.projectId !== params.projectId) {
    return notFound("relation not found");
  }

  await prisma.projectRelation.delete({
    where: {
      id: params.relationId
    }
  });

  return ok({
    success: true,
    id: params.relationId
  });
}
