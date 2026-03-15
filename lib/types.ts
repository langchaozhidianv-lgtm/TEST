export type ProjectStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED";
export type ProjectVisibility = "PRIVATE" | "SPECIFIC" | "TEAM" | "PUBLIC";
export type MemberRoleType = "OWNER" | "PARTICIPANT" | "VIEWER" | "FOLLOWER";
export type TaskStatus =
  | "TODO"
  | "READY"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "DONE"
  | "CANCELED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type DependencyType = "FS" | "SS" | "FF" | "SF";
export type RelationType =
  | "DOCUMENT"
  | "CUSTOMER"
  | "OPPORTUNITY"
  | "APPROVAL"
  | "SCHEDULE"
  | "DATA"
  | "PROJECT"
  | "OTHER";
export type ActivityType =
  | "PROJECT_CREATED"
  | "PROJECT_UPDATED"
  | "PROJECT_CLOSED"
  | "PROJECT_REOPENED"
  | "MEMBER_ADDED"
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_MOVED"
  | "TASK_COMPLETED"
  | "TASK_DATES_UPDATED"
  | "TASK_DEPENDENCY_CREATED"
  | "TASK_DEPENDENCY_DELETED"
  | "COMMENT_ADDED"
  | "RELATION_ADDED"
  | "URGED"
  | "FORWARDED";

export interface User {
  id: string;
  name: string;
  email?: string;
  department?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  creatorId: string;
  startDate?: string;
  endDate?: string;
  status: ProjectStatus;
  visibilityScope: ProjectVisibility;
  tags: string[];
  participantIds: string[];
  shareUserIds: string[];
  reminderConfigJson?: Record<string, unknown>;
  updatedAt: string;
  createdAt: string;
}

export interface TaskGroup {
  id: string;
  projectId: string;
  name: string;
  sortOrder: number;
  isDefault: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  groupId?: string;
  title: string;
  description?: string;
  assigneeId?: string;
  reporterId?: string;
  priority: TaskPriority;
  status: TaskStatus;
  progressPercent: number;
  startAt?: string;
  endAt?: string;
  dueAt?: string;
  sortOrder: number;
  completedAt?: string;
}

export interface TaskDependency {
  id: string;
  projectId: string;
  predecessorTaskId: string;
  successorTaskId: string;
  dependencyType: DependencyType;
  lagDays: number;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface ProjectActivity {
  id: string;
  projectId: string;
  actorId: string;
  activityType: ActivityType;
  contentSummary: string;
  createdAt: string;
}

export interface ProjectRelation {
  id: string;
  projectId: string;
  relationType: RelationType;
  targetId: string;
  targetTitle: string;
  sourceType?: string;
}

export interface ProjectReadLog {
  id: string;
  projectId: string;
  userId: string;
  clientType: string;
  readAt: string;
}

export interface ProjectAuditLog {
  id: string;
  projectId: string;
  userId: string;
  moduleName: string;
  actionName: string;
  beforeJson?: Record<string, unknown>;
  afterJson?: Record<string, unknown>;
  createdAt: string;
}

export interface ProjectStats {
  totalTasks: number;
  doneTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export interface TeamStats {
  totalProjects: number;
  activeProjects: number;
  closedProjects: number;
  teamCompletionRate: number;
  overdueTasks: number;
  departmentBreakdown: Array<{
    name: string;
    projectCount: number;
    completionRate: number;
  }>;
  memberRanking: Array<{
    userId: string;
    doneTasks: number;
    overdueTasks: number;
  }>;
}

export interface ProjectMemberRecord {
  id: string;
  projectId: string;
  userId: string;
  roleType: MemberRoleType;
  joinedAt: string;
}

export interface ProjectUrge {
  id: string;
  projectId: string;
  senderId: string;
  receiverIds: string[];
  content: string;
  createdAt: string;
}

export interface ProjectForward {
  id: string;
  projectId: string;
  senderId: string;
  receiverIds: string[];
  message?: string;
  createdAt: string;
}

export interface ProjectShareLink {
  projectId: string;
  url: string;
  expireAt: string;
}
