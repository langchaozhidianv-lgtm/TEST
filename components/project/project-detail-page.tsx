import { ActivityFeed } from "@/components/project/activity-feed";
import { AuditLogPanel } from "@/components/project/audit-log-panel";
import { CollaborationPanel } from "@/components/project/collaboration-panel";
import { GanttView } from "@/components/project/gantt-view";
import { MemberPanel } from "@/components/project/member-panel";
import { RelationPanel } from "@/components/project/relation-panel";
import { StatsPanel } from "@/components/project/stats-panel";
import { TaskBoard } from "@/components/project/task-board";
import { formatDate } from "@/lib/format";
import { getUser } from "@/lib/mock-data";
import type {
  Project,
  ProjectActivity,
  ProjectAuditLog,
  ProjectReadLog,
  ProjectRelation,
  ProjectStats,
  ProjectForward,
  ProjectMemberRecord,
  ProjectShareLink,
  ProjectUrge,
  Task,
  TaskDependency,
  TaskGroup
} from "@/lib/types";

interface ProjectDetailPageProps {
  project: Project;
  groups: TaskGroup[];
  tasks: Task[];
  dependencies: TaskDependency[];
  activities: ProjectActivity[];
  stats: ProjectStats;
  relations: ProjectRelation[];
  readLogs: ProjectReadLog[];
  auditLogs: ProjectAuditLog[];
  participants: Array<ProjectMemberRecord & { user?: ReturnType<typeof getUser> }>;
  viewers: Array<ProjectMemberRecord & { user?: ReturnType<typeof getUser> }>;
  urges: ProjectUrge[];
  forwards: ProjectForward[];
  shareLink: ProjectShareLink;
}

export function ProjectDetailPage(props: ProjectDetailPageProps) {
  const owner = getUser(props.project.ownerId);
  const creator = getUser(props.project.creatorId);

  return (
    <main className="page-shell">
      <section className="hero-panel detail-hero">
        <div>
          <p className="eyebrow">项目详情</p>
          <h1>{props.project.name}</h1>
          <p className="hero-copy">{props.project.description}</p>
        </div>
        <div className="detail-meta">
          <div>
            <span className="muted">状态</span>
            <strong className={`status-badge status-${props.project.status.toLowerCase()}`}>
              {props.project.status}
            </strong>
          </div>
          <div>
            <span className="muted">负责人</span>
            <strong>{owner?.name ?? "--"}</strong>
          </div>
          <div>
            <span className="muted">创建人</span>
            <strong>{creator?.name ?? "--"}</strong>
          </div>
          <div>
            <span className="muted">周期</span>
            <strong>
              {formatDate(props.project.startDate)} - {formatDate(props.project.endDate)}
            </strong>
          </div>
        </div>
      </section>

      <StatsPanel stats={props.stats} />
      <MemberPanel participants={props.participants} viewers={props.viewers} />
      <TaskBoard groups={props.groups} tasks={props.tasks} />
      <GanttView dependencies={props.dependencies} project={props.project} tasks={props.tasks} />
      <CollaborationPanel forwards={props.forwards} shareLink={props.shareLink} urges={props.urges} />
      <ActivityFeed activities={props.activities} />
      <RelationPanel relations={props.relations} />
      <AuditLogPanel auditLogs={props.auditLogs} readLogs={props.readLogs} />
    </main>
  );
}
