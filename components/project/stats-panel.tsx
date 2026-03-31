"use client";

import { useLanguage } from "@/components/language-provider";
import { percentage } from "@/lib/format";
import type { ProjectStats } from "@/lib/types";

interface StatsPanelProps {
  stats: ProjectStats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const { locale } = useLanguage();

  return (
    <section className="section-block">
      <div className="section-title">
        <div>
          <p className="eyebrow">{locale === "zh" ? "项目统计" : "Project Stats"}</p>
          <h2>{locale === "zh" ? "单项目统计概览" : "Single project metrics"}</h2>
        </div>
      </div>
      <div className="stats-grid">
        <article className="stat-card">
          <span>{locale === "zh" ? "任务总数" : "Total Tasks"}</span>
          <strong>{stats.totalTasks}</strong>
        </article>
        <article className="stat-card">
          <span>{locale === "zh" ? "已完成" : "Done"}</span>
          <strong>{stats.doneTasks}</strong>
        </article>
        <article className="stat-card">
          <span>{locale === "zh" ? "进行中" : "In Progress"}</span>
          <strong>{stats.inProgressTasks}</strong>
        </article>
        <article className="stat-card">
          <span>{locale === "zh" ? "延期" : "Overdue"}</span>
          <strong>{stats.overdueTasks}</strong>
        </article>
        <article className="stat-card accent-card">
          <span>{locale === "zh" ? "完成率" : "Completion Rate"}</span>
          <strong>{percentage(stats.completionRate)}</strong>
        </article>
      </div>
    </section>
  );
}
