"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useLanguage } from "@/components/language-provider";
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
import { userOptions } from "@/lib/user-options";
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
  const router = useRouter();
  const { locale } = useLanguage();
  const [showEditForm, setShowEditForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const owner = getUser(props.project.ownerId);
  const creator = getUser(props.project.creatorId);

  async function refreshPage() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleProjectUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await fetch(`/api/projects/${props.project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") ?? props.project.name),
        description: String(formData.get("description") ?? props.project.description ?? ""),
        ownerId: String(formData.get("ownerId") ?? props.project.ownerId),
        visibilityScope: String(formData.get("visibilityScope") ?? props.project.visibilityScope),
        startDate: formData.get("startDate") ? new Date(String(formData.get("startDate"))).toISOString() : null,
        endDate: formData.get("endDate") ? new Date(String(formData.get("endDate"))).toISOString() : null,
        tags: String(formData.get("tags") ?? "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      })
    });
    setShowEditForm(false);
    await refreshPage();
  }

  async function handleProjectDelete() {
    if (!window.confirm(locale === "zh" ? "确认删除项目及其全部任务？" : "Delete this project and all its tasks?")) {
      return;
    }

    await fetch(`/api/projects/${props.project.id}`, { method: "DELETE" });
    router.push("/projects");
    router.refresh();
  }

  async function toggleProjectStatus() {
    await fetch(`/api/projects/${props.project.id}/${props.project.status === "CLOSED" ? "reopen" : "close"}`, {
      method: "POST"
    });
    await refreshPage();
  }

  return (
    <main className="page-shell">
      <section className="hero-panel detail-hero">
        <div>
          <p className="eyebrow">{locale === "zh" ? "项目详情" : "Project Detail"}</p>
          <h1>{props.project.name}</h1>
          <p className="hero-copy">{props.project.description}</p>
          <div className="hero-actions">
            <button className="action-button" onClick={() => setShowEditForm((value) => !value)} type="button">
              {showEditForm ? (locale === "zh" ? "关闭编辑" : "Close Edit") : locale === "zh" ? "编辑项目" : "Edit Project"}
            </button>
            <button className="action-button secondary-button" onClick={toggleProjectStatus} type="button">
              {props.project.status === "CLOSED"
                ? locale === "zh"
                  ? "重开项目"
                  : "Reopen Project"
                : locale === "zh"
                  ? "关闭项目"
                  : "Close Project"}
            </button>
            <button className="action-button secondary-button" disabled={isPending} onClick={handleProjectDelete} type="button">
              {locale === "zh" ? "删除项目" : "Delete Project"}
            </button>
          </div>
          {showEditForm ? (
            <form className="inline-form" onSubmit={handleProjectUpdate}>
              <input defaultValue={props.project.name} name="name" required />
              <input
                defaultValue={props.project.description}
                name="description"
                placeholder={locale === "zh" ? "项目描述" : "Description"}
              />
              <select defaultValue={props.project.ownerId} name="ownerId">
                {userOptions.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <select defaultValue={props.project.visibilityScope} name="visibilityScope">
                <option value="PRIVATE">{locale === "zh" ? "私有" : "Private"}</option>
                <option value="TEAM">{locale === "zh" ? "团队" : "Team"}</option>
                <option value="SPECIFIC">{locale === "zh" ? "指定成员" : "Specific"}</option>
                <option value="PUBLIC">{locale === "zh" ? "公开" : "Public"}</option>
              </select>
              <input defaultValue={props.project.startDate?.slice(0, 10)} name="startDate" type="date" />
              <input defaultValue={props.project.endDate?.slice(0, 10)} name="endDate" type="date" />
              <input defaultValue={props.project.tags.join(", ")} name="tags" placeholder={locale === "zh" ? "标签，逗号分隔" : "tags,comma,separated"} />
              <button className="action-button" disabled={isPending} type="submit">
                {isPending ? (locale === "zh" ? "保存中..." : "Saving...") : locale === "zh" ? "保存项目" : "Save Project"}
              </button>
            </form>
          ) : null}
        </div>
        <div className="detail-meta">
          <div>
            <span className="muted">{locale === "zh" ? "状态" : "Status"}</span>
            <strong className={`status-badge status-${props.project.status.toLowerCase()}`}>{props.project.status}</strong>
          </div>
          <div>
            <span className="muted">{locale === "zh" ? "负责人" : "Owner"}</span>
            <strong>{owner?.name ?? "--"}</strong>
          </div>
          <div>
            <span className="muted">{locale === "zh" ? "创建人" : "Creator"}</span>
            <strong>{creator?.name ?? "--"}</strong>
          </div>
          <div>
            <span className="muted">{locale === "zh" ? "周期" : "Timeline"}</span>
            <strong>
              {formatDate(props.project.startDate)} - {formatDate(props.project.endDate)}
            </strong>
          </div>
        </div>
      </section>

      <StatsPanel stats={props.stats} />
      <MemberPanel onChanged={refreshPage} participants={props.participants} projectId={props.project.id} viewers={props.viewers} />
      <TaskBoard groups={props.groups} onChanged={refreshPage} projectId={props.project.id} tasks={props.tasks} />
      <GanttView dependencies={props.dependencies} onChanged={refreshPage} project={props.project} projectId={props.project.id} tasks={props.tasks} />
      <CollaborationPanel forwards={props.forwards} onChanged={refreshPage} projectId={props.project.id} shareLink={props.shareLink} urges={props.urges} />
      <ActivityFeed activities={props.activities} />
      <RelationPanel onChanged={refreshPage} projectId={props.project.id} relations={props.relations} />
      <AuditLogPanel auditLogs={props.auditLogs} readLogs={props.readLogs} />
    </main>
  );
}
