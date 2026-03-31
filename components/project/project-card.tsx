"use client";

import Link from "next/link";

import { useLanguage } from "@/components/language-provider";
import { formatDate } from "@/lib/format";
import { getProjectStats, getUser } from "@/lib/mock-data";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { locale } = useLanguage();
  const owner = getUser(project.ownerId);
  const stats = getProjectStats(project.id);

  return (
    <Link className="project-card" href={`/projects/${project.id}`}>
      <div className="card-topline">
        <span className={`status-badge status-${project.status.toLowerCase()}`}>{project.status}</span>
        <span className="muted">{owner?.name ?? (locale === "zh" ? "未分配负责人" : "No owner")}</span>
      </div>
      <h3>{project.name}</h3>
      <p>{project.description}</p>
      <div className="meta-grid">
        <span>{locale === "zh" ? "周期" : "Timeline"}</span>
        <strong>
          {formatDate(project.startDate)} - {formatDate(project.endDate)}
        </strong>
        <span>{locale === "zh" ? "任务进度" : "Task Progress"}</span>
        <strong>
          {stats.doneTasks}/{stats.totalTasks} {locale === "zh" ? "已完成" : "done"}
        </strong>
        <span>{locale === "zh" ? "最后更新" : "Updated"}</span>
        <strong>{formatDate(project.updatedAt)}</strong>
      </div>
      <div className="chip-row">
        {project.tags.map((tag) => (
          <span className="tag-pill" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
