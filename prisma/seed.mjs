import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
    prisma.projectForward.deleteMany(),
    prisma.projectUrge.deleteMany(),
    prisma.projectAuditLog.deleteMany(),
    prisma.projectReadLog.deleteMany(),
    prisma.projectActivity.deleteMany(),
    prisma.taskComment.deleteMany(),
    prisma.taskDependency.deleteMany(),
    prisma.task.deleteMany(),
    prisma.taskGroup.deleteMany(),
    prisma.projectRelation.deleteMany(),
    prisma.projectTag.deleteMany(),
    prisma.projectMember.deleteMany(),
    prisma.project.deleteMany(),
    prisma.user.deleteMany()
  ]);

  await prisma.user.createMany({
    data: [
      { id: "user_1", name: "Lin Chen", email: "linchen@example.com", department: "Product Engineering" },
      { id: "user_2", name: "Wang Min", email: "wangmin@example.com", department: "Delivery" },
      { id: "user_3", name: "Zhou Yu", email: "zhouyu@example.com", department: "Frontend Experience" },
      { id: "user_4", name: "Zhao Tong", email: "zhaotong@example.com", department: "Sales Ops" },
      { id: "user_5", name: "Chen Ke", email: "chenke@example.com", department: "Platform" }
    ]
  });

  await prisma.project.create({
    data: {
      id: "project_1",
      name: "CRM Phase 2",
      description: "Upgrade CRM workflows, gantt scheduling, and audit coverage.",
      ownerId: "user_1",
      creatorId: "user_1",
      startDate: new Date("2026-03-16T00:00:00.000Z"),
      endDate: new Date("2026-04-30T23:59:59.000Z"),
      status: "ACTIVE",
      visibilityScope: "TEAM",
      reminderConfigJson: { beforeDueHours: 24 },
      tags: {
        create: [{ tagName: "Priority" }, { tagName: "Sales" }]
      },
      members: {
        create: [
          { id: "member_1", userId: "user_1", roleType: "OWNER" },
          { id: "member_2", userId: "user_2", roleType: "PARTICIPANT" },
          { id: "member_3", userId: "user_3", roleType: "PARTICIPANT" },
          { id: "member_4", userId: "user_4", roleType: "VIEWER" }
        ]
      },
      taskGroups: {
        create: [
          { id: "group_1", name: "Planned", sortOrder: 1, isDefault: true },
          { id: "group_2", name: "Ready", sortOrder: 2, isDefault: true },
          { id: "group_3", name: "In Progress", sortOrder: 3, isDefault: true },
          { id: "group_4", name: "Ungrouped", sortOrder: 4, isDefault: true }
        ]
      },
      tasks: {
        create: [
          {
            id: "task_1",
            groupId: "group_1",
            title: "Design database schema",
            description: "Prepare Prisma schema and MySQL migration.",
            assigneeId: "user_2",
            reporterId: "user_1",
            priority: "HIGH",
            status: "DONE",
            progressPercent: 100,
            startAt: new Date("2026-03-16T00:00:00.000Z"),
            endAt: new Date("2026-03-18T23:59:59.000Z"),
            dueAt: new Date("2026-03-18T23:59:59.000Z"),
            sortOrder: 1,
            completedAt: new Date("2026-03-18T10:20:00.000Z")
          },
          {
            id: "task_2",
            groupId: "group_2",
            title: "Implement REST API draft",
            description: "Cover projects, gantt, dependencies, and statistics.",
            assigneeId: "user_1",
            reporterId: "user_1",
            priority: "URGENT",
            status: "IN_PROGRESS",
            progressPercent: 60,
            startAt: new Date("2026-03-19T00:00:00.000Z"),
            endAt: new Date("2026-03-22T23:59:59.000Z"),
            dueAt: new Date("2026-03-22T23:59:59.000Z"),
            sortOrder: 2
          },
          {
            id: "task_3",
            groupId: "group_3",
            title: "Build board and gantt views",
            description: "Render grouped tasks and dependency timeline.",
            assigneeId: "user_3",
            reporterId: "user_1",
            priority: "HIGH",
            status: "READY",
            progressPercent: 25,
            startAt: new Date("2026-03-23T00:00:00.000Z"),
            endAt: new Date("2026-03-30T23:59:59.000Z"),
            dueAt: new Date("2026-03-30T23:59:59.000Z"),
            sortOrder: 1
          }
        ]
      },
      relations: {
        create: [
          { id: "relation_1", relationType: "DOCUMENT", targetId: "doc_123", targetTitle: "Requirements Spec", sourceType: "internal_doc" },
          { id: "relation_2", relationType: "CUSTOMER", targetId: "customer_88", targetTitle: "North Region Key Account", sourceType: "crm" }
        ]
      },
      activities: {
        create: [
          { id: "activity_1", actorId: "user_1", activityType: "PROJECT_CREATED", contentSummary: "Created CRM Phase 2 project." },
          { id: "activity_2", actorId: "user_2", activityType: "TASK_COMPLETED", contentSummary: "Completed database schema design." }
        ]
      },
      readLogs: {
        create: [
          { id: "read_1", userId: "user_2", clientType: "Web" },
          { id: "read_2", userId: "user_4", clientType: "App" }
        ]
      },
      auditLogs: {
        create: [
          { id: "audit_1", userId: "user_1", moduleName: "Project", actionName: "UpdateProject", beforeJson: { status: "DRAFT" }, afterJson: { status: "ACTIVE" } }
        ]
      },
      urges: {
        create: [{ id: "urge_1", senderId: "user_1", receiverId: "user_2", content: "Please update progress before EOD." }]
      },
      forwards: {
        create: [{ id: "forward_1", senderId: "user_1", receiverIds: ["user_5"], message: "Please review dependency setup." }]
      }
    }
  });

  await prisma.taskDependency.createMany({
    data: [
      { id: "dep_1", projectId: "project_1", predecessorTaskId: "task_1", successorTaskId: "task_2", dependencyType: "FS", lagDays: 0 },
      { id: "dep_2", projectId: "project_1", predecessorTaskId: "task_2", successorTaskId: "task_3", dependencyType: "FS", lagDays: 0 }
    ]
  });

  await prisma.taskComment.createMany({
    data: [
      { id: "comment_1", taskId: "task_2", userId: "user_1", content: "API draft now covers core project flows." },
      { id: "comment_2", taskId: "task_3", userId: "user_3", content: "Static gantt first, drag interactions next." }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
