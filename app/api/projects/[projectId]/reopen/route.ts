import { notFound, ok } from "@/lib/api";
import { getProjectById } from "@/lib/mock-data";

interface RouteContext {
  params: {
    projectId: string;
  };
}

export async function POST(_request: Request, { params }: RouteContext) {
  const project = getProjectById(params.projectId);

  if (!project) {
    return notFound("project not found");
  }

  return ok({
    ...project,
    status: "ACTIVE",
    updatedAt: new Date().toISOString()
  });
}
