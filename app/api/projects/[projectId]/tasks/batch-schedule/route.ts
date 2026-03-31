import { notFound, ok } from "@/lib/api";
import { writeProjectLog } from "@/lib/activity-log";
import { prisma } from "@/lib/prisma";
import { getProjectDetailData } from "@/lib/server-data";

interface RouteContext {
  params: {
    projectId: string;
  };
}

export async function POST(request: Request, { params }: RouteContext) {
  const detail = await getProjectDetailData(params.projectId);

  if (!detail) {
    return notFound("project not found");
  }

  const body = await request.json();
  const items = Array.isArray(body.items) ? body.items : [];

  const updated = await prisma.$transaction(
    items.map((item: { taskId: string; startAt?: string; endAt?: string }) =>
      prisma.task.update({
        where: { id: item.taskId },
        data: {
          startAt: item.startAt ? new Date(item.startAt) : null,
          endAt: item.endAt ? new Date(item.endAt) : null,
          dueAt: item.endAt ? new Date(item.endAt) : null
        }
      })
    )
  );

  await writeProjectLog({
    projectId: params.projectId,
    activityType: "TASK_DATES_UPDATED",
    contentSummary: `Updated schedule for ${updated.length} task(s).`,
    moduleName: "Gantt",
    actionName: "BatchSchedule",
    afterJson: { taskIds: updated.map((task) => task.id) }
  });

  return ok({
    list: updated.map((task) => ({
      id: task.id,
      startAt: task.startAt?.toISOString(),
      endAt: task.endAt?.toISOString()
    }))
  });
}
