import { percentage } from "@/lib/format";
import type { ProjectStats } from "@/lib/types";

interface StatsPanelProps {
  stats: ProjectStats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <section className="section-block">
      <div className="section-title">
        <div>
          <p className="eyebrow">项目统计</p>
          <h2>单项目统计口径示例</h2>
        </div>
      </div>
      <div className="stats-grid">
        <article className="stat-card">
          <span>任务总数</span>
          <strong>{stats.totalTasks}</strong>
        </article>
        <article className="stat-card">
          <span>已完成</span>
          <strong>{stats.doneTasks}</strong>
        </article>
        <article className="stat-card">
          <span>进行中</span>
          <strong>{stats.inProgressTasks}</strong>
        </article>
        <article className="stat-card">
          <span>延期</span>
          <strong>{stats.overdueTasks}</strong>
        </article>
        <article className="stat-card accent-card">
          <span>完成率</span>
          <strong>{percentage(stats.completionRate)}</strong>
        </article>
      </div>
    </section>
  );
}
