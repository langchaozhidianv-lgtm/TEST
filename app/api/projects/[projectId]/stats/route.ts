import { notFound, ok } from "@/lib/api";
import { getProjectById, getProjectStats } from "@/lib/mock-data";

interface RouteContext {
  params: {
    projectId: string;
  };
}

export async function GET(_request: Request, { params }: RouteContext) {
  const project = getProjectById(params.projectId);

  if (!project) {
    return notFound("project not found");
  }

  return ok(getProjectStats(project.id));
}
