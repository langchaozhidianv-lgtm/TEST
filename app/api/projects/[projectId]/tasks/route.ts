import { notFound, ok } from "@/lib/api";
import { getProjectById, getTasksByProject } from "@/lib/mock-data";

interface RouteContext {
  params: {
    projectId: string;
  };
}

export async function GET(request: Request, { params }: RouteContext) {
  const project = getProjectById(params.projectId);

  if (!project) {
    return notFound("project not found");
  }

  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");
  const assigneeId = searchParams.get("assigneeId");
  const status = searchParams.get("status");
  const keyword = searchParams.get("keyword")?.trim().toLowerCase();

  const list = getTasksByProject(project.id).filter((task) => {
    if (groupId && task.groupId !== groupId) {
      return false;
    }

    if (assigneeId && task.assigneeId !== assigneeId) {
      return false;
    }

    if (status && task.status !== status) {
      return false;
    }

    if (keyword && !task.title.toLowerCase().includes(keyword)) {
      return false;
    }

    return true;
  });

  return ok({
    list
  });
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
    priority: "MEDIUM",
    status: "TODO",
    progressPercent: 0,
    sortOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...body
  });
}
