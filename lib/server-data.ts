import type {
  ActivityType,
  DependencyType,
  MemberRoleType,
  Project,
  ProjectStatus,
  ProjectActivity,
  ProjectAuditLog,
  ProjectForward,
  ProjectReadLog,
  ProjectRelation,
  ProjectShareLink,
  ProjectStats,
  ProjectUrge,
  RelationType,
  Task,
  TaskComment,
  TaskDependency,
  TaskGroup,
  TaskPriority,
  TaskStatus,
  TeamStats,
  User
} from "@/lib/types";
import {
  createShareLink,
  getActivitiesByProject,
  getAuditLogsByProject,
  getCommentsByTask,
  getDependenciesByProject,
  getProjectById,
  getProjectForwards,
  getProjectParticipants,
  getProjects,
  getProjectStats,
  getProjectUrges,
  getProjectViewers,
  getReadLogsByProject,
  getRelationsByProject,
  getTaskById,
  getTaskGroupsByProject,
  getTasksByProject,
  getTeamStats,
  getUser
} from "@/lib/mock-data";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { calculateProjectStats } from "@/lib/stats";

type QueryResult<T> = Promise<T>;

interface ProjectDetailData {
  project: Project;
  groups: TaskGroup[];
  tasks: Task[];
  dependencies: TaskDependency[];
  activities: ProjectActivity[];
  stats: ProjectStats;
  relations: ProjectRelation[];
  readLogs: ProjectReadLog[];
  auditLogs: ProjectAuditLog[];
  participants: Array<{ id: string; projectId: string; userId: string; roleType: MemberRoleType; joinedAt: string; user?: User }>;
  viewers: Array<{ id: string; projectId: string; userId: string; roleType: MemberRoleType; joinedAt: string; user?: User }>;
  urges: ProjectUrge[];
  forwards: ProjectForward[];
  shareLink: ProjectShareLink;
}

function mapUser(user: { id: string; name: string; email: string | null; department: string | null }): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email ?? undefined,
    department: user.department ?? undefined
  };
}

function mapTask(task: {
  id: string;
  projectId: string;
  groupId: string | null;
  title: string;
  description: string | null;
  assigneeId: string | null;
  reporterId: string | null;
  priority: string;
  status: string;
  progressPercent: number;
  startAt: Date | null;
  endAt: Date | null;
  dueAt: Date | null;
  sortOrder: number;
  completedAt: Date | null;
}): Task {
  return {
    id: task.id,
    projectId: task.projectId,
    groupId: task.groupId ?? undefined,
    title: task.title,
    description: task.description ?? undefined,
    assigneeId: task.assigneeId ?? undefined,
    reporterId: task.reporterId ?? undefined,
    priority: task.priority as TaskPriority,
    status: task.status as TaskStatus,
    progressPercent: task.progressPercent,
    startAt: task.startAt?.toISOString(),
    endAt: task.endAt?.toISOString(),
    dueAt: task.dueAt?.toISOString(),
    sortOrder: task.sortOrder,
    completedAt: task.completedAt?.toISOString()
  };
}

function mapProject(project: {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  creatorId: string;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
  visibilityScope: string;
  reminderConfigJson: unknown;
  createdAt: Date;
  updatedAt: Date;
  tags: Array<{ tagName: string }>;
  members: Array<{ userId: string; roleType: string }>;
}): Project {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? undefined,
    ownerId: project.ownerId,
    creatorId: project.creatorId,
    startDate: project.startDate?.toISOString(),
    endDate: project.endDate?.toISOString(),
    status: project.status as Project["status"],
    visibilityScope: project.visibilityScope as Project["visibilityScope"],
    tags: project.tags.map((tag) => tag.tagName),
    participantIds: project.members
      .filter((member) => member.roleType !== "VIEWER")
      .map((member) => member.userId),
    shareUserIds: project.members
      .filter((member) => member.roleType === "VIEWER")
      .map((member) => member.userId),
    reminderConfigJson: (project.reminderConfigJson as Record<string, unknown> | null) ?? undefined,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString()
  };
}

function mapTaskGroup(group: { id: string; projectId: string; name: string; sortOrder: number; isDefault: boolean }): TaskGroup {
  return {
    id: group.id,
    projectId: group.projectId,
    name: group.name,
    sortOrder: group.sortOrder,
    isDefault: group.isDefault
  };
}

function mapDependency(dependency: {
  id: string;
  projectId: string;
  predecessorTaskId: string;
  successorTaskId: string;
  dependencyType: string;
  lagDays: number;
}): TaskDependency {
  return {
    id: dependency.id,
    projectId: dependency.projectId,
    predecessorTaskId: dependency.predecessorTaskId,
    successorTaskId: dependency.successorTaskId,
    dependencyType: dependency.dependencyType as DependencyType,
    lagDays: dependency.lagDays
  };
}

function mapActivity(activity: {
  id: string;
  projectId: string;
  actorId: string;
  activityType: string;
  contentSummary: string;
  createdAt: Date;
}): ProjectActivity {
  return {
    id: activity.id,
    projectId: activity.projectId,
    actorId: activity.actorId,
    activityType: activity.activityType as ActivityType,
    contentSummary: activity.contentSummary,
    createdAt: activity.createdAt.toISOString()
  };
}

function mapRelation(relation: {
  id: string;
  projectId: string;
  relationType: string;
  targetId: string;
  targetTitle: string;
  sourceType: string | null;
}): ProjectRelation {
  return {
    id: relation.id,
    projectId: relation.projectId,
    relationType: relation.relationType as RelationType,
    targetId: relation.targetId,
    targetTitle: relation.targetTitle,
    sourceType: relation.sourceType ?? undefined
  };
}

function mapReadLog(log: {
  id: string;
  projectId: string;
  userId: string;
  clientType: string | null;
  readAt: Date;
}): ProjectReadLog {
  return {
    id: log.id,
    projectId: log.projectId,
    userId: log.userId,
    clientType: log.clientType ?? "Web",
    readAt: log.readAt.toISOString()
  };
}

function mapAuditLog(log: {
  id: string;
  projectId: string;
  userId: string;
  moduleName: string;
  actionName: string;
  beforeJson: unknown;
  afterJson: unknown;
  createdAt: Date;
}): ProjectAuditLog {
  return {
    id: log.id,
    projectId: log.projectId,
    userId: log.userId,
    moduleName: log.moduleName,
    actionName: log.actionName,
    beforeJson: (log.beforeJson as Record<string, unknown> | null) ?? undefined,
    afterJson: (log.afterJson as Record<string, unknown> | null) ?? undefined,
    createdAt: log.createdAt.toISOString()
  };
}

function mapUrge(urge: {
  id: string;
  projectId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
}): ProjectUrge {
  return {
    id: urge.id,
    projectId: urge.projectId,
    senderId: urge.senderId,
    receiverIds: [urge.receiverId],
    content: urge.content,
    createdAt: urge.createdAt.toISOString()
  };
}

function mapForward(forward: {
  id: string;
  projectId: string;
  senderId: string;
  receiverIds: unknown;
  message: string | null;
  createdAt: Date;
}): ProjectForward {
  return {
    id: forward.id,
    projectId: forward.projectId,
    senderId: forward.senderId,
    receiverIds: Array.isArray(forward.receiverIds) ? (forward.receiverIds as string[]) : [],
    message: forward.message ?? undefined,
    createdAt: forward.createdAt.toISOString()
  };
}

async function withFallback<T>(query: () => QueryResult<T>, fallback: () => T | Promise<T>) {
  if (!isDatabaseConfigured()) {
    return fallback();
  }

  try {
    return await query();
  } catch (error) {
    console.warn("Database query failed, falling back to mock data.", error);
    return fallback();
  }
}

export async function listProjectsData(filters?: {
  keyword?: string;
  status?: ProjectStatus;
  ownerId?: string;
  sortBy?: "updatedAt" | "createdAt" | "endDate" | "name";
  sortOrder?: "asc" | "desc";
}) {
  return withFallback(
    async () => {
      const projects = await prisma.project.findMany({
        where: {
          name: filters?.keyword
            ? {
                contains: filters.keyword
              }
            : undefined,
          status: filters?.status || undefined,
          ownerId: filters?.ownerId || undefined
        },
        include: {
          tags: true,
          members: true
        },
        orderBy: {
          [filters?.sortBy ?? "updatedAt"]: filters?.sortOrder ?? "desc"
        }
      });

      return projects.map(mapProject);
    },
    async () => {
      let projects = getProjects();
      if (filters?.keyword) {
        projects = projects.filter((project) =>
          project.name.toLowerCase().includes(filters.keyword!.toLowerCase())
        );
      }
      if (filters?.status) {
        projects = projects.filter((project) => project.status === filters.status);
      }
      if (filters?.ownerId) {
        projects = projects.filter((project) => project.ownerId === filters.ownerId);
      }
      const sortBy = filters?.sortBy ?? "updatedAt";
      const sortOrder = filters?.sortOrder ?? "desc";
      projects = [...projects].sort((left, right) => {
        const a = String(left[sortBy] ?? "");
        const b = String(right[sortBy] ?? "");
        return sortOrder === "asc" ? a.localeCompare(b) : b.localeCompare(a);
      });
      return projects;
    }
  );
}

export async function getUserData(userId?: string) {
  if (!userId) {
    return undefined;
  }

  return withFallback(
    async () => {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      return user ? mapUser(user) : undefined;
    },
    async () => getUser(userId)
  );
}

export async function getTeamStatsData(): Promise<TeamStats> {
  return withFallback(
    async () => {
      const [projects, tasks, users] = await Promise.all([
        prisma.project.findMany({
          include: {
            tags: true,
            members: true
          }
        }),
        prisma.task.findMany(),
        prisma.user.findMany()
      ]);

      const mappedProjects = projects.map(mapProject);
      const mappedTasks = tasks.map(mapTask);
      const base = calculateProjectStats(mappedTasks);
      const departments = Array.from(new Set(users.map((user) => user.department).filter(Boolean))) as string[];

      return {
        totalProjects: mappedProjects.length,
        activeProjects: mappedProjects.filter((project) => project.status === "ACTIVE").length,
        closedProjects: mappedProjects.filter((project) => project.status === "CLOSED").length,
        overdueTasks: base.overdueTasks,
        teamCompletionRate: base.completionRate,
        departmentBreakdown: departments.map((department) => {
          const userIds = users.filter((user) => user.department === department).map((user) => user.id);
          const departmentProjects = mappedProjects.filter((project) =>
            [project.ownerId, ...project.participantIds, ...project.shareUserIds].some((id) => userIds.includes(id))
          );
          const stats = calculateProjectStats(mappedTasks.filter((task) => userIds.includes(task.assigneeId ?? "")));

          return {
            name: department,
            projectCount: departmentProjects.length,
            completionRate: stats.completionRate
          };
        }),
        memberRanking: users.map((user) => {
          const stats = calculateProjectStats(mappedTasks.filter((task) => task.assigneeId === user.id));

          return {
            userId: user.id,
            doneTasks: stats.doneTasks,
            overdueTasks: stats.overdueTasks
          };
        })
      };
    },
    async () => getTeamStats()
  );
}

export async function getProjectDetailData(projectId: string): Promise<ProjectDetailData | null> {
  return withFallback(
    async () => {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          tags: true,
          members: {
            include: {
              user: true
            }
          },
          taskGroups: {
            orderBy: {
              sortOrder: "asc"
            }
          },
          tasks: {
            orderBy: {
              sortOrder: "asc"
            }
          },
          activities: {
            orderBy: {
              createdAt: "desc"
            }
          },
          relations: true,
          readLogs: {
            orderBy: {
              readAt: "desc"
            }
          },
          auditLogs: {
            orderBy: {
              createdAt: "desc"
            }
          },
          urges: {
            orderBy: {
              createdAt: "desc"
            }
          },
          forwards: {
            orderBy: {
              createdAt: "desc"
            }
          }
        }
      });

      if (!project) {
        return null;
      }

      const dependencies = await prisma.taskDependency.findMany({
        where: {
          projectId
        },
        orderBy: {
          createdAt: "asc"
        }
      });

      const mappedProject = mapProject(project);
      const mappedTasks = project.tasks.map(mapTask);
      const members = project.members.map((member) => ({
        id: member.id,
        projectId: member.projectId,
        userId: member.userId,
        roleType: member.roleType as MemberRoleType,
        joinedAt: member.joinedAt.toISOString(),
        user: mapUser(member.user)
      }));

      return {
        project: mappedProject,
        groups: project.taskGroups.map(mapTaskGroup),
        tasks: mappedTasks,
        dependencies: dependencies.map(mapDependency),
        activities: project.activities.map(mapActivity),
        stats: calculateProjectStats(mappedTasks),
        relations: project.relations.map(mapRelation),
        readLogs: project.readLogs.map(mapReadLog),
        auditLogs: project.auditLogs.map(mapAuditLog),
        participants: members.filter((member) => member.roleType !== "VIEWER"),
        viewers: members.filter((member) => member.roleType === "VIEWER"),
        urges: project.urges.map(mapUrge),
        forwards: project.forwards.map(mapForward),
        shareLink: createShareLink(projectId)
      };
    },
    async () => {
      const project = getProjectById(projectId);

      if (!project) {
        return null;
      }

      return {
        project,
        groups: getTaskGroupsByProject(projectId),
        tasks: getTasksByProject(projectId),
        dependencies: getDependenciesByProject(projectId),
        activities: getActivitiesByProject(projectId),
        stats: getProjectStats(projectId),
        relations: getRelationsByProject(projectId),
        readLogs: getReadLogsByProject(projectId),
        auditLogs: getAuditLogsByProject(projectId),
        participants: getProjectParticipants(projectId),
        viewers: getProjectViewers(projectId),
        urges: getProjectUrges(projectId),
        forwards: getProjectForwards(projectId),
        shareLink: createShareLink(projectId)
      };
    }
  );
}

export async function getTasksForProjectData(projectId: string) {
  return withFallback(
    async () => {
      const tasks = await prisma.task.findMany({
        where: { projectId },
        orderBy: {
          sortOrder: "asc"
        }
      });

      return tasks.map(mapTask);
    },
    async () => getTasksByProject(projectId)
  );
}

export async function getTaskData(taskId: string) {
  return withFallback(
    async () => {
      const task = await prisma.task.findUnique({
        where: { id: taskId }
      });

      return task ? mapTask(task) : undefined;
    },
    async () => getTaskById(taskId)
  );
}

export async function getTaskCommentsData(taskId: string): Promise<TaskComment[]> {
  return withFallback(
    async () => {
      const comments = await prisma.taskComment.findMany({
        where: { taskId },
        orderBy: {
          createdAt: "desc"
        }
      });

      return comments.map((comment) => ({
        id: comment.id,
        taskId: comment.taskId,
        userId: comment.userId,
        content: comment.content,
        createdAt: comment.createdAt.toISOString()
      }));
    },
    async () => getCommentsByTask(taskId)
  );
}

export async function createProjectData(input: {
  name: string;
  description?: string;
  ownerId: string;
  startDate?: string;
  endDate?: string;
  participantIds?: string[];
  shareUserIds?: string[];
  tags?: string[];
  visibilityScope?: Project["visibilityScope"];
}) {
  return withFallback(
    async () => {
      const project = await prisma.project.create({
        data: {
          name: input.name,
          description: input.description,
          ownerId: input.ownerId,
          creatorId: input.ownerId,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
          visibilityScope: input.visibilityScope ?? "PRIVATE",
          members: {
            create: [
              {
                userId: input.ownerId,
                roleType: "OWNER"
              },
              ...(input.participantIds ?? []).map((userId) => ({
                userId,
                roleType: "PARTICIPANT" as const
              })),
              ...(input.shareUserIds ?? []).map((userId) => ({
                userId,
                roleType: "VIEWER" as const
              }))
            ]
          },
          tags: {
            create: (input.tags ?? []).map((tagName) => ({
              tagName
            }))
          }
        },
        include: {
          tags: true,
          members: true
        }
      });

      return mapProject(project);
    },
    async (): Promise<Project> => ({
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description,
      ownerId: input.ownerId,
      creatorId: input.ownerId,
      startDate: input.startDate,
      endDate: input.endDate,
      status: "ACTIVE",
      visibilityScope: input.visibilityScope ?? "PRIVATE",
      tags: input.tags ?? [],
      participantIds: input.participantIds ?? [],
      shareUserIds: input.shareUserIds ?? [],
      reminderConfigJson: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  );
}
