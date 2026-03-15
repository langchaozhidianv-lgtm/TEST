import { notFound, ok } from "@/lib/api";
import { getProjectById } from "@/lib/mock-data";

interface RouteContext {
  params: {
    projectId: string;
  };
}

export async function POST(request: Request, { params }: RouteContext) {
  const project = getProjectById(params.projectId);

  if (!project) {
    return notFound("project not found");
  }

  const body = await request.json();

  return ok({
    id: crypto.randomUUID(),
    projectId: project.id,
    lagDays: 0,
    ...body
  });
}
