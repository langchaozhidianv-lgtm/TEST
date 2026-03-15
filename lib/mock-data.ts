import { calculateProjectStats, calculateTeamStats } from "@/lib/stats";
import type {
  Project,
  ProjectActivity,
  ProjectAuditLog,
  ProjectForward,
  ProjectMemberRecord,
  ProjectReadLog,
  ProjectRelation,
  ProjectShareLink,
  ProjectStats,
  ProjectUrge,
  Task,
  TaskComment,
  TaskDependency,
  TaskGroup,
  TeamStats,
  User
} from "@/lib/types";

export const users: User[] = [
  { id: "user_1", name: "林晨", email: "linchen@example.com", department: "产品研发" },
  { id: "user_2", name: "王敏", email: "wangmin@example.com", department: "交付实施" },
  { id: "user_3", name: "周宇", email: "zhouyu@example.com", department: "前端体验" },
  { id: "user_4", name: "赵彤", email: "zhaotong@example.com", department: "销售运营" },
  { id: "user_5", name: "陈可", email: "chenke@example.com", department: "平台架构" }
];

export const projects: Project[] = [
  {
    id: "project_1",
    name: "CRM 二期项目",
    description: "升级客户全链路管理流程，串联审批、商机与销售漏斗分析。",
    ownerId: "user_1",
    creatorId: "user_1",
    startDate: "2026-03-16T00:00:00.000Z",
    endDate: "2026-04-30T23:59:59.000Z",
    status: "ACTIVE",
    visibilityScope: "TEAM",
    tags: ["重点项目", "销售"],
    participantIds: ["user_2", "user_3"],
    shareUserIds: ["user_4"],
    reminderConfigJson: { beforeDueHours: 24 },
    updatedAt: "2026-03-15T08:30:00.000Z",
    createdAt: "2026-03-14T09:00:00.000Z"
  },
  {
    id: "project_2",
    name: "交付平台重构",
    description: "面向实施团队重构交付看板，补齐日志与项目统计。",
    ownerId: "user_2",
    creatorId: "user_1",
    startDate: "2026-03-10T00:00:00.000Z",
    endDate: "2026-05-08T23:59:59.000Z",
    status: "ACTIVE",
    visibilityScope: "SPECIFIC",
    tags: ["平台", "交付"],
    participantIds: ["user_1", "user_5"],
    shareUserIds: [],
    updatedAt: "2026-03-15T07:10:00.000Z",
    createdAt: "2026-03-09T09:00:00.000Z"
  },
  {
    id: "project_3",
    name: "经营分析报表整理",
    description: "梳理月度经营分析报表口径并沉淀模板。",
    ownerId: "user_3",
    creatorId: "user_3",
    startDate: "2026-02-01T00:00:00.000Z",
    endDate: "2026-02-28T23:59:59.000Z",
    status: "CLOSED",
    visibilityScope: "TEAM",
    tags: ["财务", "复盘"],
    participantIds: ["user_4"],
    shareUserIds: ["user_1"],
    updatedAt: "2026-02-28T16:00:00.000Z",
    createdAt: "2026-01-29T09:00:00.000Z"
  }
];

export const taskGroups: TaskGroup[] = [
  { id: "group_1", projectId: "project_1", name: "计划中", sortOrder: 1, isDefault: true },
  { id: "group_2", projectId: "project_1", name: "准备做", sortOrder: 2, isDefault: true },
  { id: "group_3", projectId: "project_1", name: "正在做", sortOrder: 3, isDefault: true },
  { id: "group_4", projectId: "project_1", name: "无分组任务", sortOrder: 4, isDefault: true },
  { id: "group_5", projectId: "project_2", name: "计划中", sortOrder: 1, isDefault: true },
  { id: "group_6", projectId: "project_2", name: "联调阶段", sortOrder: 2, isDefault: false }
];

export const projectMembers: ProjectMemberRecord[] = [
  { id: "member_1", projectId: "project_1", userId: "user_1", roleType: "OWNER", joinedAt: "2026-03-14T09:00:00.000Z" },
  { id: "member_2", projectId: "project_1", userId: "user_2", roleType: "PARTICIPANT", joinedAt: "2026-03-14T09:10:00.000Z" },
  { id: "member_3", projectId: "project_1", userId: "user_3", roleType: "PARTICIPANT", joinedAt: "2026-03-14T09:10:00.000Z" },
  { id: "member_4", projectId: "project_1", userId: "user_4", roleType: "VIEWER", joinedAt: "2026-03-14T09:20:00.000Z" },
  { id: "member_5", projectId: "project_2", userId: "user_2", roleType: "OWNER", joinedAt: "2026-03-09T09:00:00.000Z" },
  { id: "member_6", projectId: "project_2", userId: "user_1", roleType: "PARTICIPANT", joinedAt: "2026-03-09T09:10:00.000Z" },
  { id: "member_7", projectId: "project_2", userId: "user_5", roleType: "PARTICIPANT", joinedAt: "2026-03-09T09:10:00.000Z" }
];

export const tasks: Task[] = [
  {
    id: "task_1",
    projectId: "project_1",
    groupId: "group_1",
    title: "设计数据库表结构",
    description: "输出项目管理系统 Prisma Schema 与 MySQL Migration。",
    assigneeId: "user_2",
    reporterId: "user_1",
    priority: "HIGH",
    status: "DONE",
    progressPercent: 100,
    startAt: "2026-03-16T00:00:00.000Z",
    endAt: "2026-03-18T23:59:59.000Z",
    dueAt: "2026-03-18T23:59:59.000Z",
    sortOrder: 1,
    completedAt: "2026-03-18T10:20:00.000Z"
  },
  {
    id: "task_2",
    projectId: "project_1",
    groupId: "group_2",
    title: "实现 REST API 草案",
    description: "按项目、任务、依赖、统计等维度输出接口。",
    assigneeId: "user_1",
    reporterId: "user_1",
    priority: "URGENT",
    status: "IN_PROGRESS",
    progressPercent: 60,
    startAt: "2026-03-19T00:00:00.000Z",
    endAt: "2026-03-22T23:59:59.000Z",
    dueAt: "2026-03-22T23:59:59.000Z",
    sortOrder: 2
  },
  {
    id: "task_3",
    projectId: "project_1",
    groupId: "group_3",
    title: "搭建任务看板与甘特图",
    description: "完成列表、分组、时间轴与依赖展示。",
    assigneeId: "user_3",
    reporterId: "user_1",
    priority: "HIGH",
    status: "READY",
    progressPercent: 25,
    startAt: "2026-03-23T00:00:00.000Z",
    endAt: "2026-03-30T23:59:59.000Z",
    dueAt: "2026-03-30T23:59:59.000Z",
    sortOrder: 1
  },
  {
    id: "task_4",
    projectId: "project_1",
    groupId: "group_4",
    title: "补齐动态流与日志",
    description: "关键操作留痕，支持详情页查看。",
    assigneeId: "user_4",
    reporterId: "user_1",
    priority: "MEDIUM",
    status: "TODO",
    progressPercent: 0,
    startAt: "2026-03-31T00:00:00.000Z",
    endAt: "2026-04-02T23:59:59.000Z",
    dueAt: "2026-04-02T23:59:59.000Z",
    sortOrder: 1
  },
  {
    id: "task_5",
    projectId: "project_2",
    groupId: "group_5",
    title: "梳理遗留接口",
    description: "收敛旧交付平台的接口差异。",
    assigneeId: "user_5",
    reporterId: "user_2",
    priority: "HIGH",
    status: "BLOCKED",
    progressPercent: 35,
    startAt: "2026-03-11T00:00:00.000Z",
    endAt: "2026-03-20T23:59:59.000Z",
    dueAt: "2026-03-20T23:59:59.000Z",
    sortOrder: 1
  }
];

export const dependencies: TaskDependency[] = [
  {
    id: "dep_1",
    projectId: "project_1",
    predecessorTaskId: "task_1",
    successorTaskId: "task_2",
    dependencyType: "FS",
    lagDays: 0
  },
  {
    id: "dep_2",
    projectId: "project_1",
    predecessorTaskId: "task_2",
    successorTaskId: "task_3",
    dependencyType: "FS",
    lagDays: 0
  },
  {
    id: "dep_3",
    projectId: "project_1",
    predecessorTaskId: "task_3",
    successorTaskId: "task_4",
    dependencyType: "SS",
    lagDays: 1
  }
];

export const taskComments: TaskComment[] = [
  {
    id: "comment_1",
    taskId: "task_2",
    userId: "user_1",
    content: "接口列表已经覆盖项目、任务、甘特图和依赖。",
    createdAt: "2026-03-15T08:20:00.000Z"
  },
  {
    id: "comment_2",
    taskId: "task_3",
    userId: "user_3",
    content: "甘特图先做静态可视化，下一轮接拖拽。",
    createdAt: "2026-03-15T09:05:00.000Z"
  }
];

export const activities: ProjectActivity[] = [
  {
    id: "activity_1",
    projectId: "project_1",
    actorId: "user_1",
    activityType: "PROJECT_CREATED",
    contentSummary: "创建项目 CRM 二期项目。",
    createdAt: "2026-03-14T09:00:00.000Z"
  },
  {
    id: "activity_2",
    projectId: "project_1",
    actorId: "user_1",
    activityType: "TASK_CREATED",
    contentSummary: "新增任务“实现 REST API 草案”。",
    createdAt: "2026-03-15T07:50:00.000Z"
  },
  {
    id: "activity_3",
    projectId: "project_1",
    actorId: "user_2",
    activityType: "TASK_COMPLETED",
    contentSummary: "完成任务“设计数据库表结构”。",
    createdAt: "2026-03-18T10:20:00.000Z"
  },
  {
    id: "activity_4",
    projectId: "project_1",
    actorId: "user_3",
    activityType: "TASK_DEPENDENCY_CREATED",
    contentSummary: "新增依赖 task_2 -> task_3（FS）。",
    createdAt: "2026-03-15T09:10:00.000Z"
  }
];

export const relations: ProjectRelation[] = [
  {
    id: "relation_1",
    projectId: "project_1",
    relationType: "DOCUMENT",
    targetId: "doc_123",
    targetTitle: "项目管理系统需求说明书",
    sourceType: "internal_doc"
  },
  {
    id: "relation_2",
    projectId: "project_1",
    relationType: "CUSTOMER",
    targetId: "customer_88",
    targetTitle: "华北大区重点客户",
    sourceType: "crm"
  }
];

export const readLogs: ProjectReadLog[] = [
  {
    id: "read_1",
    projectId: "project_1",
    userId: "user_2",
    clientType: "Web",
    readAt: "2026-03-15T07:40:00.000Z"
  },
  {
    id: "read_2",
    projectId: "project_1",
    userId: "user_4",
    clientType: "App",
    readAt: "2026-03-15T08:15:00.000Z"
  }
];

export const auditLogs: ProjectAuditLog[] = [
  {
    id: "audit_1",
    projectId: "project_1",
    userId: "user_1",
    moduleName: "Project",
    actionName: "UpdateProject",
    beforeJson: { status: "DRAFT" },
    afterJson: { status: "ACTIVE" },
    createdAt: "2026-03-14T09:05:00.000Z"
  },
  {
    id: "audit_2",
    projectId: "project_1",
    userId: "user_3",
    moduleName: "Dependency",
    actionName: "CreateDependency",
    beforeJson: {},
    afterJson: { predecessorTaskId: "task_2", successorTaskId: "task_3", dependencyType: "FS" },
    createdAt: "2026-03-15T09:10:00.000Z"
  }
];

export const urges: ProjectUrge[] = [
  {
    id: "urge_1",
    projectId: "project_1",
    senderId: "user_1",
    receiverIds: ["user_2", "user_3"],
    content: "请今天下班前更新任务进度和剩余风险。",
    createdAt: "2026-03-15T10:00:00.000Z"
  }
];

export const forwards: ProjectForward[] = [
  {
    id: "forward_1",
    projectId: "project_1",
    senderId: "user_1",
    receiverIds: ["user_5"],
    message: "请帮忙评审依赖关系和里程碑拆分。",
    createdAt: "2026-03-15T10:15:00.000Z"
  }
];

export function getProjects() {
  return projects;
}

export function getProjectById(projectId: string) {
  return projects.find((project) => project.id === projectId);
}

export function getTaskGroupsByProject(projectId: string) {
  return taskGroups
    .filter((group) => group.projectId === projectId)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function getTasksByProject(projectId: string) {
  return tasks
    .filter((task) => task.projectId === projectId)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function getTaskById(taskId: string) {
  return tasks.find((task) => task.id === taskId);
}

export function getDependenciesByProject(projectId: string) {
  return dependencies.filter((dependency) => dependency.projectId === projectId);
}

export function getCommentsByTask(taskId: string) {
  return taskComments.filter((comment) => comment.taskId === taskId);
}

export function getActivitiesByProject(projectId: string) {
  return activities
    .filter((activity) => activity.projectId === projectId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function getRelationsByProject(projectId: string) {
  return relations.filter((relation) => relation.projectId === projectId);
}

export function getReadLogsByProject(projectId: string) {
  return readLogs.filter((log) => log.projectId === projectId);
}

export function getAuditLogsByProject(projectId: string) {
  return auditLogs.filter((log) => log.projectId === projectId);
}

export function getUser(userId?: string) {
  return users.find((user) => user.id === userId);
}

export function getProjectMembers(projectId: string) {
  return projectMembers.filter((member) => member.projectId === projectId);
}

export function getProjectParticipants(projectId: string) {
  return getProjectMembers(projectId)
    .filter((member) => member.roleType !== "VIEWER")
    .map((member) => ({
      ...member,
      user: getUser(member.userId)
    }));
}

export function getProjectViewers(projectId: string) {
  return getProjectMembers(projectId)
    .filter((member) => member.roleType === "VIEWER")
    .map((member) => ({
      ...member,
      user: getUser(member.userId)
    }));
}

export function getTaskGroupsWithTasks(projectId: string) {
  return getTaskGroupsByProject(projectId).map((group) => ({
    ...group,
    tasks: getTasksByProject(projectId).filter((task) => task.groupId === group.id)
  }));
}

export function getProjectStats(projectId: string): ProjectStats {
  return calculateProjectStats(getTasksByProject(projectId));
}

export function getTeamStats(): TeamStats {
  const base = calculateTeamStats(projects, tasks);
  const departments = Array.from(
    new Set(users.map((user) => user.department).filter(Boolean))
  ) as string[];

  return {
    ...base,
    departmentBreakdown: departments.map((department) => {
      const departmentUsers = users.filter((user) => user.department === department).map((user) => user.id);
      const departmentProjects = projects.filter((project) =>
        [project.ownerId, ...project.participantIds, ...project.shareUserIds].some((id) =>
          departmentUsers.includes(id)
        )
      );
      const departmentTasks = tasks.filter((task) => departmentUsers.includes(task.assigneeId ?? ""));
      const stats = calculateProjectStats(departmentTasks);

      return {
        name: department,
        projectCount: departmentProjects.length,
        completionRate: stats.completionRate
      };
    }),
    memberRanking: users.map((user) => {
      const assigned = tasks.filter((task) => task.assigneeId === user.id);
      const stats = calculateProjectStats(assigned);

      return {
        userId: user.id,
        doneTasks: stats.doneTasks,
        overdueTasks: stats.overdueTasks
      };
    })
  };
}

export function getProjectUrges(projectId: string) {
  return urges.filter((urge) => urge.projectId === projectId);
}

export function getProjectForwards(projectId: string) {
  return forwards.filter((forward) => forward.projectId === projectId);
}

export function createShareLink(projectId: string, expireInHours = 24): ProjectShareLink {
  const expireAt = new Date(Date.now() + expireInHours * 60 * 60 * 1000).toISOString();

  return {
    projectId,
    url: `http://localhost:3000/projects/${projectId}?shared=1`,
    expireAt
  };
}
