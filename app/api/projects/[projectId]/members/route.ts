import { notFound, ok } from "@/lib/api";
import { getProjectById, getProjectParticipants } from "@/lib/mock-data";

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

  return ok({
    list: getProjectParticipants(project.id)
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const project = getProjectById(params.projectId);

  if (!project) {
    return notFound("project not found");
  }

  const body = await request.json();

  return ok({
    created: (body.userIds ?? []).map((userId: string) => ({
      id: crypto.randomUUID(),
      projectId: project.id,
      userId,
      roleType: body.roleType ?? "PARTICIPANT",
      joinedAt: new Date().toISOString()
    }))
  });
}
