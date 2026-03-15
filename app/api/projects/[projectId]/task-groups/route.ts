import { notFound, ok } from "@/lib/api";
import { getProjectById, getTaskGroupsByProject, getTaskGroupsWithTasks } from "@/lib/mock-data";

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
    list: getTaskGroupsWithTasks(project.id)
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const project = getProjectById(params.projectId);

  if (!project) {
    return notFound("project not found");
  }

  const body = await request.json();
  const currentGroups = getTaskGroupsByProject(project.id);

  return ok({
    id: crypto.randomUUID(),
    projectId: project.id,
    name: body.name,
    sortOrder: body.sortOrder ?? currentGroups.length + 1,
    isDefault: false
  });
}
