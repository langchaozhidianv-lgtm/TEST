import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { ActivityType } from "@/lib/types";

interface LogOptions {
  projectId: string;
  actorId?: string;
  activityType: ActivityType;
  contentSummary: string;
  moduleName: string;
  actionName: string;
  targetType?: string;
  targetId?: string;
  beforeJson?: Record<string, unknown> | null;
  afterJson?: Record<string, unknown> | null;
}

export async function writeProjectLog(options: LogOptions) {
  const actorId = options.actorId ?? "user_1";

  await prisma.$transaction([
    prisma.projectActivity.create({
      data: {
        projectId: options.projectId,
        actorId,
        activityType: options.activityType,
        targetType: options.targetType ?? null,
        targetId: options.targetId ?? null,
        contentSummary: options.contentSummary
      }
    }),
    prisma.projectAuditLog.create({
      data: {
        projectId: options.projectId,
        userId: actorId,
        moduleName: options.moduleName,
        actionName: options.actionName,
        beforeJson: (options.beforeJson as Prisma.InputJsonValue | undefined) ?? undefined,
        afterJson: (options.afterJson as Prisma.InputJsonValue | undefined) ?? undefined
      }
    })
  ]);
}
