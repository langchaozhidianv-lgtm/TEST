import Link from "next/link";

import { percentage } from "@/lib/format";
import { getUser } from "@/lib/mock-data";
import type { TeamStats } from "@/lib/types";

interface TeamStatsPageProps {
  stats: TeamStats;
}

export function TeamStatsPage({ stats }: TeamStatsPageProps) {
  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">团队统计</p>
          <h1>从项目池进入管理视角，查看跨团队执行情况。</h1>
          <p className="hero-copy">这个页面对应二期里的“团队项目统计报表”，先把核心统计指标和排行视图落地。</p>
        </div>
        <div className="stats-grid">
          <article className="stat-card">
            <span>项目总数</span>
            <strong>{stats.totalProjects}</strong>
          </article>
          <article className="stat-card">
            <span>进行中项目</span>
            <strong>{stats.activeProjects}</strong>
          </article>
          <article className="stat-card">
            <span>关闭项目</span>
            <strong>{stats.closedProjects}</strong>
          </article>
          <article className="stat-card">
            <span>延期任务</span>
            <strong>{stats.overdueTasks}</strong>
          </article>
          <article className="stat-card accent-card">
            <span>团队完成率</span>
            <strong>{percentage(stats.teamCompletionRate)}</strong>
          </article>
        </div>
      </section>

      <section className="section-block two-column-section">
        <div>
          <div className="section-title">
            <div>
              <p className="eyebrow">部门维度</p>
              <h2>项目与完成率分布</h2>
            </div>
          </div>
          <div className="list-panel">
            {stats.departmentBreakdown.map((item) => (
              <article className="list-row" key={item.name}>
                <strong>{item.name}</strong>
                <span>{item.projectCount} 个项目</span>
                <span className="muted">{percentage(item.completionRate)}</span>
              </article>
            ))}
          </div>
        </div>

        <div>
          <div className="section-title">
            <div>
              <p className="eyebrow">人员排行</p>
              <h2>完成与延期 TOP</h2>
            </div>
          </div>
          <div className="list-panel">
            {stats.memberRanking.map((item) => (
              <article className="list-row" key={item.userId}>
                <strong>{getUser(item.userId)?.name ?? item.userId}</strong>
                <span>完成 {item.doneTasks}</span>
                <span className="muted">延期 {item.overdueTasks}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-title">
          <div>
            <p className="eyebrow">导航</p>
            <h2>回到项目主流程</h2>
          </div>
        </div>
        <div className="chip-row">
          <Link className="chip" href="/projects">
            项目列表
          </Link>
          <Link className="chip" href="/projects/project_1">
            CRM 二期项目
          </Link>
        </div>
      </section>
    </main>
  );
}
