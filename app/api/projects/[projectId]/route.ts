import { notFound, ok } from "@/lib/api";
import {
  getDependenciesByProject,
  getProjectById,
  getTaskGroupsByProject,
  getTasksByProject
} from "@/lib/mock-data";

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
    project,
    taskGroups: getTaskGroupsByProject(project.id),
    tasks: getTasksByProject(project.id),
    dependencies: getDependenciesByProject(project.id)
  });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const project = getProjectById(params.projectId);

  if (!project) {
    return notFound("project not found");
  }

  const body = await request.json();

  return ok({
    ...project,
    ...body,
    updatedAt: new Date().toISOString()
  });
}
