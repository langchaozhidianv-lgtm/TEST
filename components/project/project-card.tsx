import Link from "next/link";

import { formatDate } from "@/lib/format";
import { getProjectStats, getUser } from "@/lib/mock-data";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const owner = getUser(project.ownerId);
  const stats = getProjectStats(project.id);

  return (
    <Link className="project-card" href={`/projects/${project.id}`}>
      <div className="card-topline">
        <span className={`status-badge status-${project.status.toLowerCase()}`}>{project.status}</span>
        <span className="muted">{owner?.name ?? "未分配负责人"}</span>
      </div>
      <h3>{project.name}</h3>
      <p>{project.description}</p>
      <div className="meta-grid">
        <span>周期</span>
        <strong>
          {formatDate(project.startDate)} - {formatDate(project.endDate)}
        </strong>
        <span>任务进度</span>
        <strong>
          {stats.doneTasks}/{stats.totalTasks} 已完成
        </strong>
        <span>最后更新</span>
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
