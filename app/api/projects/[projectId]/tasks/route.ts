import { notFound, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getProjectDetailData, getTasksForProjectData } from "@/lib/server-data";

interface RouteContext {
  params: {
    projectId: string;
  };
}

export async function GET(request: Request, { params }: RouteContext) {
  const detail = await getProjectDetailData(params.projectId);

  if (!detail) {
    return notFound("project not found");
  }

  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");
  const assigneeId = searchParams.get("assigneeId");
  const status = searchParams.get("status");
  const keyword = searchParams.get("keyword")?.trim().toLowerCase();

  const list = (await getTasksForProjectData(detail.project.id)).filter((task) => {
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
  const detail = await getProjectDetailData(params.projectId);

  if (!detail) {
    return notFound("project not found");
  }

  const body = await request.json();

  const created = await prisma.task.create({
    data: {
      projectId: detail.project.id,
      groupId: body.groupId ?? null,
      title: body.title,
      description: body.description ?? null,
      assigneeId: body.assigneeId ?? null,
      reporterId: body.reporterId ?? null,
      priority: body.priority ?? "MEDIUM",
      status: body.status ?? "TODO",
      progressPercent: body.progressPercent ?? 0,
      startAt: body.startAt ? new Date(body.startAt) : null,
      endAt: body.endAt ? new Date(body.endAt) : null,
      dueAt: body.dueAt ? new Date(body.dueAt) : body.endAt ? new Date(body.endAt) : null,
      sortOrder: body.sortOrder ?? 0
    }
  });

  return ok({
    id: created.id,
    projectId: created.projectId,
    groupId: created.groupId ?? undefined,
    title: created.title,
    description: created.description ?? undefined,
    assigneeId: created.assigneeId ?? undefined,
    reporterId: created.reporterId ?? undefined,
    priority: created.priority,
    status: created.status,
    progressPercent: created.progressPercent,
    startAt: created.startAt?.toISOString(),
    endAt: created.endAt?.toISOString(),
    dueAt: created.dueAt?.toISOString(),
    sortOrder: created.sortOrder,
    completedAt: created.completedAt?.toISOString()
  });
}
